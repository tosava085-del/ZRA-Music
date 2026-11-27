'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Disc3,
  Heart,
  Maximize2,
  MessageSquareQuote,
  Pause,
  PictureInPicture2,
  Play,
  SkipBack,
  SkipForward,
  X,
} from 'lucide-react';
import { ArtworkImage } from './ArtworkImage';
import { useMusic } from './MusicProvider';
import { findActiveLyricIndex, formatDuration } from '@/lib/metrolist/lyrics';
import { cn } from '@/lib/utils';

export function DynamicIsland() {
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
    setIsNowPlayingOpen,
    setNowPlayingTab,
    isNowPlayingOpen,
    toastMessage,
    lyrics,
    popupMode,
    toggleBackgroundPopup,
  } = useMusic();

  const [expanded, setExpanded] = useState(false);

  const activeLyric = useMemo(() => {
    if (!lyrics?.synced || lyrics.lines.length === 0) return null;
    const idx = findActiveLyricIndex(lyrics.lines, currentTime);
    return idx >= 0 ? lyrics.lines[idx]?.text ?? null : null;
  }, [lyrics, currentTime]);

  // Close expanded island on Escape
  useEffect(() => {
    if (!expanded) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [expanded]);

  // Hide static top island while full-screen sheet or draggable floating Pro overlay is open
  if (isNowPlayingOpen || popupMode === 'floating-overlay') return null;

  const liked = currentTrack ? isLiked(currentTrack.videoId) : false;
  const progress =
    duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;
  const remainingSec = Math.max(0, duration - currentTime);

  return (
    <>
      {/* Subtle tap-outside backdrop only when Dynamic Island is expanded */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="island-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            onClick={() => setExpanded(false)}
            aria-hidden="true"
            className="fixed inset-0 z-[54] bg-black/25"
          />
        )}
      </AnimatePresence>

      {/* Top-Center iPhone 17 / 18 Dynamic Island */}
      <div className="fixed top-2 lg:top-3 left-1/2 -translate-x-1/2 z-[55] pointer-events-none flex justify-center">
        <AnimatePresence mode="wait">
          {expanded && currentTrack ? (
            <motion.section
              key="island-expanded"
              initial={{ opacity: 0, scale: 0.88, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -6 }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              aria-label="Dynamic Island expanded player"
              className="pointer-events-auto w-[min(360px,calc(100vw-24px))] rounded-[28px] dynamic-island-glass text-white p-4 space-y-3.5"
            >
              {/* Top Row: Artwork + Track Meta + Actions */}
              <div className="flex items-center gap-3">
                <ArtworkImage
                  src={currentTrack.thumbnail}
                  alt={currentTrack.title}
                  className="w-12 h-12 shadow-md"
                  rounded="rounded-2xl"
                  sizeHint="sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white truncate">
                    {currentTrack.title}
                  </p>
                  <p className="text-xs text-white/65 truncate">
                    {currentTrack.artist}
                  </p>
                  {activeLyric && (
                    <p className="text-[11px] font-medium text-[var(--m3-primary)] truncate mt-0.5">
                      {activeLyric}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      toggleBackgroundPopup();
                      setExpanded(false);
                    }}
                    aria-label={
                      popupMode === 'off'
                        ? 'Pop out Dynamic Island'
                        : 'Close Dynamic Island popup'
                    }
                    title="Pop-out Dynamic Island for background play"
                    className={cn(
                      'min-h-[36px] min-w-[36px] flex items-center justify-center rounded-full transition-colors',
                      popupMode !== 'off'
                        ? 'text-[var(--m3-primary)] bg-white/12'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    )}
                  >
                    <PictureInPicture2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleLike(currentTrack)}
                    aria-label={liked ? 'Unlike track' : 'Like track'}
                    className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                  >
                    <Heart
                      className={cn(
                        'w-4 h-4',
                        liked
                          ? 'fill-[var(--m3-primary)] text-[var(--m3-primary)]'
                          : 'text-white/70'
                      )}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpanded(false)}
                    aria-label="Collapse Dynamic Island"
                    className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-full text-white/65 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Scrubber */}
              <div className="space-y-1">
                <input
                  type="range"
                  min={0}
                  max={Math.max(1, duration)}
                  value={Math.min(currentTime, duration)}
                  onChange={(e) => seekTo(Number(e.target.value))}
                  aria-label="Dynamic Island seek bar"
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/18 accent-[var(--m3-primary)]"
                />
                <div className="flex items-center justify-between text-[11px] font-mono-nums text-white/60">
                  <span>{formatDuration(currentTime)}</span>
                  <span>-{formatDuration(remainingSec)}</span>
                </div>
              </div>

              {/* Transport & Full-Player Shortcuts */}
              <div className="flex items-center justify-between pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setExpanded(false);
                    setNowPlayingTab('lyrics');
                    setIsNowPlayingOpen(true);
                  }}
                  aria-label="Open synced lyrics"
                  className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <MessageSquareQuote className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={prevTrack}
                    aria-label="Dynamic Island previous track"
                    className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full text-white/85 hover:bg-white/10 transition-colors"
                  >
                    <SkipBack className="w-4 h-4 fill-current" />
                  </button>

                  <button
                    type="button"
                    onClick={togglePlayPause}
                    aria-label={isPlaying ? 'Dynamic Island pause' : 'Dynamic Island play'}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-slate-950 hover:scale-105 active:scale-95 transition-transform"
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
                    aria-label="Dynamic Island next track"
                    className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full text-white/85 hover:bg-white/10 transition-colors"
                  >
                    <SkipForward className="w-4 h-4 fill-current" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setExpanded(false);
                    setNowPlayingTab('player');
                    setIsNowPlayingOpen(true);
                  }}
                  aria-label="Open full player"
                  className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </motion.section>
          ) : toastMessage ? (
            <motion.div
              key="island-toast"
              role="status"
              aria-live="polite"
              initial={{ opacity: 0, scale: 0.9, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -6 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto h-9 px-2.5 rounded-full dynamic-island-glass text-white flex items-center gap-1.5 max-w-[min(184px,calc(100vw-164px))] sm:max-w-[320px]"
            >
              <Disc3 className="w-3.5 h-3.5 text-[var(--m3-primary)] shrink-0" />
              <span className="text-xs font-medium truncate">{toastMessage}</span>
            </motion.div>
          ) : currentTrack ? (
            <motion.button
              key="island-compact-playing"
              type="button"
              onClick={() => setExpanded(true)}
              aria-label={`Expand Dynamic Island for ${currentTrack.title}`}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto relative h-9 pl-1.5 pr-2.5 rounded-full dynamic-island-glass text-white flex items-center gap-2 max-w-[min(184px,calc(100vw-164px))] sm:max-w-[270px] hover:scale-[1.02] active:scale-[0.98] transition-transform overflow-hidden"
            >
              {/* Subtle hairline progress along bottom edge of Dynamic Island */}
              <div
                aria-hidden="true"
                className="absolute bottom-0 left-3 right-3 h-[1.5px] bg-white/10 rounded-full overflow-hidden"
              >
                <div
                  className="h-full bg-[var(--m3-primary)]"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <ArtworkImage
                src={currentTrack.thumbnail}
                alt={currentTrack.title}
                className="w-6 h-6"
                rounded="rounded-full"
                sizeHint="sm"
              />

              <span className="text-xs font-medium text-white/95 truncate flex-1 text-left">
                {currentTrack.title}
              </span>

              {/* 3-Bar Live Audio Activity Waveform (CSS compositor-only scaleY) */}
              <span
                aria-hidden="true"
                className="flex items-end gap-[2px] h-3 shrink-0"
              >
                <span
                  className={cn(
                    'w-[2.5px] h-full rounded-full bg-[var(--m3-primary)]',
                    isPlaying ? 'eq-bar' : 'eq-bar-paused'
                  )}
                  style={{ animationDelay: '0ms' }}
                />
                <span
                  className={cn(
                    'w-[2.5px] h-full rounded-full bg-[var(--m3-primary)]',
                    isPlaying ? 'eq-bar' : 'eq-bar-paused'
                  )}
                  style={{ animationDelay: '180ms' }}
                />
                <span
                  className={cn(
                    'w-[2.5px] h-full rounded-full bg-[var(--m3-primary)]',
                    isPlaying ? 'eq-bar' : 'eq-bar-paused'
                  )}
                  style={{ animationDelay: '340ms' }}
                />
              </span>
            </motion.button>
          ) : (
            <motion.div
              key="island-idle"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.18 }}
              aria-label="Dynamic Island idle"
              className="pointer-events-auto h-8 px-3.5 rounded-full dynamic-island-glass text-white/80 flex items-center gap-2"
            >
              <span
                aria-hidden="true"
                className="w-2.5 h-2.5 rounded-full bg-white/15 ring-1 ring-white/20"
              />
              <span className="text-[11px] font-medium tracking-tight text-white/75 whitespace-nowrap">
                ZRA
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
