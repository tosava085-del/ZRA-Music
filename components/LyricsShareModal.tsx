'use client';

import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Copy, Download, Sparkles, X } from 'lucide-react';
import { ArtworkImage } from './ArtworkImage';
import { useMusic } from './MusicProvider';
import { cn } from '@/lib/utils';

type CardAspect = '1:1' | '4:5' | '9:16';
type CardTheme = 'artwork' | 'gradient' | 'dark' | 'paper' | 'glass';

const ASPECT_OPTIONS: Array<{
  id: CardAspect;
  label: string;
  w: number;
  h: number;
  previewClass: string;
}> = [
  { id: '1:1', label: 'Square 1:1', w: 1080, h: 1080, previewClass: 'aspect-square max-w-[280px]' },
  { id: '4:5', label: 'Portrait 4:5', w: 1080, h: 1350, previewClass: 'aspect-[4/5] max-w-[252px]' },
  { id: '9:16', label: 'Story 9:16', w: 1080, h: 1920, previewClass: 'aspect-[9/16] max-w-[200px]' },
];

const THEME_OPTIONS: Array<{
  id: CardTheme;
  label: string;
  bgStart: string;
  bgEnd: string;
  textColor: string;
  mutedColor: string;
}> = [
  {
    id: 'artwork',
    label: 'Artwork Blur',
    bgStart: '#181424',
    bgEnd: '#09090D',
    textColor: '#FFFFFF',
    mutedColor: 'rgba(255,255,255,0.72)',
  },
  {
    id: 'gradient',
    label: 'Deep Gradient',
    bgStart: '#3B1D5E',
    bgEnd: '#0F172A',
    textColor: '#FFFFFF',
    mutedColor: 'rgba(255,255,255,0.74)',
  },
  {
    id: 'dark',
    label: 'AMOLED Dark',
    bgStart: '#0B0B0E',
    bgEnd: '#000000',
    textColor: '#FFFFFF',
    mutedColor: 'rgba(255,255,255,0.62)',
  },
  {
    id: 'paper',
    label: 'Editorial Paper',
    bgStart: '#F6F4EE',
    bgEnd: '#EAE5DA',
    textColor: '#141416',
    mutedColor: 'rgba(20,20,22,0.62)',
  },
  {
    id: 'glass',
    label: 'Frosted Slate',
    bgStart: '#1E293B',
    bgEnd: '#0B1120',
    textColor: '#F8FAFC',
    mutedColor: 'rgba(248,250,252,0.68)',
  },
];

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

interface LyricsShareModalProps {
  open: boolean;
  onClose: () => void;
}

export function LyricsShareModal({ open, onClose }: LyricsShareModalProps) {
  const { currentTrack, lyrics, showToast } = useMusic();

  const availableLines = useMemo(() => {
    if (lyrics?.lines && lyrics.lines.length > 0) {
      return lyrics.lines
        .map((l) => l.text.trim())
        .filter((t) => t.length > 0);
    }
    if (lyrics?.plainText) {
      return lyrics.plainText
        .split('\n')
        .map((l) => l.trim())
        .filter((t) => t.length > 0);
    }
    if (currentTrack) {
      return [
        `Listening to ${currentTrack.title}`,
        `Performed by ${currentTrack.artist}`,
      ];
    }
    return [];
  }, [lyrics, currentTrack]);

  const [selectedIndices, setSelectedIndices] = useState<number[]>([0, 1]);
  const [aspect, setAspect] = useState<CardAspect>('4:5');
  const [theme, setTheme] = useState<CardTheme>('artwork');
  const [copied, setCopied] = useState(false);

  if (!currentTrack) return null;

  const validIndices = selectedIndices.filter((i) => i >= 0 && i < availableLines.length);
  const activeIndices =
    validIndices.length > 0
      ? validIndices
      : availableLines.length > 0
        ? [0]
        : [];
  const chosenLines = activeIndices
    .slice()
    .sort((a, b) => a - b)
    .map((i) => availableLines[i]);

  const toggleLine = (idx: number) => {
    setSelectedIndices((prev) => {
      const cleaned = prev.filter((i) => i < availableLines.length);
      if (cleaned.includes(idx)) {
        if (cleaned.length <= 1) return cleaned;
        return cleaned.filter((i) => i !== idx);
      }
      if (cleaned.length >= 4) {
        return [...cleaned.slice(1), idx];
      }
      return [...cleaned, idx];
    });
  };

  const activeTheme = THEME_OPTIONS.find((t) => t.id === theme) || THEME_OPTIONS[0];
  const activeAspect = ASPECT_OPTIONS.find((a) => a.id === aspect) || ASPECT_OPTIONS[1];

  const handleCopyQuote = async () => {
    const quoteText = `${chosenLines.map((l) => `“${l}”`).join('\n')}\n— ${currentTrack.title} · ${currentTrack.artist}`;
    try {
      await navigator.clipboard.writeText(quoteText);
      setCopied(true);
      showToast('Lyrics quote copied to clipboard');
      setTimeout(() => setCopied(false), 1800);
    } catch {
      showToast('Could not access clipboard');
    }
  };

  const handleDownloadPng = () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = activeAspect.w;
      canvas.height = activeAspect.h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, activeTheme.bgStart);
      grad.addColorStop(1, activeTheme.bgEnd);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle radial glow
      const accentGlow = ctx.createRadialGradient(
        canvas.width * 0.25,
        canvas.height * 0.22,
        40,
        canvas.width * 0.25,
        canvas.height * 0.22,
        canvas.width * 0.85
      );
      accentGlow.addColorStop(
        0,
        theme === 'paper' ? 'rgba(225,29,72,0.09)' : 'rgba(244,63,94,0.22)'
      );
      accentGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = accentGlow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const pad = 92;

      // Top metadata header
      ctx.fillStyle = activeTheme.textColor;
      ctx.font = '700 42px system-ui, -apple-system, sans-serif';
      ctx.fillText(currentTrack.title.slice(0, 34), pad, pad + 44);

      ctx.fillStyle = activeTheme.mutedColor;
      ctx.font = '500 30px system-ui, -apple-system, sans-serif';
      ctx.fillText(currentTrack.artist.slice(0, 42), pad, pad + 90);

      // Hairline divider
      ctx.strokeStyle =
        theme === 'paper' ? 'rgba(20,20,22,0.12)' : 'rgba(255,255,255,0.14)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pad, pad + 132);
      ctx.lineTo(canvas.width - pad, pad + 132);
      ctx.stroke();

      // Main wrapped lyric lines
      ctx.fillStyle = activeTheme.textColor;
      const fontSize = chosenLines.length >= 4 ? 52 : 60;
      const lineHeight = Math.round(fontSize * 1.32);
      ctx.font = `700 ${fontSize}px system-ui, -apple-system, sans-serif`;

      const renderedBlocks: string[] = [];
      for (const rawLine of chosenLines) {
        const wrapped = wrapCanvasText(ctx, rawLine, canvas.width - pad * 2);
        renderedBlocks.push(...wrapped, '');
      }
      if (renderedBlocks[renderedBlocks.length - 1] === '') {
        renderedBlocks.pop();
      }

      const totalBlockHeight = renderedBlocks.reduce(
        (acc, line) => acc + (line === '' ? 20 : lineHeight),
        0
      );
      let cursorY = Math.max(
        pad + 220,
        (canvas.height - totalBlockHeight) / 2 + fontSize * 0.45
      );

      for (const line of renderedBlocks) {
        if (line === '') {
          cursorY += 20;
          continue;
        }
        ctx.fillText(line, pad, cursorY);
        cursorY += lineHeight;
      }

      // Clean ZRA signature footer
      ctx.fillStyle = activeTheme.mutedColor;
      ctx.font = '600 28px system-ui, -apple-system, sans-serif';
      ctx.fillText('ZRA', pad, canvas.height - pad);

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const safeSlug = currentTrack.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .slice(0, 32);
      link.download = `sonara-lyrics-${safeSlug || 'card'}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Lyrics card saved as PNG');
    } catch {
      showToast('Could not export image card');
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="lyrics-share-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="Share Lyrics Card Studio"
          data-testid="lyrics-share-modal"
          className="fixed inset-0 z-[75] bg-black/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-5"
        >
          <motion.div
            initial={{ y: 36, opacity: 0.9 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 36, opacity: 0.9 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-4xl max-h-[92vh] rounded-t-[28px] sm:rounded-[28px] bg-[var(--m3-surface)] border border-[var(--m3-border)] overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-black/5 dark:border-white/[0.08] shrink-0">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-950 dark:text-white">
                  Share Lyrics Card
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Pick up to 4 lines · {activeAspect.label} · {activeTheme.label}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close Share Lyrics Studio"
                className="min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Studio Body */}
            <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left: Live WYSIWYG Preview */}
              <div className="lg:col-span-6 flex flex-col items-center gap-4">
                <div
                  data-testid="lyrics-share-card"
                  data-aspect={aspect}
                  data-theme={theme}
                  className={cn(
                    'relative w-full rounded-[24px] overflow-hidden shadow-2xl border border-white/15 flex flex-col justify-between p-6 transition-all duration-300',
                    activeAspect.previewClass
                  )}
                  style={{
                    background: `linear-gradient(145deg, ${activeTheme.bgStart}, ${activeTheme.bgEnd})`,
                    color: activeTheme.textColor,
                  }}
                >
                  {theme === 'artwork' && currentTrack.thumbnail && (
                    <>
                      <img
                        src={currentTrack.thumbnail}
                        alt=""
                        aria-hidden="true"
                        referrerPolicy="no-referrer"
                        className="absolute inset-0 w-full h-full object-cover scale-125 blur-2xl opacity-55 pointer-events-none"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/45 to-black/75 pointer-events-none" />
                    </>
                  )}

                  {/* Card Header: Mini Artwork + Track Meta */}
                  <div className="relative z-10 flex items-center gap-3">
                    <ArtworkImage
                      src={currentTrack.thumbnail}
                      alt={currentTrack.title}
                      className="w-11 h-11 shrink-0 shadow-md"
                      rounded="rounded-xl"
                      sizeHint="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold truncate leading-tight">
                        {currentTrack.title}
                      </p>
                      <p
                        className="text-xs truncate mt-0.5"
                        style={{ color: activeTheme.mutedColor }}
                      >
                        {currentTrack.artist}
                      </p>
                    </div>
                  </div>

                  {/* Selected Lyric Lines */}
                  <div className="relative z-10 my-auto py-5 space-y-2.5">
                    {chosenLines.map((line, i) => (
                      <p
                        key={`preview-line-${i}`}
                        className={cn(
                          'font-bold tracking-tight leading-snug',
                          chosenLines.length >= 4 ? 'text-[15px]' : 'text-[18px]'
                        )}
                      >
                        {line}
                      </p>
                    ))}
                  </div>

                  {/* Footer Brand Mark */}
                  <div className="relative z-10 flex items-center justify-between pt-2 border-t border-current/15">
                    <span
                      className="text-[11px] font-semibold tracking-wide"
                      style={{ color: activeTheme.mutedColor }}
                    >
                      Sonara
                    </span>
                    <Sparkles
                      className="w-3.5 h-3.5"
                      style={{ color: activeTheme.mutedColor }}
                    />
                  </div>
                </div>

                {/* Primary Export Controls */}
                <div className="flex items-center gap-2.5 w-full max-w-[280px]">
                  <button
                    type="button"
                    onClick={handleDownloadPng}
                    className="flex-1 h-11 px-4 rounded-full bg-[var(--m3-primary)] text-[var(--m3-on-primary)] text-xs font-semibold flex items-center justify-center gap-2 shadow-md hover:brightness-110 transition-all whitespace-nowrap"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PNG</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleCopyQuote()}
                    className="h-11 px-4 rounded-full metro-surface text-xs font-semibold text-slate-800 dark:text-white flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-500" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Right: Aspect Ratio, Theme & Line Picker */}
              <div className="lg:col-span-6 space-y-5">
                {/* Aspect Ratio Switcher */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Card Ratio
                  </p>
                  <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-black/[0.05] dark:bg-white/[0.06]">
                    {ASPECT_OPTIONS.map((opt) => {
                      const active = aspect === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setAspect(opt.id)}
                          className={cn(
                            'h-9 rounded-xl text-xs font-semibold transition-all whitespace-nowrap',
                            active
                              ? 'bg-[var(--m3-primary)] text-[var(--m3-on-primary)] shadow-sm'
                              : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                          )}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Card Theme Picker */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Card Surface
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {THEME_OPTIONS.map((opt) => {
                      const active = theme === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setTheme(opt.id)}
                          className={cn(
                            'h-9 px-3.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap shrink-0',
                            active
                              ? 'bg-[var(--m3-primary)] text-[var(--m3-on-primary)]'
                              : 'metro-surface text-slate-700 dark:text-slate-200'
                          )}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Line Selector */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Select Lyrics ({activeIndices.length}/4)
                    </p>
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                    {availableLines.slice(0, 40).map((line, idx) => {
                      const selected = activeIndices.includes(idx);
                      return (
                        <button
                          key={`pick-line-${idx}`}
                          type="button"
                          onClick={() => toggleLine(idx)}
                          className={cn(
                            'w-full text-left px-3.5 py-2.5 rounded-2xl text-sm transition-all flex items-center justify-between gap-2',
                            selected
                              ? 'bg-[var(--m3-primary-container)] text-[var(--m3-on-primary-container)] font-semibold'
                              : 'bg-black/[0.03] dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 hover:bg-black/[0.06] dark:hover:bg-white/[0.08]'
                          )}
                        >
                          <span className="line-clamp-2">{line}</span>
                          {selected && <Check className="w-4 h-4 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
