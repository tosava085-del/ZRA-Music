'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import {
  ChevronDown,
  ChevronUp,
  GripHorizontal,
  Heart,
  Maximize2,
  MessageSquareQuote,
  Pause,
  Play,
  Radio,
  SkipBack,
  SkipForward,
  X,
} from 'lucide-react';
import { ArtworkImage } from './ArtworkImage';
import { useMusic } from './MusicProvider';
import {
  renderDynamicIslandToCanvas,
  resolveBackgroundPopupStrategy,
} from '@/lib/metrolist/background';
import { findActiveLyricIndex, formatDuration } from '@/lib/metrolist/lyrics';
import { resolveMetrolistTheme } from '@/lib/metrolist/theme';
import { cn } from '@/lib/utils';

declare global {
  interface DocumentPictureInPictureApi {
    requestWindow: (opts?: { width?: number; height?: number }) => Promise<Window>;
    window?: Window | null;
  }
  interface Window {
    documentPictureInPicture?: DocumentPictureInPictureApi;
  }
}

interface DynamicIslandProSurfaceProps {
  compact: boolean;
  onToggleCompact: () => void;
  onClose: () => void;
  modeLabel: string;
  accentColor: string;
  inExternalWindow?: boolean;
}

function DynamicIslandProSurface({
  compact,
  onToggleCompact,
  onClose,
  modeLabel,
  accentColor,
  inExternalWindow = false,
}: DynamicIslandProSurfaceProps) {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    togglePlayPause,
    nextTrack,
    prevTrack,
    seekTo,
    isLiked,
    toggleLike,
    lyrics,
    setIsNowPlayingOpen,
    setNowPlayingTab,
  } = useMusic();

  const activeLyric = useMemo(() => {
    if (!lyrics?.synced || lyrics.lines.length === 0) return null;
    const idx = findActiveLyricIndex(lyrics.lines, currentTime);
    return idx >= 0 ? lyrics.lines[idx]?.text ?? null : null;
  }, [lyrics, currentTime]);

  if (!currentTrack) return null;

  const liked = isLiked(currentTrack.videoId);
  const progress =
    duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;
  const remainingSec = Math.max(0, duration - currentTime);

  if (compact && !inExternalWindow) {
    return (
      <div
        aria-label="Floating Dynamic Island Pro compact"
        className="w-[min(300px,calc(100vw-24px))] h-11 pl-2 pr-2.5 rounded-full dynamic-island-glass text-white flex items-center gap-2.5 relative overflow-hidden select-none"
      >
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-3.5 right-3.5 h-[2px] bg-white/10 rounded-full overflow-hidden"
        >
          <div
            className="h-full"
            style={{ width: `${progress}%`, backgroundColor: accentColor }}
          />
        </div>

        <ArtworkImage
          src={currentTrack.thumbnail}
          alt={currentTrack.title}
          className="w-7 h-7 shrink-0"
          rounded="rounded-full"
          sizeHint="sm"
        />

        <button
          type="button"
          onClick={onToggleCompact}
          aria-label="Expand Floating Dynamic Island Pro"
          className="min-w-0 flex-1 text-left"
        >
          <p className="text-xs font-semibold text-white truncate leading-tight">
            {currentTrack.title}
          </p>
          <p className="text-[10px] text-white/60 truncate leading-tight">
            {activeLyric || currentTrack.artist}
          </p>
        </button>

        <button
          type="button"
          onClick={togglePlayPause}
          aria-label={isPlaying ? 'Popup pause' : 'Popup play'}
          className="w-7 h-7 rounded-full bg-white text-slate-950 flex items-center justify-center shrink-0 hover:scale-105 transition-transform"
        >
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5 fill-current" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
          )}
        </button>

        <button
          type="button"
          onClick={onToggleCompact}
          aria-label="Expand popup controls"
          className="w-7 h-7 rounded-full text-white/70 hover:text-white hover:bg-white/10 flex items-center justify-center shrink-0"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close Dynamic Island popup"
          className="w-7 h-7 rounded-full text-white/65 hover:text-white hover:bg-white/10 flex items-center justify-center shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // Full iPhone 17-18 Pro Dynamic Island Card (used inside Document PiP window AND Floating Overlay)
  return (
    <section
      aria-label="Dynamic Island Pro background popup"
      className={cn(
        'text-white select-none',
        inExternalWindow
          ? 'w-full min-h-screen bg-[#090A0F] p-4 flex flex-col justify-between gap-3'
          : 'w-[min(372px,calc(100vw-24px))] rounded-[30px] dynamic-island-glass p-4 space-y-3'
      )}
      style={
        inExternalWindow
          ? {
              backgroundImage: `radial-gradient(ellipse 90% 60% at 50% 0%, ${accentColor}26 0%, transparent 70%)`,
            }
          : undefined
      }
    >
      {/* Top Pro Capsule Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {!inExternalWindow && (
            <GripHorizontal className="w-3.5 h-3.5 text-white/40 shrink-0" />
          )}
          <Radio
            className="w-3.5 h-3.5 shrink-0"
            style={{ color: accentColor }}
          />
          <span className="text-[11px] font-medium text-white/70 truncate">
            {modeLabel}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {!inExternalWindow && (
            <button
              type="button"
              onClick={onToggleCompact}
              aria-label="Minimize Floating Dynamic Island Pro"
              className="w-7 h-7 rounded-full text-white/65 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Dynamic Island popup"
            className="w-7 h-7 rounded-full text-white/65 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Track Artwork, Title, Artist & 4-Bar Live Equalizer */}
      <div className="flex items-center gap-3">
        <ArtworkImage
          src={currentTrack.thumbnail}
          alt={currentTrack.title}
          className="w-12 h-12 shrink-0 shadow-lg"
          rounded="rounded-2xl"
          sizeHint="sm"
        />

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-white truncate">
            {currentTrack.title}
          </p>
          <p className="text-xs text-white/65 truncate">{currentTrack.artist}</p>
          {activeLyric && (
            <p
              className="text-[11px] font-medium truncate mt-0.5"
              style={{ color: accentColor }}
            >
              {activeLyric}
            </p>
          )}
        </div>

        {/* 4-Bar Pro Dynamic Island Waveform */}
        <div
          aria-hidden="true"
          className="flex items-end gap-[2.5px] h-4 pr-1 shrink-0"
        >
          {[0, 140, 280, 90].map((delay, i) => (
            <span
              key={`pro-eq-${i}`}
              className={cn(
                'w-[2.5px] h-full rounded-full',
                isPlaying ? 'eq-bar' : 'eq-bar-paused'
              )}
              style={{
                backgroundColor: accentColor,
                animationDelay: `${delay}ms`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Scrub Progress Bar */}
      <div className="space-y-1">
        <input
          type="range"
          min={0}
          max={Math.max(1, duration)}
          value={Math.min(currentTime, duration)}
          onChange={(e) => seekTo(Number(e.target.value))}
          aria-label="Popup playback seek"
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/15"
          style={{ accentColor }}
        />
        <div className="flex items-center justify-between text-[11px] font-mono-nums text-white/55">
          <span>{formatDuration(currentTime)}</span>
          <span>-{formatDuration(remainingSec)}</span>
        </div>
      </div>

      {/* Transport & Quick Actions */}
      <div className="flex items-center justify-between pt-0.5">
        <button
          type="button"
          onClick={() => toggleLike(currentTrack)}
          aria-label={liked ? 'Popup unlike track' : 'Popup like track'}
          className="min-h-[38px] min-w-[38px] rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <Heart
            className="w-4 h-4"
            style={
              liked
                ? { color: accentColor, fill: accentColor }
                : { color: 'rgba(255,255,255,0.72)' }
            }
          />
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prevTrack}
            aria-label="Popup previous track"
            className="min-h-[40px] min-w-[40px] rounded-full text-white/85 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <SkipBack className="w-4 h-4 fill-current" />
          </button>

          <button
            type="button"
            onClick={togglePlayPause}
            aria-label={isPlaying ? 'Popup pause' : 'Popup play'}
            className="w-10 h-10 rounded-full bg-white text-slate-950 flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={() => nextTrack(true)}
            aria-label="Popup next track"
            className="min-h-[40px] min-w-[40px] rounded-full text-white/85 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <SkipForward className="w-4 h-4 fill-current" />
          </button>
        </div>

        <div className="flex items-center gap-0.5">
          {!inExternalWindow && (
            <>
              <button
                type="button"
                onClick={() => {
                  setNowPlayingTab('lyrics');
                  setIsNowPlayingOpen(true);
                }}
                aria-label="Open full synced lyrics"
                className="min-h-[38px] min-w-[38px] rounded-full text-white/70 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <MessageSquareQuote className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setNowPlayingTab('player');
                  setIsNowPlayingOpen(true);
                }}
                aria-label="Open full player"
                className="min-h-[38px] min-w-[38px] rounded-full text-white/70 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </>
          )}
          {inExternalWindow && (
            <button
              type="button"
              onClick={() => {
                window.focus();
                setNowPlayingTab('player');
                setIsNowPlayingOpen(true);
              }}
              aria-label="Return to ZRA app"
              className="min-h-[38px] min-w-[38px] rounded-full text-white/70 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * Orchestrates the 3-tier iPhone 17-18 Pro Browser Popup Dynamic Island:
 * 1. Document Picture-in-Picture (True OS always-on-top interactive popup window)
 * 2. Canvas Video Picture-in-Picture (System PiP for Android Chrome, iOS/macOS Safari, Firefox)
 * 3. Draggable Floating Dynamic Island Pro Overlay (Resilient fallback in iframes / restricted browsers)
 */
export function DynamicIslandPopup() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    lyrics,
    settings,
    popupMode,
    setPopupMode,
    play,
    pause,
    resumePlaybackKeepAlive,
    registerPopupHandlers,
    showToast,
  } = useMusic();

  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const [compactOverlay, setCompactOverlay] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const artworkImgRef = useRef<HTMLImageElement | null>(null);
  const frameTickRef = useRef(0);
  const pipEnteredAtRef = useRef(0);
  const syncingVideoRef = useRef(false);

  const { tokens } = useMemo(
    () => resolveMetrolistTheme(settings, currentTrack),
    [settings, currentTrack]
  );

  const activeLyric = useMemo(() => {
    if (!lyrics?.synced || lyrics.lines.length === 0) return null;
    const idx = findActiveLyricIndex(lyrics.lines, currentTime);
    return idx >= 0 ? lyrics.lines[idx]?.text ?? null : null;
  }, [lyrics, currentTime]);

  // Preload CORS-safe artwork image for Canvas Video PiP
  useEffect(() => {
    if (!currentTrack?.thumbnail) {
      artworkImgRef.current = null;
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.referrerPolicy = 'no-referrer';
    img.src = currentTrack.thumbnail;
    img.onload = () => {
      artworkImgRef.current = img;
    };
    img.onerror = () => {
      artworkImgRef.current = null;
    };
  }, [currentTrack?.thumbnail]);

  const drawCanvasFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentTrack) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    frameTickRef.current += 1;
    const progress =
      duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;
    const remainingSec = Math.max(0, duration - currentTime);

    renderDynamicIslandToCanvas(ctx, canvas.width, canvas.height, {
      title: currentTrack.title,
      artist: currentTrack.artist,
      lyricLine: activeLyric,
      progress,
      timeLabel: formatDuration(currentTime),
      remainingLabel: formatDuration(remainingSec),
      isPlaying,
      accentColor: tokens.primary,
      artworkImg: artworkImgRef.current,
      frameTick: frameTickRef.current,
    });
  }, [currentTrack, currentTime, duration, activeLyric, isPlaying, tokens.primary]);

  // Keep Video PiP canvas refreshed lightly (2fps) ONLY while Video PiP is active
  useEffect(() => {
    if (popupMode !== 'video-pip') return;
    drawCanvasFrame();
    const id = setInterval(drawCanvasFrame, 500);
    return () => clearInterval(id);
  }, [popupMode, drawCanvasFrame]);

  const closePopup = useCallback(() => {
    if (pipWindow && !pipWindow.closed) {
      try {
        pipWindow.close();
      } catch {
        // ignore
      }
    }
    setPipWindow(null);

    if (typeof document !== 'undefined' && document.pictureInPictureElement) {
      document.exitPictureInPicture().catch(() => {});
    }
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setPopupMode('off');
  }, [pipWindow, setPopupMode]);

  const openPopup = useCallback(() => {
    if (!currentTrack) {
      showToast('Play a track first to launch Dynamic Island Popup');
      return;
    }

    const inIframe = (() => {
      try {
        return window.self !== window.top;
      } catch {
        return true;
      }
    })();

    const hasDocumentPiP =
      typeof window !== 'undefined' &&
      'documentPictureInPicture' in window &&
      typeof window.documentPictureInPicture?.requestWindow === 'function';

    const hasVideoPiP =
      typeof document !== 'undefined' &&
      'pictureInPictureEnabled' in document &&
      Boolean(document.pictureInPictureEnabled) &&
      typeof HTMLCanvasElement !== 'undefined' &&
      typeof HTMLCanvasElement.prototype.captureStream === 'function';

    const strategy = resolveBackgroundPopupStrategy({
      hasDocumentPiP,
      hasVideoPiP,
      inIframe,
    });

    const activateFloatingOverlay = () => {
      setCompactOverlay(false);
      setPopupMode('floating-overlay');
      showToast('Dynamic Island Pro active · Background audio ready');
    };

    const tryVideoPiP = async (): Promise<boolean> => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video || !hasVideoPiP) return false;
      try {
        drawCanvasFrame();
        if (!video.srcObject) {
          video.srcObject = canvas.captureStream(4);
        }
        pipEnteredAtRef.current = Date.now();
        syncingVideoRef.current = true;
        await video.play();
        syncingVideoRef.current = false;
        if (typeof video.requestPictureInPicture === 'function') {
          await video.requestPictureInPicture();
          pipEnteredAtRef.current = Date.now();
          setPopupMode('video-pip');
          // Immediately protect & resume YouTube audio if mobile Chrome paused it during PiP handoff
          resumePlaybackKeepAlive();
          showToast('Dynamic Island PiP active · Audio kept alive');
          return true;
        }
      } catch {
        syncingVideoRef.current = false;
        // Fallback to floating overlay
      }
      return false;
    };

    if (strategy === 'document-pip' && window.documentPictureInPicture) {
      window.documentPictureInPicture
        .requestWindow({ width: 396, height: 212 })
        .then((win) => {
          // Copy stylesheets into Document PiP window for crisp styling
          Array.from(document.styleSheets).forEach((sheet) => {
            try {
              if (sheet.href) {
                const link = win.document.createElement('link');
                link.rel = 'stylesheet';
                link.href = sheet.href;
                win.document.head.appendChild(link);
              } else {
                const style = win.document.createElement('style');
                style.textContent = Array.from(sheet.cssRules)
                  .map((r) => r.cssText)
                  .join('\n');
                win.document.head.appendChild(style);
              }
            } catch {
              // ignore cross-origin stylesheets
            }
          });

          // Preserve Next.js font variables, dark class, and Metrolist M3 CSS tokens
          win.document.documentElement.className = document.documentElement.className;
          win.document.documentElement.style.cssText = document.documentElement.style.cssText;
          win.document.body.className = document.body.className;

          win.document.title = 'ZRA · Dynamic Island Pro';
          win.document.body.style.margin = '0';
          win.document.body.style.background = '#090A0F';
          win.document.body.style.overflow = 'hidden';
          win.document.body.style.fontFamily =
            getComputedStyle(document.body).fontFamily ||
            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

          win.addEventListener('pagehide', () => {
            setPipWindow(null);
            setPopupMode('off');
          });

          setPipWindow(win);
          setPopupMode('document-pip');
          resumePlaybackKeepAlive();
          showToast('Dynamic Island Pop-out active (Always-on-top)');
        })
        .catch(async () => {
          const ok = await tryVideoPiP();
          if (!ok) activateFloatingOverlay();
        });
      return;
    }

    if (strategy === 'video-pip') {
      void tryVideoPiP().then((ok) => {
        if (!ok) activateFloatingOverlay();
      });
      return;
    }

    activateFloatingOverlay();
  }, [currentTrack, drawCanvasFrame, resumePlaybackKeepAlive, setPopupMode, showToast]);

  // Register synchronous gesture-safe popup open/close handlers in MusicProvider
  useEffect(() => {
    registerPopupHandlers({ open: openPopup, close: closePopup });
  }, [registerPopupHandlers, openPopup, closePopup]);

  // Listen for native Video PiP enter/leave + native OS PiP play/pause button gestures
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onEnterPiP = () => {
      pipEnteredAtRef.current = Date.now();
      resumePlaybackKeepAlive();
    };

    const onLeavePiP = () => {
      setPopupMode('off');
      resumePlaybackKeepAlive();
    };

    const onVideoPlay = () => {
      if (syncingVideoRef.current || popupMode !== 'video-pip') return;
      if (Date.now() - pipEnteredAtRef.current < 1200) return;
      play();
      resumePlaybackKeepAlive();
    };

    const onVideoPause = () => {
      if (syncingVideoRef.current || popupMode !== 'video-pip') return;
      if (Date.now() - pipEnteredAtRef.current < 1200) return;
      pause();
    };

    video.addEventListener('enterpictureinpicture', onEnterPiP);
    video.addEventListener('leavepictureinpicture', onLeavePiP);
    video.addEventListener('play', onVideoPlay);
    video.addEventListener('pause', onVideoPause);
    return () => {
      video.removeEventListener('enterpictureinpicture', onEnterPiP);
      video.removeEventListener('leavepictureinpicture', onLeavePiP);
      video.removeEventListener('play', onVideoPlay);
      video.removeEventListener('pause', onVideoPause);
    };
  }, [popupMode, play, pause, resumePlaybackKeepAlive, setPopupMode]);

  // Keep native Video PiP play/pause icon in sync with MusicProvider state
  useEffect(() => {
    const video = videoRef.current;
    if (!video || popupMode !== 'video-pip') return;
    syncingVideoRef.current = true;
    if (isPlaying && video.paused) {
      void video
        .play()
        .catch(() => {})
        .finally(() => {
          syncingVideoRef.current = false;
        });
    } else if (!isPlaying && !video.paused) {
      video.pause();
      syncingVideoRef.current = false;
    } else {
      syncingVideoRef.current = false;
    }
  }, [isPlaying, popupMode]);

  // Close popup automatically if queue becomes completely empty
  useEffect(() => {
    if (!currentTrack && popupMode !== 'off') {
      let active = true;
      queueMicrotask(() => {
        if (active) closePopup();
      });
      return () => {
        active = false;
      };
    }
  }, [currentTrack, popupMode, closePopup]);

  return (
    <>
      {/* Hidden lightweight offscreen canvas & video for Video PiP tier (0% CPU when inactive) */}
      <canvas
        ref={canvasRef}
        width={640}
        height={240}
        aria-hidden="true"
        className="fixed -left-[9999px] -top-[9999px] pointer-events-none opacity-0"
      />
      <video
        ref={videoRef}
        muted
        playsInline
        aria-hidden="true"
        className="fixed -left-[9999px] -top-[9999px] w-1 h-1 pointer-events-none opacity-0"
      />

      {/* Tier 1: True OS Always-On-Top Document Picture-in-Picture Portal */}
      {popupMode === 'document-pip' &&
        pipWindow &&
        !pipWindow.closed &&
        createPortal(
          <DynamicIslandProSurface
            compact={false}
            onToggleCompact={() => {}}
            onClose={closePopup}
            modeLabel="Dynamic Island Pro · Always on Top"
            accentColor={tokens.primary}
            inExternalWindow
          />,
          pipWindow.document.body
        )}

      {/* Tier 3: Draggable Always-Floating iPhone 17-18 Pro Dynamic Island Overlay */}
      {popupMode === 'floating-overlay' && currentTrack && (
        <motion.div
          drag
          dragMomentum={false}
          initial={{ opacity: 0, scale: 0.9, y: -12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="fixed top-3 left-1/2 -translate-x-1/2 z-[65] cursor-grab active:cursor-grabbing"
        >
          <DynamicIslandProSurface
            compact={compactOverlay}
            onToggleCompact={() => setCompactOverlay((v) => !v)}
            onClose={closePopup}
            modeLabel="Dynamic Island Pro · Background Active"
            accentColor={tokens.primary}
          />
        </motion.div>
      )}
    </>
  );
}
