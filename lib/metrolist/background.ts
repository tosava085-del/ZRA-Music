import type { BackgroundPopupMode } from './types';

export interface PopupCapabilities {
  hasDocumentPiP: boolean;
  hasVideoPiP: boolean;
  inIframe: boolean;
}

/**
 * Resolves the optimal browser popup strategy for the iPhone 17-18 Pro
 * Dynamic Island background player.
 *
 * Cascade:
 * 1. 'document-pip' (Chrome/Edge/Arc desktop always-on-top interactive browser popup)
 * 2. 'video-pip' (Safari / iOS / Android / Firefox canvas-streamed system PiP)
 * 3. 'floating-overlay' (resilient in-viewport draggable Dynamic Island Pro when OS PiP is unavailable or restricted in iframe)
 */
export function resolveBackgroundPopupStrategy(
  caps: PopupCapabilities
): Exclude<BackgroundPopupMode, 'off'> {
  if (caps.hasDocumentPiP && !caps.inIframe) {
    return 'document-pip';
  }
  if (caps.hasVideoPiP) {
    return 'video-pip';
  }
  return 'floating-overlay';
}

export interface BackgroundRecoveryInput {
  backgroundPlayEnabled: boolean;
  intendedPlaying: boolean;
  userPaused: boolean;
  visibilityHidden: boolean;
  popupActive?: boolean;
  ytState: 'playing' | 'paused' | 'buffering' | 'ended' | 'unstarted';
}

export const BACKGROUND_RECOVERY_DELAYS_MS = [0, 180, 480, 950, 1600] as const;

/**
 * Determines whether the player should automatically resume YouTube playback
 * when a mobile/desktop browser involuntarily pauses an embedded player upon
 * tab switch, backgrounding, or entering Picture-in-Picture popup mode.
 */
export function shouldAutoRecoverBackgroundPlayback(
  input: BackgroundRecoveryInput
): boolean {
  if (!input.backgroundPlayEnabled) return false;
  if (!input.intendedPlaying) return false;
  if (input.userPaused) return false;
  if (!input.visibilityHidden && !input.popupActive) return false;
  return input.ytState === 'paused' || input.ytState === 'unstarted';
}

/**
 * Wall-clock drift-corrected elapsed time computation.
 * Prevents background tab timer throttling (browsers throttle setInterval to >=1000ms)
 * from stalling lyrics sync, progress bars, or auto-advance.
 */
export function computeElapsedWithDrift(
  prevTime: number,
  lastTickMs: number,
  nowMs: number,
  playbackRate: number,
  maxDuration: number
): { nextTime: number; reachedEnd: boolean } {
  const safeRate = Number.isFinite(playbackRate) && playbackRate > 0 ? playbackRate : 1;
  const safeMax = Number.isFinite(maxDuration) && maxDuration > 0 ? maxDuration : 210;
  const deltaSec = Math.max(0, Math.min(30, (nowMs - lastTickMs) / 1000));
  const rawNext = Math.max(0, prevTime) + deltaSec * safeRate;

  if (rawNext >= safeMax) {
    return { nextTime: 0, reachedEnd: true };
  }
  return { nextTime: rawNext, reachedEnd: false };
}

/**
 * Safely clamps values for navigator.mediaSession.setPositionState()
 * so browsers never throw RangeError when position > duration or duration <= 0.
 */
export function buildMediaSessionPosition(
  currentTime: number,
  duration: number,
  playbackRate: number
): { duration: number; playbackRate: number; position: number } | null {
  if (!Number.isFinite(duration) || duration <= 0) return null;
  const safeRate = Number.isFinite(playbackRate) && playbackRate > 0 ? playbackRate : 1;
  const clampedPos = Math.max(
    0,
    Math.min(duration, Number.isFinite(currentTime) ? currentTime : 0)
  );
  return {
    duration,
    playbackRate: safeRate,
    position: clampedPos,
  };
}

/**
 * Generates a tiny valid silent PCM WAV data URI (1 second, 8kHz mono 8-bit silence).
 * Used as an ultra-lightweight background audio session anchor so mobile & desktop
 * browsers preserve the Media Session lockscreen & OS audio focus across tab switches.
 */
export function createSilentWavDataUri(): string {
  const sampleRate = 8000;
  const numSamples = 4000; // 0.5s silent loop -> ~4KB total
  const dataSize = numSamples;
  const buffer = new Uint8Array(44 + dataSize);
  const view = new DataView(buffer.buffer);

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      buffer[offset + i] = str.charCodeAt(i);
    }
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate, true); // byte rate
  view.setUint16(32, 1, true); // block align
  view.setUint16(34, 8, true); // 8-bit unsigned PCM
  writeStr(36, 'data');
  view.setUint32(40, dataSize, true);

  // 8-bit unsigned PCM silence is 128 (0x80)
  buffer.fill(128, 44);

  let binary = '';
  for (let i = 0; i < buffer.length; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  const base64 =
    typeof btoa === 'function'
      ? btoa(binary)
      : Buffer.from(buffer).toString('base64');
  return `data:audio/wav;base64,${base64}`;
}

export interface DynamicIslandCanvasState {
  title: string;
  artist: string;
  lyricLine: string | null;
  progress: number; // 0..100
  timeLabel: string;
  remainingLabel: string;
  isPlaying: boolean;
  accentColor: string;
  artworkImg: HTMLImageElement | null;
  frameTick: number;
}

/**
 * Draws an iPhone 17-18 Pro obsidian Dynamic Island card onto an HTMLCanvasElement
 * for Video Picture-in-Picture mode (Safari, iOS, Android Chrome, Firefox).
 */
export function renderDynamicIslandToCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: DynamicIslandCanvasState
): void {
  ctx.clearRect(0, 0, width, height);

  // Edge-to-edge obsidian surface (blends seamlessly with Android/iOS OS PiP rounded frame)
  ctx.fillStyle = '#0B0C11';
  ctx.fillRect(0, 0, width, height);

  // Ambient Dynamic Theme Color radial mist behind artwork
  const grad = ctx.createRadialGradient(110, 75, 10, 180, 95, 310);
  grad.addColorStop(0, `${state.accentColor}44`);
  grad.addColorStop(1, 'rgba(11, 12, 17, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Subtle inset glass hairline
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(6, 6, width - 12, height - 12, 24);
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
  ctx.stroke();
  ctx.restore();

  // Artwork rounded square
  const artX = 34;
  const artY = 34;
  const artSize = 92;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(artX, artY, artSize, artSize, 20);
  ctx.clip();
  if (state.artworkImg && state.artworkImg.complete && state.artworkImg.naturalWidth > 0) {
    // Center crop to eliminate any 4:3 letterbox bars
    const iw = state.artworkImg.naturalWidth;
    const ih = state.artworkImg.naturalHeight;
    const minSide = Math.min(iw, ih) * 0.78;
    const sx = (iw - minSide) / 2;
    const sy = (ih - minSide) / 2;
    ctx.drawImage(state.artworkImg, sx, sy, minSide, minSide, artX, artY, artSize, artSize);
  } else {
    ctx.fillStyle = '#23252C';
    ctx.fillRect(artX, artY, artSize, artSize);
    ctx.fillStyle = state.accentColor;
    ctx.font = 'bold 36px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('♪', artX + artSize / 2, artY + artSize / 2);
  }
  ctx.restore();

  // Title & Artist
  const textX = artX + artSize + 22;
  const maxTextW = width - textX - 88;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 26px system-ui, -apple-system, sans-serif';
  ctx.fillText(truncateCanvasText(ctx, state.title, maxTextW), textX, 66);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.68)';
  ctx.font = '500 18px system-ui, -apple-system, sans-serif';
  ctx.fillText(truncateCanvasText(ctx, state.artist, maxTextW), textX, 95);

  if (state.lyricLine) {
    ctx.fillStyle = state.accentColor;
    ctx.font = '500 15px system-ui, -apple-system, sans-serif';
    ctx.fillText(truncateCanvasText(ctx, state.lyricLine, maxTextW + 40), textX, 122);
  } else {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.42)';
    ctx.font = '500 14px system-ui, -apple-system, sans-serif';
    ctx.fillText(
      state.isPlaying ? 'Playing in Background · ZRA' : 'Paused · ZRA',
      textX,
      122
    );
  }

  // 4-Bar Pro Waveform top right
  const eqBaseX = width - 66;
  const eqBaseY = 76;
  const barHeights = state.isPlaying
    ? [
        10 + ((state.frameTick * 7) % 18),
        14 + ((state.frameTick * 11 + 5) % 20),
        12 + ((state.frameTick * 5 + 11) % 18),
        8 + ((state.frameTick * 9 + 3) % 16),
      ]
    : [8, 12, 10, 7];

  ctx.fillStyle = state.accentColor;
  barHeights.forEach((h, idx) => {
    const bx = eqBaseX + idx * 8;
    ctx.beginPath();
    ctx.roundRect(bx, eqBaseY - h, 4.5, h, 3);
    ctx.fill();
  });

  // Progress bar along bottom of island
  const barX = 36;
  const barY = height - 62;
  const barW = width - 72;
  const barH = 7;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
  ctx.beginPath();
  ctx.roundRect(barX, barY, barW, barH, 4);
  ctx.fill();

  const fillW = Math.max(8, (barW * Math.max(0, Math.min(100, state.progress))) / 100);
  ctx.fillStyle = state.accentColor;
  ctx.beginPath();
  ctx.roundRect(barX, barY, fillW, barH, 4);
  ctx.fill();

  // Timestamps
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.font = '500 15px ui-monospace, SFMono-Regular, monospace';
  ctx.textAlign = 'left';
  ctx.fillText(state.timeLabel, barX, height - 32);

  ctx.textAlign = 'right';
  ctx.fillText(`-${state.remainingLabel}`, barX + barW, height - 32);
}

function truncateCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let truncated = text;
  while (truncated.length > 1 && ctx.measureText(`${truncated}…`).width > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return `${truncated}…`;
}
