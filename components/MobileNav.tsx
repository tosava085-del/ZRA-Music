'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Compass,
  Home,
  Library,
  Loader2,
  Music2,
  Pause,
  PictureInPicture2,
  Play,
  Search,
  Settings,
  SkipForward,
} from 'lucide-react';
import { ArtworkImage } from './ArtworkImage';
import {
  LiquidGlassBackdropLayer,
  registerLiquidGlassFilter,
} from './LiquidGlassSurface';
import { useMusic } from './MusicProvider';
import type { NavTab } from '@/lib/metrolist/types';
import { cn } from '@/lib/utils';

const MOBILE_TABS: Array<{
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'charts', label: 'Explore', icon: Compass },
  { id: 'library', label: 'Library', icon: Library },
];

const LIQUID_SPRING = {
  type: 'spring' as const,
  stiffness: 430,
  damping: 34,
  mass: 0.82,
};

interface DragLensState {
  dragging: boolean;
  centerPercent: number;
  targetIndex: number;
}

export function MobileTopBar() {
  const { setActiveTab, activeTab, openDetail } = useMusic();

  return (
    <header className="lg:hidden sticky top-0 z-30 h-[52px] px-3 flex items-center justify-between bg-[var(--m3-bg)]/95 border-b border-[var(--m3-border)]">
      <button
        type="button"
        onClick={() => {
          setActiveTab('home');
          openDetail(null);
        }}
        className="text-base font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0"
      >
        ZRA
      </button>

      {/* Center slot intentionally stays open for the top-center Dynamic Island */}

      <button
        type="button"
        onClick={() => setActiveTab('settings')}
        aria-label="Open settings"
        className={cn(
          'min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full transition-colors',
          activeTab === 'settings'
            ? 'text-[var(--m3-primary)] bg-[var(--m3-primary-soft)]'
            : 'text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10'
        )}
      >
        <Settings className="w-5 h-5" />
      </button>
    </header>
  );
}

export function MobileBottomTabs() {
  const {
    activeTab,
    setActiveTab,
    detailTarget,
    openDetail,
    currentTrack,
    isPlaying,
    isBuffering,
    currentTime,
    duration,
    togglePlayPause,
    nextTrack,
    setIsNowPlayingOpen,
    popupMode,
    toggleBackgroundPopup,
    history,
    likedTracks,
    playTrack,
    settings,
  } = useMusic();

  const isLiquidGlass = settings.dockStyle === 'liquid-glass';

  const [isScrolledCompact, setIsScrolledCompact] = useState(false);
  const lastScrollYRef = useRef(0);
  const compactRef = useRef(false);

  // Draggable Apple Music iOS 27 Prismatic Liquid Glass Lens state
  const navRef = useRef<HTMLElement | null>(null);
  const dragStartRef = useRef<{ x: number; pointerId: number } | null>(null);
  const suppressNextClickRef = useRef(false);
  const [dragLens, setDragLens] = useState<DragLensState | null>(null);

  // Smooth Apple Music iOS 27 scroll-morphing listener (only active in Liquid Glass mode):
  // Scroll down -> morph into compact floating 3-pill Liquid Glass dock
  // Scroll up or top -> morph smoothly back into expanded 2-tier Liquid Glass dock
  useEffect(() => {
    if (typeof window === 'undefined' || !isLiquidGlass) {
      compactRef.current = false;
      return;
    }
    lastScrollYRef.current = window.scrollY;

    let rafId: number | null = null;
    const onScroll = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        const y = Math.max(0, window.scrollY);
        const delta = y - lastScrollYRef.current;

        if (y < 28) {
          if (compactRef.current) {
            compactRef.current = false;
            setIsScrolledCompact(false);
          }
          lastScrollYRef.current = y;
          return;
        }

        if (delta > 8 && y > 48) {
          if (!compactRef.current) {
            compactRef.current = true;
            setIsScrolledCompact(true);
          }
          lastScrollYRef.current = y;
        } else if (delta < -7) {
          if (compactRef.current) {
            compactRef.current = false;
            setIsScrolledCompact(false);
          }
          lastScrollYRef.current = y;
        }
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, [isLiquidGlass]);

  // Pre-warm and pre-decode SVG refraction maps for both expanded and compact dock layouts
  // so scrolling never flashes transparent while feImage PNGs decode.
  useEffect(() => {
    if (typeof window === 'undefined' || !isLiquidGlass) return;
    const dockW = Math.min(448, Math.max(280, window.innerWidth - 24));
    const compactCenterW = Math.max(120, dockW - 54 * 2 - 20);
    const dropletW = Math.max(64, Math.round(dockW / 4));
    registerLiquidGlassFilter('pill', dockW, 52);
    registerLiquidGlassFilter('pill', dockW, 62);
    registerLiquidGlassFilter('orb', 54, 54);
    registerLiquidGlassFilter('pill', compactCenterW, 54);
    registerLiquidGlassFilter('droplet', dropletW, 54);
  }, [isLiquidGlass]);

  const progress =
    currentTrack && duration > 0
      ? Math.min(100, Math.max(0, (currentTime / duration) * 100))
      : 0;

  const handlePlayIdleOrToggle = () => {
    if (currentTrack) {
      togglePlayPause();
      return;
    }
    const fallbackQueue = [...history.map((h) => h.track), ...likedTracks];
    if (fallbackQueue.length > 0) {
      playTrack(fallbackQueue[0], fallbackQueue);
    } else {
      setActiveTab('home');
    }
  };

  const handleMiniBarTap = () => {
    if (currentTrack) {
      setIsNowPlayingOpen(true);
    } else {
      handlePlayIdleOrToggle();
    }
  };

  const activeTabIndex = MOBILE_TABS.findIndex(
    (t) => t.id === activeTab && !detailTarget
  );
  const activeTabSpec =
    activeTabIndex >= 0 ? MOBILE_TABS[activeTabIndex] : MOBILE_TABS[0];
  const ActiveTabIcon = activeTab === 'search' ? Home : activeTabSpec.icon;

  const handleSelectTab = (tabId: NavTab) => {
    compactRef.current = false;
    setIsScrolledCompact(false);
    openDetail(null);
    setActiveTab(tabId);
  };

  // Compute clamped horizontal ratio & tab index for Liquid Glass slide gesture
  const computePointerSlot = (clientX: number) => {
    const el = navRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return null;
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const targetIndex = Math.min(
      MOBILE_TABS.length - 1,
      Math.max(0, Math.floor(ratio * MOBILE_TABS.length))
    );
    const slotHalf = 50 / MOBILE_TABS.length; // 12.5%
    const centerPercent = Math.min(
      100 - slotHalf,
      Math.max(slotHalf, ratio * 100)
    );
    return { centerPercent, targetIndex };
  };

  const handleNavPointerDown = (e: React.PointerEvent<HTMLElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    const slot = computePointerSlot(e.clientX);
    if (!slot) return;
    dragStartRef.current = { x: e.clientX, pointerId: e.pointerId };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore if capture unavailable
    }
    setDragLens({
      dragging: false,
      centerPercent: slot.centerPercent,
      targetIndex: slot.targetIndex,
    });
  };

  const handleNavPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const start = dragStartRef.current;
    if (!start || start.pointerId !== e.pointerId) return;
    const slot = computePointerSlot(e.clientX);
    if (!slot) return;
    const movedEnough = Math.abs(e.clientX - start.x) >= 6;
    setDragLens((prev) => ({
      dragging: Boolean(prev?.dragging || movedEnough),
      centerPercent: slot.centerPercent,
      targetIndex: slot.targetIndex,
    }));
  };

  const handleNavPointerUp = (e: React.PointerEvent<HTMLElement>) => {
    const start = dragStartRef.current;
    if (!start || start.pointerId !== e.pointerId) return;
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // ignore
    }
    const slot = computePointerSlot(e.clientX);
    const wasDragging = Boolean(dragLens?.dragging);
    const finalIdx =
      slot?.targetIndex ?? dragLens?.targetIndex ?? Math.max(0, activeTabIndex);

    dragStartRef.current = null;
    setDragLens(null);

    if (wasDragging) {
      suppressNextClickRef.current = true;
      window.setTimeout(() => {
        suppressNextClickRef.current = false;
      }, 80);
    }

    const targetTab = MOBILE_TABS[finalIdx];
    if (targetTab) {
      handleSelectTab(targetTab.id);
    }
  };

  const handleNavPointerCancel = (e: React.PointerEvent<HTMLElement>) => {
    if (dragStartRef.current?.pointerId === e.pointerId) {
      dragStartRef.current = null;
      setDragLens(null);
    }
  };

  /* ============================================================================
   * MODE 1: DEFAULT LIGHTWEIGHT NAVIGATION BAR (Zero backdrop-filter, ideal for older Android)
   * ============================================================================ */
  if (!isLiquidGlass) {
    return (
      <div
        data-testid="mobile-default-dock"
        data-dock-style="default"
        className="lg:hidden fixed inset-x-0 bottom-0 z-40"
      >
        {/* Lightweight Solid MiniPlayer Strip above bottom nav */}
        {currentTrack && (
          <div className="px-2.5 pb-2">
            <div className="relative max-w-md mx-auto h-[56px] rounded-[18px] metro-surface shadow-lg px-2.5 flex items-center gap-2.5 overflow-hidden">
              <div className="pointer-events-none absolute inset-x-3 bottom-0 h-[2px] bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--m3-primary)] transition-[width] duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <button
                type="button"
                onClick={handleMiniBarTap}
                aria-label={`Open Now Playing for ${currentTrack.title}`}
                className="flex items-center gap-2.5 min-w-0 flex-1 text-left"
              >
                <ArtworkImage
                  src={currentTrack.thumbnail}
                  alt={currentTrack.title}
                  className="w-10 h-10 shrink-0"
                  rounded="rounded-[10px]"
                  sizeHint="sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-semibold text-slate-900 dark:text-white truncate">
                    {currentTrack.title}
                  </p>
                  <p className="text-[11.5px] text-slate-500 dark:text-slate-400 truncate">
                    {currentTrack.artist}
                  </p>
                </div>
              </button>

              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  type="button"
                  onClick={handlePlayIdleOrToggle}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-slate-900 dark:text-white hover:bg-black/5 dark:hover:bg-white/10 active:scale-90 transition-all"
                >
                  {isBuffering ? (
                    <Loader2 className="w-[18px] h-[18px] animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="w-[18px] h-[18px] fill-current" />
                  ) : (
                    <Play className="w-[18px] h-[18px] fill-current ml-0.5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => nextTrack(true)}
                  aria-label="Next track"
                  className="w-9 h-9 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 active:scale-90 transition-all"
                >
                  <SkipForward className="w-[17px] h-[17px] fill-current" />
                </button>
                <button
                  type="button"
                  onClick={toggleBackgroundPopup}
                  aria-label={
                    popupMode === 'off'
                      ? 'Pop out Dynamic Island'
                      : 'Close Dynamic Island popup'
                  }
                  className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-all',
                    popupMode !== 'off'
                      ? 'text-[var(--m3-primary)] bg-[var(--m3-primary-soft)]'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10'
                  )}
                >
                  <PictureInPicture2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Solid Material 3 Bottom Navigation Bar */}
        <nav
          aria-label="Mobile navigation"
          className="bg-[var(--m3-surface)] border-t border-[var(--m3-border)] pb-[env(safe-area-inset-bottom)]"
        >
          <div className="max-w-md mx-auto h-[64px] grid grid-cols-4 items-center px-2">
            {MOBILE_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id && !detailTarget;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleSelectTab(tab.id)}
                  className="flex flex-col items-center justify-center gap-1 h-full active:scale-95 transition-transform"
                >
                  <span
                    className={cn(
                      'w-14 h-8 rounded-full flex items-center justify-center transition-colors',
                      isActive
                        ? 'bg-[var(--m3-primary-container)] text-[var(--m3-on-primary-container)]'
                        : 'text-slate-600 dark:text-slate-300'
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-[20px] h-[20px]',
                        isActive ? 'stroke-[2.3]' : 'stroke-[1.9]'
                      )}
                    />
                  </span>
                  <span
                    className={cn(
                      'text-[11px] leading-none tracking-tight',
                      isActive
                        ? 'font-bold text-slate-900 dark:text-white'
                        : 'font-medium text-slate-500 dark:text-slate-400'
                    )}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    );
  }

  /* ============================================================================
   * MODE 2: APPLE MUSIC iOS 27 CRYSTAL FLOATING LIQUID GLASS DOCK
   * - Crisp low-blur optical glass (clean background readability on scroll)
   * - Smooth scroll-down 3-pill compact morph & scroll-up expanded restore
   * - Interactive Slide-to-Switch draggable prismatic Liquid Glass droplet lens
   * ============================================================================ */
  const highlightedIdx = dragLens ? dragLens.targetIndex : activeTabIndex;
  const isDraggingLens = Boolean(dragLens?.dragging);

  return (
    <div
      data-testid="mobile-liquid-dock"
      data-dock-style="liquid-glass"
      data-dock-mode={isScrolledCompact ? 'compact' : 'expanded'}
      data-lens-dragging={isDraggingLens ? 'true' : 'false'}
      className="lg:hidden fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 pointer-events-none"
    >
      <div className="max-w-md mx-auto">
        {isScrolledCompact ? (
          /* COMPACT SCROLL-DOWN STATE (3 Floating Liquid Glass Pills — opacity stays 1 so Chromium never suspends backdrop-filter: url(#...)) */
          <motion.div
            key="liquid-dock-compact"
            initial={{ y: 10, scale: 0.97 }}
            animate={{ y: 0, scale: 1 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-2.5 pointer-events-auto"
          >
              {/* Left Circular Active Tab Liquid Glass Orb */}
              <motion.button
                type="button"
                whileTap={{ scale: 0.91 }}
                transition={LIQUID_SPRING}
                onClick={() => {
                  compactRef.current = false;
                  setIsScrolledCompact(false);
                }}
                aria-label="Expand navigation dock"
                data-testid="liquid-orb-expand"
                className="relative w-[54px] h-[54px] rounded-full flex items-center justify-center shrink-0 text-[var(--m3-primary)]"
              >
                <LiquidGlassBackdropLayer
                  preset="orb"
                  fallbackWidth={54}
                  fallbackHeight={54}
                />
                <ActiveTabIcon className="relative z-10 w-[22px] h-[22px] stroke-[2.25]" />
              </motion.button>

              {/* Center Floating Liquid Glass MiniPlayer Capsule */}
              <motion.div
                layout
                transition={LIQUID_SPRING}
                className="relative flex-1 min-w-0 h-[54px] rounded-full px-2 flex items-center gap-2 overflow-hidden"
              >
                <LiquidGlassBackdropLayer
                  preset="pill"
                  fallbackWidth={210}
                  fallbackHeight={54}
                />
                {currentTrack && (
                  <div className="pointer-events-none absolute inset-x-5 bottom-0 z-10 h-[2px] bg-white/15 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--m3-primary)] transition-[width] duration-200"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleMiniBarTap}
                  aria-label={
                    currentTrack
                      ? `Open Now Playing for ${currentTrack.title}`
                      : 'Play music'
                  }
                  className="relative z-10 flex items-center gap-2.5 min-w-0 flex-1 text-left"
                >
                  {currentTrack ? (
                    <ArtworkImage
                      src={currentTrack.thumbnail}
                      alt={currentTrack.title}
                      className="w-9 h-9 shadow-sm shrink-0"
                      rounded="rounded-[9px]"
                      sizeHint="sm"
                    />
                  ) : (
                    <span className="w-9 h-9 rounded-[9px] bg-black/10 dark:bg-white/15 border border-white/25 flex items-center justify-center shrink-0 text-slate-700 dark:text-white/85">
                      <Music2 className="w-4 h-4" />
                    </span>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-semibold tracking-tight text-slate-900 dark:text-white truncate dark:drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]">
                      {currentTrack ? currentTrack.title : 'Tidak Diputar'}
                    </p>
                    {currentTrack && (
                      <p className="text-[11px] text-slate-700/85 dark:text-white/85 truncate leading-tight dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]">
                        {currentTrack.artist}
                      </p>
                    )}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handlePlayIdleOrToggle}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                  className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-slate-900 dark:text-white hover:bg-white/15 active:scale-90 transition-all"
                >
                  {isBuffering ? (
                    <Loader2 className="w-[18px] h-[18px] animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="w-[18px] h-[18px] fill-current" />
                  ) : (
                    <Play className="w-[18px] h-[18px] fill-current ml-0.5" />
                  )}
                </button>
              </motion.div>

              {/* Right Circular Search Liquid Glass Orb */}
              <motion.button
                type="button"
                whileTap={{ scale: 0.91 }}
                transition={LIQUID_SPRING}
                onClick={() => handleSelectTab('search')}
                aria-label="Quick search"
                data-testid="liquid-orb-search"
                className={cn(
                  'relative w-[54px] h-[54px] rounded-full flex items-center justify-center shrink-0 transition-colors',
                  activeTab === 'search' && !detailTarget
                    ? 'text-[var(--m3-primary)]'
                    : 'text-slate-900 dark:text-white'
                )}
              >
                <LiquidGlassBackdropLayer
                  preset="orb"
                  fallbackWidth={54}
                  fallbackHeight={54}
                />
                <Search className="relative z-10 w-[21px] h-[21px] stroke-[2.25]" />
              </motion.button>
            </motion.div>
          ) : (
            /* EXPANDED DEFAULT / SCROLL-UP STATE (2 Stacked Floating Crystal Liquid Glass Pills — opacity stays 1 for instant blur/refraction) */
            <motion.div
              key="liquid-dock-expanded"
              initial={{ y: 10, scale: 0.97 }}
              animate={{ y: 0, scale: 1 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col gap-2 pointer-events-auto"
            >
              {/* Top Pill: Floating Liquid Glass MiniPlayer */}
              <div className="relative h-[52px] rounded-full px-2.5 flex items-center gap-2.5 overflow-hidden">
                <LiquidGlassBackdropLayer
                  preset="pill"
                  fallbackWidth={336}
                  fallbackHeight={52}
                />
                {currentTrack && (
                  <div className="pointer-events-none absolute inset-x-6 bottom-0 z-10 h-[2px] bg-white/15 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--m3-primary)] transition-[width] duration-200"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleMiniBarTap}
                  aria-label={
                    currentTrack
                      ? `Open Now Playing for ${currentTrack.title}`
                      : 'Tidak Diputar — tap to play'
                  }
                  className="relative z-10 flex items-center gap-2.5 min-w-0 flex-1 text-left"
                >
                  {currentTrack ? (
                    <ArtworkImage
                      src={currentTrack.thumbnail}
                      alt={currentTrack.title}
                      className="w-9 h-9 shadow-sm shrink-0"
                      rounded="rounded-[9px]"
                      sizeHint="sm"
                    />
                  ) : (
                    <span className="w-9 h-9 rounded-[9px] bg-black/10 dark:bg-white/15 border border-white/25 flex items-center justify-center shrink-0 text-slate-700 dark:text-white/85">
                      <Music2 className="w-4 h-4" />
                    </span>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-bold tracking-tight text-slate-900 dark:text-white truncate dark:drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]">
                      {currentTrack ? currentTrack.title : 'Tidak Diputar'}
                    </p>
                    {currentTrack && (
                      <p className="text-[11.5px] text-slate-700/85 dark:text-white/85 truncate leading-tight dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]">
                        {currentTrack.artist}
                      </p>
                    )}
                  </div>
                </button>

                <div className="relative z-10 flex items-center gap-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={handlePlayIdleOrToggle}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-slate-900 dark:text-white hover:bg-white/15 active:scale-90 transition-all"
                  >
                    {isBuffering ? (
                      <Loader2 className="w-[19px] h-[19px] animate-spin" />
                    ) : isPlaying ? (
                      <Pause className="w-[19px] h-[19px] fill-current" />
                    ) : (
                      <Play className="w-[19px] h-[19px] fill-current ml-0.5" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => nextTrack(true)}
                    disabled={!currentTrack}
                    aria-label="Next track"
                    className="w-9 h-9 rounded-full flex items-center justify-center text-slate-800 dark:text-white/90 hover:bg-white/15 active:scale-90 disabled:opacity-35 transition-all"
                  >
                    <SkipForward className="w-[18px] h-[18px] fill-current" />
                  </button>

                  {currentTrack && (
                    <button
                      type="button"
                      onClick={toggleBackgroundPopup}
                      aria-label={
                        popupMode === 'off'
                          ? 'Pop out Dynamic Island'
                          : 'Close Dynamic Island popup'
                      }
                      className={cn(
                        'w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-all',
                        popupMode !== 'off'
                          ? 'text-[var(--m3-primary)] bg-white/20'
                          : 'text-slate-700 dark:text-white/80 hover:bg-white/15'
                      )}
                    >
                      <PictureInPicture2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Bottom Pill: Draggable Floating Liquid Glass 4-Tab Navigation Bar */}
              <nav
                ref={navRef}
                aria-label="Mobile navigation"
                data-testid="liquid-nav-bar"
                onPointerDown={handleNavPointerDown}
                onPointerMove={handleNavPointerMove}
                onPointerUp={handleNavPointerUp}
                onPointerCancel={handleNavPointerCancel}
                className="relative h-[62px] rounded-full p-1.5 grid grid-cols-4 items-center gap-0.5 touch-none select-none overflow-visible cursor-grab active:cursor-grabbing"
              >
                {/* Dedicated SVG Refraction Backdrop Layer (sibling of tabs & droplet so overflow-visible droplet never clips) */}
                <LiquidGlassBackdropLayer
                  preset="pill"
                  fallbackWidth={336}
                  fallbackHeight={62}
                />

                {/* Live Draggable Prismatic Liquid Glass Droplet with real SVG lip-profile magnification */}
                <AnimatePresence>
                  {isDraggingLens && dragLens && (
                    <motion.span
                      key="prismatic-drag-droplet"
                      data-testid="liquid-drag-droplet"
                      initial={{ opacity: 0.7, scale: 0.92 }}
                      animate={{
                        opacity: 1,
                        scaleX: 1.08,
                        scaleY: 1.24,
                        left: `calc(${dragLens.centerPercent}% - 12.5%)`,
                      }}
                      exit={{ opacity: 0, scale: 0.94 }}
                      transition={{
                        left: { type: 'spring', stiffness: 750, damping: 42, mass: 0.45 },
                        scaleX: LIQUID_SPRING,
                        scaleY: LIQUID_SPRING,
                        opacity: { duration: 0.14 },
                      }}
                      className="pointer-events-none absolute top-1 bottom-1 w-1/4 rounded-full z-20"
                    >
                      <LiquidGlassBackdropLayer
                        preset="droplet"
                        fallbackWidth={84}
                        fallbackHeight={54}
                      />
                    </motion.span>
                  )}
                </AnimatePresence>

                {MOBILE_TABS.map((tab, idx) => {
                  const Icon = tab.icon;
                  const isHighlighted = highlightedIdx === idx;
                  const showRestingLens =
                    !isDraggingLens && activeTabIndex === idx;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        if (suppressNextClickRef.current) return;
                        handleSelectTab(tab.id);
                      }}
                      className="relative h-full flex flex-col items-center justify-center gap-0.5 rounded-full transition-colors whitespace-nowrap shrink-0"
                    >
                      {showRestingLens && (
                        <motion.span
                          layoutId="ios27-liquid-active-lens"
                          transition={LIQUID_SPRING}
                          className="absolute inset-0 rounded-full ios27-liquid-lens z-0"
                        />
                      )}
                      <Icon
                        className={cn(
                          'relative w-[20px] h-[20px] transition-all duration-150 dark:drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]',
                          isDraggingLens && isHighlighted ? 'z-30 scale-110' : 'z-10',
                          isHighlighted
                            ? 'text-[var(--m3-primary)] stroke-[2.35]'
                            : 'text-slate-900 dark:text-white stroke-[1.95]'
                        )}
                      />
                      <span
                        className={cn(
                          'relative text-[10.5px] tracking-tight leading-none transition-all duration-150 dark:drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]',
                          isDraggingLens && isHighlighted ? 'z-30 scale-105' : 'z-10',
                          isHighlighted
                            ? 'text-[var(--m3-primary)] font-bold'
                            : 'text-slate-900 dark:text-white font-semibold'
                        )}
                      >
                        {tab.label}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </motion.div>
          )}
      </div>
    </div>
  );
}
