'use client';

import React, { useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Check,
  Database,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  FastForward,
  Gauge,
  Globe,
  Hand,
  HardDrive,
  Headphones,
  Image as ImageIcon,
  Info,
  KeyRound,
  Layers,
  MessageCircle,
  MessageSquareQuote,
  Minus,
  Moon,
  MoonStar,
  Music2,
  Palette,
  PauseCircle,
  PictureInPicture2,
  Plus,
  Radio,
  RotateCcw,
  Search as SearchIcon,
  Send,
  Shapes,
  SlidersHorizontal,
  Sparkles,
  SquareRoundCorner,
  Sun,
  Timer,
  Trash2,
  Type,
  Upload,
  Users,
  VideoOff,
  Waves,
  X,
} from 'lucide-react';
import { useMusic } from './MusicProvider';
import { LyricsSettingsPreview } from './SyncedLyricsView';
import { EQUALIZER_PRESETS } from '@/lib/metrolist/statsEngine';
import { METROLIST_ACCENT_PALETTES } from '@/lib/metrolist/theme';
import type {
  AccentPreset,
  AodArtworkShape,
  AodBackgroundStyle,
  AodClockStyle,
  ContentRegion,
  EqualizerPreset,
  LyricsAnimationStyle,
  LyricsTextPosition,
  PlayerBackgroundStyle,
  PlayerControlsStyle,
  SliderStyle,
} from '@/lib/metrolist/types';

type SettingsCategory =
  | 'all'
  | 'appearance'
  | 'lyrics'
  | 'player'
  | 'content'
  | 'storage'
  | 'community'
  | 'about';

const REGIONS: { code: ContentRegion; label: string; native: string }[] = [
  { code: 'ID', label: 'Indonesia', native: 'ID' },
  { code: 'US', label: 'United States', native: 'US' },
  { code: 'JP', label: 'Japan', native: 'JP' },
  { code: 'KR', label: 'South Korea', native: 'KR' },
  { code: 'GB', label: 'United Kingdom', native: 'GB' },
];

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const SEEK_DURATIONS = [5, 10, 15, 30];
const CORNER_RADII = [8, 16, 24, 32];

const PLAYER_BG_OPTIONS: { id: PlayerBackgroundStyle; label: string }[] = [
  { id: 'BLURRED_ARTWORK', label: 'Blurred Artwork' },
  { id: 'SOLID', label: 'Solid' },
  { id: 'GRADIENT', label: 'Gradient' },
  { id: 'ANIMATED_GRADIENT', label: 'Animated' },
  { id: 'LIQUID', label: 'Liquid' },
];

const SLIDER_STYLE_OPTIONS: { id: SliderStyle; label: string }[] = [
  { id: 'DEFAULT', label: 'Default' },
  { id: 'SQUIGGLY', label: 'Squiggly' },
  { id: 'WAVY', label: 'Wavy' },
  { id: 'SLIM', label: 'Slim' },
];

const PLAYER_CONTROLS_OPTIONS: { id: PlayerControlsStyle; label: string }[] = [
  { id: 'EXPRESSIVE', label: 'Expressive' },
  { id: 'CLASSIC', label: 'Classic' },
];

const AOD_CLOCK_OPTIONS: { id: AodClockStyle; label: string }[] = [
  { id: 'BOLD', label: 'Bold' },
  { id: 'MINIMAL', label: 'Minimal' },
  { id: 'STACKED', label: 'Stacked' },
];

const AOD_SHAPE_OPTIONS: { id: AodArtworkShape; label: string }[] = [
  { id: 'SQUIRCLE', label: 'Squircle' },
  { id: 'CIRCLE', label: 'Circle' },
  { id: 'ARCH', label: 'Arch' },
  { id: 'ROUNDED', label: 'Rounded' },
  { id: 'DIAMOND', label: 'Diamond' },
];

const AOD_BG_OPTIONS: { id: AodBackgroundStyle; label: string }[] = [
  { id: 'AMBIENT_GLOW', label: 'Ambient Glow' },
  { id: 'ADAPTIVE_ART', label: 'Adaptive Art' },
  { id: 'PURE_BLACK', label: 'Pure OLED' },
];

const EQ_PRESET_KEYS = Object.keys(EQUALIZER_PRESETS) as Array<
  Exclude<EqualizerPreset, 'CUSTOM'>
>;

const LYRICS_STYLE_OPTIONS: {
  id: LyricsAnimationStyle;
  label: string;
  desc: string;
}[] = [
  { id: 'APPLE', label: 'Apple', desc: 'Smooth horizontal fill with soft float & glow' },
  { id: 'BRACCATO', label: 'Braccato', desc: '900ms rising wave crest with 1.11× emphasis' },
  { id: 'EXPRESSIVE', label: 'Expressive', desc: 'Snappy 125ms attack bounce & vivid bloom' },
  { id: 'SIMPLE', label: 'Simple', desc: 'Clean karaoke word sweep without bounce' },
  { id: 'NONE', label: 'None', desc: 'Instant line highlight without word motion' },
];

const LYRICS_ALIGN_OPTIONS: {
  id: LyricsTextPosition;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'LEFT', label: 'Left', icon: AlignLeft },
  { id: 'CENTER', label: 'Center', icon: AlignCenter },
  { id: 'RIGHT', label: 'Right', icon: AlignRight },
];

const SLEEP_OPTIONS: { label: string; minutes: number | null }[] = [
  { label: 'Off', minutes: null },
  { label: '15m', minutes: 15 },
  { label: '30m', minutes: 30 },
  { label: '45m', minutes: 45 },
  { label: '60m', minutes: 60 },
];

const CATEGORIES: {
  id: SettingsCategory;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'all', label: 'All', icon: SlidersHorizontal },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'lyrics', label: 'Lyrics', icon: MessageSquareQuote },
  { id: 'player', label: 'Player & Audio', icon: Headphones },
  { id: 'content', label: 'Content', icon: Globe },
  { id: 'storage', label: 'Storage', icon: Database },
  { id: 'community', label: 'Community', icon: Users },
  { id: 'about', label: 'About', icon: Info },
];

function M3Switch({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors duration-200 ${
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
      } ${
        checked
          ? 'bg-[var(--m3-primary)] border-[var(--m3-primary)]'
          : 'bg-black/10 dark:bg-white/[0.10] border-black/15 dark:border-white/20'
      }`}
    >
      <span
        className={`inline-block rounded-full transition-all duration-200 shadow-sm ${
          checked
            ? 'h-5 w-5 translate-x-[23px] bg-[var(--m3-on-primary)]'
            : 'h-4 w-4 translate-x-[5px] bg-neutral-500 dark:bg-neutral-300'
        }`}
      />
    </button>
  );
}

function PreferenceRow({
  icon: Icon,
  title,
  description,
  trailing,
  accentTint,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  trailing?: React.ReactNode;
  accentTint?: string;
  onClick?: () => void;
}) {
  const Wrapper = onClick ? 'button' : 'div';
  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left ${
        onClick
          ? 'hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors'
          : ''
      }`}
    >
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <span
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{
            backgroundColor: accentTint
              ? `${accentTint}22`
              : 'color-mix(in srgb, var(--m3-primary) 14%, transparent)',
            color: accentTint || 'var(--m3-primary)',
          }}
        >
          <Icon className="w-[18px] h-[18px]" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[14.5px] font-semibold leading-snug">{title}</p>
          <p className="text-[12.5px] opacity-60 leading-snug mt-0.5">
            {description}
          </p>
        </div>
      </div>
      {trailing && <div className="shrink-0">{trailing}</div>}
    </Wrapper>
  );
}

export function SettingsView() {
  const {
    settings,
    updateSettings,
    resetSettings,
    exportLibraryBackup,
    importLibraryBackup,
    clearPlayHistory,
    clearSearchHistory,
    history,
    likedTracks,
    playlists,
    savedCollection,
    searchHistory,
    sleepTimerMinutes,
    setSleepTimer,
    showToast,
    popupMode,
    openBackgroundPopup,
    closeBackgroundPopup,
    currentTrack,
  } = useMusic();

  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('all');
  const [filterText, setFilterText] = useState('');
  const [cookieDraft, setCookieDraft] = useState(settings.ytCookie);
  const [showCookie, setShowCookie] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const normalizedFilter = filterText.trim().toLowerCase();

  const matchesSearch = (keywords: string) => {
    if (!normalizedFilter) return true;
    return keywords.toLowerCase().includes(normalizedFilter);
  };

  const showSection = (category: SettingsCategory, sectionKeywords: string) => {
    if (normalizedFilter) return matchesSearch(sectionKeywords);
    return activeCategory === 'all' || activeCategory === category;
  };

  const storageSummaryKb = useMemo(() => {
    try {
      const approxBytes = new Blob([
        JSON.stringify({
          history,
          likedTracks,
          playlists,
          savedCollection,
          searchHistory,
          settings,
        }),
      ]).size;
      return Math.max(1, Math.round(approxBytes / 1024));
    } catch {
      return 1;
    }
  }, [history, likedTracks, playlists, savedCollection, searchHistory, settings]);

  const handleSaveCookie = () => {
    updateSettings({ ytCookie: cookieDraft.trim() });
    showToast(
      cookieDraft.trim()
        ? 'YouTube Music cookie saved'
        : 'YouTube Music cookie cleared'
    );
  };

  const handleExportBackup = () => {
    const json = exportLibraryBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `zra-backup-${dateStamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Backup exported as JSON');
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const result = importLibraryBackup(text);
      if (!result.ok) {
        showToast(result.message);
      }
    } catch {
      showToast('Failed to read backup file');
    } finally {
      e.target.value = '';
    }
  };

  const activeThemeLabel =
    settings.theme === 'dark'
      ? settings.pureBlack
        ? 'Pure Black AMOLED'
        : 'ZRA Dark'
      : 'ZRA Light';

  return (
    <div className="space-y-6 pb-10 max-w-4xl mx-auto">
      {/* Sonara Material 3 Settings Top Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1 className="text-[28px] sm:text-[32px] font-bold tracking-tight">
              Settings
            </h1>
            <p className="text-[13px] opacity-65 mt-0.5">
              {activeThemeLabel} · Region {settings.region} · {settings.playbackRate}× speed
            </p>
          </div>

          {/* Real Live Preference Search (signature Metrolist M3 feature) */}
          <div className="relative w-full sm:w-64">
            <SearchIcon className="w-4 h-4 opacity-50 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Search settings..."
              aria-label="Filter settings"
              className="w-full h-10 pl-10 pr-9 rounded-full bg-black/[0.05] dark:bg-white/[0.07] text-[13.5px] placeholder:opacity-55 focus:outline-none focus:ring-2 focus:ring-[var(--m3-primary)]/45"
            />
            {filterText && (
              <button
                type="button"
                onClick={() => setFilterText('')}
                aria-label="Clear settings filter"
                className="w-7 h-7 rounded-full flex items-center justify-center absolute right-1.5 top-1/2 -translate-y-1/2 hover:bg-black/10 dark:hover:bg-white/10"
              >
                <X className="w-3.5 h-3.5 opacity-65" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Strip */}
        {!normalizedFilter && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const active = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`inline-flex items-center gap-2 px-3.5 h-9 rounded-full text-[13px] font-semibold shrink-0 transition-all ${
                    active
                      ? 'bg-[var(--m3-primary)] text-[var(--m3-on-primary)]'
                      : 'metro-surface text-neutral-700 dark:text-neutral-200 hover:brightness-110'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 1. APPEARANCE */}
      {showSection(
        'appearance',
        'appearance theme dark light pure black amoled dynamic color accent palette sonara navigation bar dock style liquid glass default android player background blurred artwork gradient animated slider squiggly wavy slim corner radius swipe gesture expressive controls classic ambient aod clock bold minimal stacked shape squircle circle diamond'
      ) && (
        <section className="space-y-2.5">
          <h2 className="px-1 text-[12px] font-bold uppercase tracking-wider text-[var(--m3-primary)]">
            Appearance
          </h2>
          <div className="rounded-[24px] metro-surface overflow-hidden divide-y divide-black/[0.06] dark:divide-white/[0.06]">
            {/* Theme Mode */}
            <div className="px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0">
                <span
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor:
                      'color-mix(in srgb, var(--m3-primary) 14%, transparent)',
                    color: 'var(--m3-primary)',
                  }}
                >
                  {settings.theme === 'dark' ? (
                    <Moon className="w-[18px] h-[18px]" />
                  ) : (
                    <Sun className="w-[18px] h-[18px]" />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="text-[14.5px] font-semibold">Theme Mode</p>
                  <p className="text-[12.5px] opacity-60">
                    Sonara Material 3 surface styling
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-full bg-black/[0.05] dark:bg-white/[0.06] sm:w-48 shrink-0">
                <button
                  type="button"
                  onClick={() => updateSettings({ theme: 'dark' })}
                  className={`h-8 rounded-full text-[12.5px] font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    settings.theme === 'dark'
                      ? 'bg-[var(--m3-primary)] text-[var(--m3-on-primary)] shadow-sm'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" /> Dark
                </button>
                <button
                  type="button"
                  onClick={() => updateSettings({ theme: 'light' })}
                  className={`h-8 rounded-full text-[12.5px] font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    settings.theme === 'light'
                      ? 'bg-[var(--m3-primary)] text-[var(--m3-on-primary)] shadow-sm'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" /> Light
                </button>
              </div>
            </div>

            {/* Navigation Bar Style (Default vs Liquid Glass) */}
            <div className="px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0">
                <span
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor:
                      'color-mix(in srgb, var(--m3-primary) 14%, transparent)',
                    color: 'var(--m3-primary)',
                  }}
                >
                  <Layers className="w-[18px] h-[18px]" />
                </span>
                <div className="min-w-0">
                  <p className="text-[14.5px] font-semibold">Navigation Bar Style</p>
                  <p className="text-[12.5px] opacity-60">
                    Liquid Glass (floating &amp; slide) or Default (lightweight for older Android)
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-full bg-black/[0.05] dark:bg-white/[0.06] sm:w-56 shrink-0">
                <button
                  type="button"
                  data-testid="dock-style-default"
                  onClick={() => {
                    updateSettings({ dockStyle: 'default' });
                    showToast('Navigation bar: Default (lightweight)');
                  }}
                  className={`h-8 rounded-full text-[12.5px] font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    settings.dockStyle !== 'liquid-glass'
                      ? 'bg-[var(--m3-primary)] text-[var(--m3-on-primary)] shadow-sm'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  Default
                </button>
                <button
                  type="button"
                  data-testid="dock-style-liquid-glass"
                  onClick={() => {
                    updateSettings({ dockStyle: 'liquid-glass' });
                    showToast('Navigation bar: Liquid Glass (iOS 27)');
                  }}
                  className={`h-8 rounded-full text-[12.5px] font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    settings.dockStyle === 'liquid-glass'
                      ? 'bg-[var(--m3-primary)] text-[var(--m3-on-primary)] shadow-sm'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" /> Liquid Glass
                </button>
              </div>
            </div>

            {/* Pure Black AMOLED */}
            <PreferenceRow
              icon={Moon}
              title="Pure Black (AMOLED)"
              description={
                settings.theme === 'dark'
                  ? 'True #000000 canvas for OLED screens'
                  : 'Switch to Dark mode to enable Pure Black'
              }
              trailing={
                <M3Switch
                  label="Pure Black AMOLED"
                  checked={settings.pureBlack}
                  disabled={settings.theme !== 'dark'}
                  onChange={() =>
                    updateSettings({ pureBlack: !settings.pureBlack })
                  }
                />
              }
            />

            {/* Dynamic Theme Color */}
            <PreferenceRow
              icon={Sparkles}
              title="Dynamic Theme Color"
              description="Extract Material You accent from playing track artwork"
              trailing={
                <M3Switch
                  label="Dynamic Theme Color"
                  checked={settings.dynamicColor}
                  onChange={() =>
                    updateSettings({ dynamicColor: !settings.dynamicColor })
                  }
                />
              }
            />

            {/* Accent Seed Palette */}
            <div className="px-4 py-3.5 space-y-3">
              <div className="flex items-center gap-3.5">
                <span
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor:
                      'color-mix(in srgb, var(--m3-primary) 14%, transparent)',
                    color: 'var(--m3-primary)',
                  }}
                >
                  <Palette className="w-[18px] h-[18px]" />
                </span>
                <div className="min-w-0">
                  <p className="text-[14.5px] font-semibold">Accent Seed Color</p>
                  <p className="text-[12.5px] opacity-60">
                    Used across buttons, progress bars, and highlights
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pl-0 sm:pl-[54px] pb-0.5">
                {(Object.keys(METROLIST_ACCENT_PALETTES) as AccentPreset[]).map((key) => {
                  const preset = METROLIST_ACCENT_PALETTES[key];
                  const selected = settings.accentPreset === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => updateSettings({ accentPreset: key })}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[12.5px] font-semibold shrink-0 border transition-all ${
                        selected
                          ? 'border-[var(--m3-primary)] bg-[var(--m3-primary)]/14'
                          : 'border-black/10 dark:border-white/10 hover:bg-black/[0.04] dark:hover:bg-white/[0.05]'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: preset.swatch }}
                      >
                        {selected && (
                          <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                        )}
                      </span>
                      <span>{preset.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Player Background Style */}
            <div className="px-4 py-3.5 space-y-3">
              <div className="flex items-center gap-3.5">
                <span
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor:
                      'color-mix(in srgb, var(--m3-primary) 14%, transparent)',
                    color: 'var(--m3-primary)',
                  }}
                >
                  <ImageIcon className="w-[18px] h-[18px]" />
                </span>
                <div className="min-w-0">
                  <p className="text-[14.5px] font-semibold">Player Background Style</p>
                  <p className="text-[12.5px] opacity-60">
                    Ambient visual backdrop inside the full-screen Now Playing sheet
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 pl-0 sm:pl-[54px]">
                {PLAYER_BG_OPTIONS.map((opt) => {
                  const active = settings.playerBackgroundStyle === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      data-testid={`player-bg-${opt.id.toLowerCase()}`}
                      onClick={() => {
                        updateSettings({ playerBackgroundStyle: opt.id });
                        showToast(`Player background: ${opt.label}`);
                      }}
                      className={`px-3.5 h-8 rounded-full text-[12.5px] font-semibold transition-all ${
                        active
                          ? 'bg-[var(--m3-primary)] text-[var(--m3-on-primary)] shadow-sm'
                          : 'bg-black/[0.05] dark:bg-white/[0.06] hover:bg-black/10 dark:hover:bg-white/10'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Progress Slider Style */}
            <div className="px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0">
                <span
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor:
                      'color-mix(in srgb, var(--m3-primary) 14%, transparent)',
                    color: 'var(--m3-primary)',
                  }}
                >
                  <Waves className="w-[18px] h-[18px]" />
                </span>
                <div className="min-w-0">
                  <p className="text-[14.5px] font-semibold">Progress Slider Style</p>
                  <p className="text-[12.5px] opacity-60">
                    Animated Squiggly wave, M3 Wavy, Slim, or Default bar
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {SLIDER_STYLE_OPTIONS.map((opt) => {
                  const active = settings.sliderStyle === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      data-testid={`slider-style-${opt.id.toLowerCase()}`}
                      onClick={() => {
                        updateSettings({ sliderStyle: opt.id });
                        showToast(`Slider style: ${opt.label}`);
                      }}
                      className={`px-3 h-8 rounded-full text-[12.5px] font-semibold transition-all ${
                        active
                          ? 'bg-[var(--m3-primary)] text-[var(--m3-on-primary)] shadow-sm'
                          : 'bg-black/[0.05] dark:bg-white/[0.06] hover:bg-black/10 dark:hover:bg-white/10'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Artwork Corner Radius */}
            <div className="px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0">
                <span
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor:
                      'color-mix(in srgb, var(--m3-primary) 14%, transparent)',
                    color: 'var(--m3-primary)',
                  }}
                >
                  <SquareRoundCorner className="w-[18px] h-[18px]" />
                </span>
                <div className="min-w-0">
                  <p className="text-[14.5px] font-semibold">Artwork Corner Radius</p>
                  <p className="text-[12.5px] opacity-60">
                    Roundness of album artwork in Now Playing
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {CORNER_RADII.map((radius) => {
                  const active = settings.thumbnailCornerRadius === radius;
                  return (
                    <button
                      key={radius}
                      type="button"
                      onClick={() => updateSettings({ thumbnailCornerRadius: radius })}
                      className={`px-3 h-8 rounded-full text-[12.5px] font-semibold tabular-nums transition-all ${
                        active
                          ? 'bg-[var(--m3-primary)] text-[var(--m3-on-primary)]'
                          : 'bg-black/[0.05] dark:bg-white/[0.06] hover:bg-black/10 dark:hover:bg-white/10'
                      }`}
                    >
                      {radius}px
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Player Controls Style (Expressive Elastic vs Classic) */}
            <div className="px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0">
                <span
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor:
                      'color-mix(in srgb, var(--m3-primary) 14%, transparent)',
                    color: 'var(--m3-primary)',
                  }}
                >
                  <Sparkles className="w-[18px] h-[18px]" />
                </span>
                <div className="min-w-0">
                  <p className="text-[14.5px] font-semibold">Player Controls Style</p>
                  <p className="text-[12.5px] opacity-60">
                    Elastic morphing transport pills or classic circular buttons
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-full bg-black/[0.05] dark:bg-white/[0.06] sm:w-52 shrink-0">
                {PLAYER_CONTROLS_OPTIONS.map((opt) => {
                  const active = (settings.playerControlsStyle ?? 'EXPRESSIVE') === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      data-testid={`controls-style-${opt.id.toLowerCase()}`}
                      onClick={() => {
                        updateSettings({ playerControlsStyle: opt.id });
                        showToast(`Player controls: ${opt.label}`);
                      }}
                      className={`h-8 rounded-full text-[12.5px] font-semibold transition-all ${
                        active
                          ? 'bg-[var(--m3-primary)] text-[var(--m3-on-primary)] shadow-sm'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ambient Display Clock Style */}
            <div className="px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0">
                <span
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor:
                      'color-mix(in srgb, var(--m3-primary) 14%, transparent)',
                    color: 'var(--m3-primary)',
                  }}
                >
                  <MoonStar className="w-[18px] h-[18px]" />
                </span>
                <div className="min-w-0">
                  <p className="text-[14.5px] font-semibold">Ambient Clock Style</p>
                  <p className="text-[12.5px] opacity-60">
                    Typography layout inside Always-On Display mode
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {AOD_CLOCK_OPTIONS.map((opt) => {
                  const active = (settings.aodClockStyle ?? 'BOLD') === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => updateSettings({ aodClockStyle: opt.id })}
                      className={`px-3 h-8 rounded-full text-[12.5px] font-semibold transition-all ${
                        active
                          ? 'bg-[var(--m3-primary)] text-[var(--m3-on-primary)] shadow-sm'
                          : 'bg-black/[0.05] dark:bg-white/[0.06] hover:bg-black/10 dark:hover:bg-white/10'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ambient Display Artwork Shape */}
            <div className="px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0">
                <span
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor:
                      'color-mix(in srgb, var(--m3-primary) 14%, transparent)',
                    color: 'var(--m3-primary)',
                  }}
                >
                  <Shapes className="w-[18px] h-[18px]" />
                </span>
                <div className="min-w-0">
                  <p className="text-[14.5px] font-semibold">Ambient Artwork Shape</p>
                  <p className="text-[12.5px] opacity-60">
                    Cover art mask geometry in Always-On Display mode
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {AOD_SHAPE_OPTIONS.map((opt) => {
                  const active = (settings.aodArtworkShape ?? 'SQUIRCLE') === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => updateSettings({ aodArtworkShape: opt.id })}
                      className={`px-3 h-8 rounded-full text-[12.5px] font-semibold transition-all ${
                        active
                          ? 'bg-[var(--m3-primary)] text-[var(--m3-on-primary)] shadow-sm'
                          : 'bg-black/[0.05] dark:bg-white/[0.06] hover:bg-black/10 dark:hover:bg-white/10'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ambient Display Backdrop */}
            <div className="px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0">
                <span
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor:
                      'color-mix(in srgb, var(--m3-primary) 14%, transparent)',
                    color: 'var(--m3-primary)',
                  }}
                >
                  <Palette className="w-[18px] h-[18px]" />
                </span>
                <div className="min-w-0">
                  <p className="text-[14.5px] font-semibold">Ambient Backdrop</p>
                  <p className="text-[12.5px] opacity-60">
                    OLED Pure Black, subtle radial glow, or blurred album art
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {AOD_BG_OPTIONS.map((opt) => {
                  const active = (settings.aodBackgroundStyle ?? 'AMBIENT_GLOW') === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => updateSettings({ aodBackgroundStyle: opt.id })}
                      className={`px-3 h-8 rounded-full text-[12.5px] font-semibold transition-all ${
                        active
                          ? 'bg-[var(--m3-primary)] text-[var(--m3-on-primary)] shadow-sm'
                          : 'bg-black/[0.05] dark:bg-white/[0.06] hover:bg-black/10 dark:hover:bg-white/10'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Swipe Artwork to Change Track */}
            <PreferenceRow
              icon={Hand}
              title="Swipe Artwork to Change Track"
              description="Drag left or right on the Now Playing cover to skip tracks"
              trailing={
                <M3Switch
                  label="Swipe Artwork to Change Track"
                  checked={settings.swipeToChangeTrack}
                  onChange={() =>
                    updateSettings({
                      swipeToChangeTrack: !settings.swipeToChangeTrack,
                    })
                  }
                />
              }
            />
          </div>
        </section>
      )}

      {/* 2. LYRICS ANIMATION & DISPLAY */}
      {showSection(
        'lyrics',
        'lyrics animation apple braccato expressive simple none alignment left center right font size line spacing progressive blur neutral color tap seek auto scroll timing offset sync'
      ) && (
        <section data-testid="settings-lyrics-section" className="space-y-2.5">
          <h2 className="px-1 text-[12px] font-bold uppercase tracking-wider text-[var(--m3-primary)]">
            Lyrics &amp; Animation
          </h2>

          {/* Live Interactive Lyrics Preview */}
          <LyricsSettingsPreview
            animationStyle={settings.lyricsAnimationStyle}
            textPosition={settings.lyricsTextPosition}
            fontSize={settings.lyricsFontSize}
            lineSpacing={settings.lyricsLineSpacing}
            progressiveBlur={settings.lyricsProgressiveBlur}
            neutralColor={settings.lyricsNeutralColor}
          />

          <div className="rounded-[24px] metro-surface overflow-hidden divide-y divide-black/[0.06] dark:divide-white/[0.06]">
            {/* Lyrics Animation Style */}
            <div className="px-4 py-3.5 space-y-3">
              <div className="flex items-center gap-3.5">
                <span
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor:
                      'color-mix(in srgb, var(--m3-primary) 14%, transparent)',
                    color: 'var(--m3-primary)',
                  }}
                >
                  <Sparkles className="w-[18px] h-[18px]" />
                </span>
                <div className="min-w-0">
                  <p className="text-[14.5px] font-semibold">Word Animation Style</p>
                  <p className="text-[12.5px] opacity-60">
                    {LYRICS_STYLE_OPTIONS.find((s) => s.id === settings.lyricsAnimationStyle)?.desc}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 pl-0 sm:pl-[54px]">
                {LYRICS_STYLE_OPTIONS.map((opt) => {
                  const active = settings.lyricsAnimationStyle === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      data-testid={`lyrics-style-${opt.id.toLowerCase()}`}
                      onClick={() => updateSettings({ lyricsAnimationStyle: opt.id })}
                      className={`px-3.5 h-8 rounded-full text-[12.5px] font-semibold transition-all ${
                        active
                          ? 'bg-[var(--m3-primary)] text-[var(--m3-on-primary)] shadow-sm'
                          : 'bg-black/[0.05] dark:bg-white/[0.06] hover:bg-black/10 dark:hover:bg-white/10'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Text Alignment */}
            <div className="px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0">
                <span
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor:
                      'color-mix(in srgb, var(--m3-primary) 14%, transparent)',
                    color: 'var(--m3-primary)',
                  }}
                >
                  <AlignCenter className="w-[18px] h-[18px]" />
                </span>
                <div className="min-w-0">
                  <p className="text-[14.5px] font-semibold">Text Alignment</p>
                  <p className="text-[12.5px] opacity-60">
                    Horizontal lyric alignment inside Now Playing
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-full bg-black/[0.05] dark:bg-white/[0.06] sm:w-56 shrink-0">
                {LYRICS_ALIGN_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const active = settings.lyricsTextPosition === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      data-testid={`lyrics-align-${opt.id.toLowerCase()}`}
                      onClick={() => updateSettings({ lyricsTextPosition: opt.id })}
                      className={`h-8 rounded-full text-[12px] font-semibold flex items-center justify-center gap-1 transition-all ${
                        active
                          ? 'bg-[var(--m3-primary)] text-[var(--m3-on-primary)] shadow-sm'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Lyrics Color Mode */}
            <div className="px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0">
                <span
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor:
                      'color-mix(in srgb, var(--m3-primary) 14%, transparent)',
                    color: 'var(--m3-primary)',
                  }}
                >
                  <Palette className="w-[18px] h-[18px]" />
                </span>
                <div className="min-w-0">
                  <p className="text-[14.5px] font-semibold">Lyrics Text Color</p>
                  <p className="text-[12.5px] opacity-60">
                    Match dynamic theme accent or use clean high-contrast neutral text
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-full bg-black/[0.05] dark:bg-white/[0.06] sm:w-48 shrink-0">
                <button
                  type="button"
                  onClick={() => updateSettings({ lyricsNeutralColor: false })}
                  className={`h-8 rounded-full text-[12.5px] font-semibold transition-all ${
                    !settings.lyricsNeutralColor
                      ? 'bg-[var(--m3-primary)] text-[var(--m3-on-primary)] shadow-sm'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  Theme
                </button>
                <button
                  type="button"
                  onClick={() => updateSettings({ lyricsNeutralColor: true })}
                  className={`h-8 rounded-full text-[12.5px] font-semibold transition-all ${
                    settings.lyricsNeutralColor
                      ? 'bg-[var(--m3-primary)] text-[var(--m3-on-primary)] shadow-sm'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  Neutral
                </button>
              </div>
            </div>

            {/* Text Size Slider */}
            <div className="px-4 py-3.5 space-y-2.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0">
                  <span
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor:
                        'color-mix(in srgb, var(--m3-primary) 14%, transparent)',
                      color: 'var(--m3-primary)',
                    }}
                  >
                    <Type className="w-[18px] h-[18px]" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[14.5px] font-semibold">Lyrics Text Size</p>
                    <p className="text-[12.5px] opacity-60">
                      Adjust synced lyric font scale (18px – 34px)
                    </p>
                  </div>
                </div>
                <span className="text-[13px] font-mono-nums font-bold text-[var(--m3-primary)] shrink-0">
                  {settings.lyricsFontSize}px
                </span>
              </div>
              <div className="pl-0 sm:pl-[54px]">
                <input
                  type="range"
                  min={18}
                  max={34}
                  step={1}
                  aria-label="Lyrics text size"
                  value={settings.lyricsFontSize}
                  onChange={(e) =>
                    updateSettings({ lyricsFontSize: Number(e.target.value) })
                  }
                  className="w-full h-2 rounded-full appearance-none cursor-pointer bg-black/10 dark:bg-white/15 accent-[var(--m3-primary)]"
                />
              </div>
            </div>

            {/* Line Spacing Slider */}
            <div className="px-4 py-3.5 space-y-2.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0">
                  <span
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor:
                        'color-mix(in srgb, var(--m3-primary) 14%, transparent)',
                      color: 'var(--m3-primary)',
                    }}
                  >
                    <SlidersHorizontal className="w-[18px] h-[18px]" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[14.5px] font-semibold">Line Spacing</p>
                    <p className="text-[12.5px] opacity-60">
                      Vertical breathing room between lyric lines (1.0× – 2.2×)
                    </p>
                  </div>
                </div>
                <span className="text-[13px] font-mono-nums font-bold text-[var(--m3-primary)] shrink-0">
                  {settings.lyricsLineSpacing.toFixed(2)}×
                </span>
              </div>
              <div className="pl-0 sm:pl-[54px]">
                <input
                  type="range"
                  min={1.0}
                  max={2.2}
                  step={0.05}
                  aria-label="Lyrics line spacing"
                  value={settings.lyricsLineSpacing}
                  onChange={(e) =>
                    updateSettings({
                      lyricsLineSpacing: Number(Number(e.target.value).toFixed(2)),
                    })
                  }
                  className="w-full h-2 rounded-full appearance-none cursor-pointer bg-black/10 dark:bg-white/15 accent-[var(--m3-primary)]"
                />
              </div>
            </div>

            {/* Progressive Blur */}
            <PreferenceRow
              icon={Eye}
              title="Progressive Depth Blur"
              description="Softly blur inactive lines by distance; clears automatically while scrolling"
              trailing={
                <M3Switch
                  label="Progressive Depth Blur"
                  checked={settings.lyricsProgressiveBlur}
                  onChange={() =>
                    updateSettings({
                      lyricsProgressiveBlur: !settings.lyricsProgressiveBlur,
                    })
                  }
                />
              }
            />

            {/* Tap Line to Seek */}
            <PreferenceRow
              icon={Hand}
              title="Tap Line to Seek"
              description="Jump straight to any synced lyric timestamp on tap"
              trailing={
                <M3Switch
                  label="Tap Line to Seek"
                  checked={settings.lyricsClickToSeek}
                  onChange={() =>
                    updateSettings({
                      lyricsClickToSeek: !settings.lyricsClickToSeek,
                    })
                  }
                />
              }
            />

            {/* Auto-Scroll Lyrics */}
            <PreferenceRow
              icon={MessageSquareQuote}
              title="Auto-Scroll Lyrics"
              description="Keep the currently singing line centered automatically"
              trailing={
                <M3Switch
                  label="Auto-Scroll Lyrics"
                  checked={settings.lyricsAutoScroll}
                  onChange={() =>
                    updateSettings({
                      lyricsAutoScroll: !settings.lyricsAutoScroll,
                    })
                  }
                />
              }
            />

            {/* Global Timing Offset */}
            <div className="px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0">
                <span
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor:
                      'color-mix(in srgb, var(--m3-primary) 14%, transparent)',
                    color: 'var(--m3-primary)',
                  }}
                >
                  <Timer className="w-[18px] h-[18px]" />
                </span>
                <div className="min-w-0">
                  <p className="text-[14.5px] font-semibold">Global Timing Offset</p>
                  <p className="text-[12.5px] opacity-60">
                    Shift synced lyrics earlier (+) or later (−) in 100ms steps
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    updateSettings({
                      lyricsGlobalOffsetMs: Math.max(
                        -2000,
                        settings.lyricsGlobalOffsetMs - 100
                      ),
                    })
                  }
                  aria-label="Decrease lyrics offset by 100ms"
                  className="w-8 h-8 rounded-full bg-black/[0.06] dark:bg-white/[0.08] flex items-center justify-center hover:bg-black/15 dark:hover:bg-white/15 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span
                  data-testid="settings-lyrics-offset-value"
                  className="min-w-[64px] text-center font-mono-nums text-[13px] font-bold"
                >
                  {settings.lyricsGlobalOffsetMs > 0
                    ? `+${settings.lyricsGlobalOffsetMs}`
                    : settings.lyricsGlobalOffsetMs}
                  ms
                </span>
                <button
                  type="button"
                  onClick={() =>
                    updateSettings({
                      lyricsGlobalOffsetMs: Math.min(
                        2000,
                        settings.lyricsGlobalOffsetMs + 100
                      ),
                    })
                  }
                  aria-label="Increase lyrics offset by 100ms"
                  className="w-8 h-8 rounded-full bg-black/[0.06] dark:bg-white/[0.08] flex items-center justify-center hover:bg-black/15 dark:hover:bg-white/15 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                {settings.lyricsGlobalOffsetMs !== 0 && (
                  <button
                    type="button"
                    onClick={() => updateSettings({ lyricsGlobalOffsetMs: 0 })}
                    aria-label="Reset global lyrics offset"
                    className="px-2.5 h-8 rounded-full bg-[var(--m3-primary)]/14 text-[var(--m3-primary)] text-[11.5px] font-semibold"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. PLAYER & AUDIO */}
      {showSection(
        'player',
        'player audio background playback dynamic island pip popout speed rate sleep timer radio automix hide video seek duration keep paused song change auto skip error'
      ) && (
        <section className="space-y-2.5">
          <h2 className="px-1 text-[12px] font-bold uppercase tracking-wider text-[var(--m3-primary)]">
            Player & Audio
          </h2>
          <div className="rounded-[24px] metro-surface overflow-hidden divide-y divide-black/[0.06] dark:divide-white/[0.06]">
            {/* Background Audio Keep-Alive */}
            <PreferenceRow
              icon={Headphones}
              title="Background Audio Keep-Alive"
              description="Preserve Media Session lock-screen controls & resume on tab switch"
              trailing={
                <M3Switch
                  label="Background Audio Keep-Alive"
                  checked={settings.backgroundPlay}
                  onChange={() =>
                    updateSettings({ backgroundPlay: !settings.backgroundPlay })
                  }
                />
              }
            />

            {/* Auto Pop-Out Dynamic Island */}
            <PreferenceRow
              icon={PictureInPicture2}
              title="Auto Pop-Out Dynamic Island"
              description="Automatically open floating Dynamic Island PiP when leaving tab"
              trailing={
                <M3Switch
                  label="Auto Pop-Out Dynamic Island"
                  checked={settings.autoPopoutIsland}
                  onChange={() =>
                    updateSettings({
                      autoPopoutIsland: !settings.autoPopoutIsland,
                    })
                  }
                />
              }
            />

            {/* Live Launch Dynamic Island Action */}
            <div className="px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0">
                <span
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor:
                      'color-mix(in srgb, var(--m3-primary) 14%, transparent)',
                    color: 'var(--m3-primary)',
                  }}
                >
                  <PictureInPicture2 className="w-[18px] h-[18px]" />
                </span>
                <div className="min-w-0">
                  <p className="text-[14.5px] font-semibold">
                    Floating Dynamic Island Pro
                  </p>
                  <p className="text-[12.5px] opacity-60 truncate">
                    {popupMode !== 'off'
                      ? `Active (${popupMode})`
                      : currentTrack
                        ? `Ready for "${currentTrack.title}"`
                        : 'Play any track to pop out floating controls'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  popupMode !== 'off'
                    ? closeBackgroundPopup()
                    : openBackgroundPopup()
                }
                className={`px-4 h-9 rounded-full text-[12.5px] font-semibold inline-flex items-center justify-center gap-1.5 shrink-0 transition-all ${
                  popupMode !== 'off'
                    ? 'bg-rose-500/15 text-rose-500 hover:bg-rose-500/25'
                    : 'bg-[var(--m3-primary)] text-[var(--m3-on-primary)]'
                }`}
              >
                <PictureInPicture2 className="w-3.5 h-3.5" />
                {popupMode !== 'off' ? 'Dock Island' : 'Pop Out Island'}
              </button>
            </div>

            {/* Playback Speed */}
            <div className="px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0">
                <span
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor:
                      'color-mix(in srgb, var(--m3-primary) 14%, transparent)',
                    color: 'var(--m3-primary)',
                  }}
                >
                  <Gauge className="w-[18px] h-[18px]" />
                </span>
                <div className="min-w-0">
                  <p className="text-[14.5px] font-semibold">Playback Speed</p>
                  <p className="text-[12.5px] opacity-60">
                    Applied live to the YouTube Music audio stream
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {SPEEDS.map((spd) => {
                  const active = settings.playbackRate === spd;
                  return (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => updateSettings({ playbackRate: spd })}
                      className={`px-3 h-8 rounded-full text-[12.5px] font-semibold tabular-nums transition-all ${
                        active
                          ? 'bg-[var(--m3-primary)] text-[var(--m3-on-primary)]'
                          : 'bg-black/[0.05] dark:bg-white/[0.06] hover:bg-black/10 dark:hover:bg-white/10'
                      }`}
                    >
                      {spd}×
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sleep Timer (Live wired to MusicProvider) */}
            <div className="px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0">
                <span
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor:
                      'color-mix(in srgb, var(--m3-primary) 14%, transparent)',
                    color: 'var(--m3-primary)',
                  }}
                >
                  <Timer className="w-[18px] h-[18px]" />
                </span>
                <div className="min-w-0">
                  <p className="text-[14.5px] font-semibold">Sleep Timer</p>
                  <p className="text-[12.5px] opacity-60">
                    {sleepTimerMinutes
                      ? `Pauses playback automatically in ${sleepTimerMinutes} min`
                      : 'Automatically pause music after a countdown'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {SLEEP_OPTIONS.map((opt) => {
                  const active = sleepTimerMinutes === opt.minutes;
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setSleepTimer(opt.minutes)}
                      className={`px-3 h-8 rounded-full text-[12.5px] font-semibold tabular-nums transition-all ${
                        active
                          ? 'bg-[var(--m3-primary)] text-[var(--m3-on-primary)]'
                          : 'bg-black/[0.05] dark:bg-white/[0.06] hover:bg-black/10 dark:hover:bg-white/10'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Audio Equalizer Preset */}
            <div className="px-4 py-3.5 space-y-3">
              <div className="flex items-center gap-3.5">
                <span
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor:
                      'color-mix(in srgb, var(--m3-primary) 14%, transparent)',
                    color: 'var(--m3-primary)',
                  }}
                >
                  <SlidersHorizontal className="w-[18px] h-[18px]" />
                </span>
                <div className="min-w-0">
                  <p className="text-[14.5px] font-semibold">Audio Equalizer Profile</p>
                  <p className="text-[12.5px] opacity-60">
                    Choose a 5-band tuning curve (fine-tune bands inside Now Playing → EQ)
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 pl-0 sm:pl-[54px]">
                {EQ_PRESET_KEYS.map((key) => {
                  const preset = EQUALIZER_PRESETS[key];
                  const active = (settings.equalizerPreset ?? 'FLAT') === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        updateSettings({
                          equalizerPreset: key,
                          equalizerBands: [...preset.bands],
                        });
                        showToast(`Equalizer: ${preset.label}`);
                      }}
                      className={`px-3.5 h-8 rounded-full text-[12.5px] font-semibold transition-all ${
                        active
                          ? 'bg-[var(--m3-primary)] text-[var(--m3-on-primary)] shadow-sm'
                          : 'bg-black/[0.05] dark:bg-white/[0.06] hover:bg-black/10 dark:hover:bg-white/10'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Auto-Continue Radio */}
            <PreferenceRow
              icon={Radio}
              title="Auto-Continue Radio (Automix)"
              description="Queue related YouTube Music tracks when reaching the end"
              trailing={
                <M3Switch
                  label="Auto-Continue Radio"
                  checked={settings.autoContinueRadio}
                  onChange={() =>
                    updateSettings({
                      autoContinueRadio: !settings.autoContinueRadio,
                    })
                  }
                />
              }
            />

            {/* Quick Seek Duration */}
            <div className="px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0">
                <span
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor:
                      'color-mix(in srgb, var(--m3-primary) 14%, transparent)',
                    color: 'var(--m3-primary)',
                  }}
                >
                  <FastForward className="w-[18px] h-[18px]" />
                </span>
                <div className="min-w-0">
                  <p className="text-[14.5px] font-semibold">Quick Seek Duration</p>
                  <p className="text-[12.5px] opacity-60">
                    Rewind / forward jump interval inside Now Playing
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {SEEK_DURATIONS.map((sec) => {
                  const active = settings.seekDurationSeconds === sec;
                  return (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => updateSettings({ seekDurationSeconds: sec })}
                      className={`px-3 h-8 rounded-full text-[12.5px] font-semibold tabular-nums transition-all ${
                        active
                          ? 'bg-[var(--m3-primary)] text-[var(--m3-on-primary)]'
                          : 'bg-black/[0.05] dark:bg-white/[0.06] hover:bg-black/10 dark:hover:bg-white/10'
                      }`}
                    >
                      {sec}s
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Keep Paused on Song Change */}
            <PreferenceRow
              icon={PauseCircle}
              title="Keep Paused on Song Change"
              description="Stay paused instead of auto-playing when skipping tracks while paused"
              trailing={
                <M3Switch
                  label="Keep Paused on Song Change"
                  checked={settings.keepPausedOnSongChange}
                  onChange={() =>
                    updateSettings({
                      keepPausedOnSongChange: !settings.keepPausedOnSongChange,
                    })
                  }
                />
              }
            />

            {/* Auto-Skip on Error */}
            <PreferenceRow
              icon={AlertTriangle}
              title="Auto-Skip Next on Error"
              description="Automatically skip to the next track if a stream fails to load"
              trailing={
                <M3Switch
                  label="Auto-Skip Next on Error"
                  checked={settings.autoSkipOnError}
                  onChange={() =>
                    updateSettings({
                      autoSkipOnError: !settings.autoSkipOnError,
                    })
                  }
                />
              }
            />

            {/* Hide Video Songs */}
            <PreferenceRow
              icon={VideoOff}
              title="Hide Video Songs"
              description="Prefer studio audio tracks over music videos in feeds & search"
              trailing={
                <M3Switch
                  label="Hide Video Songs"
                  checked={settings.hideVideoSongs}
                  onChange={() =>
                    updateSettings({ hideVideoSongs: !settings.hideVideoSongs })
                  }
                />
              }
            />
          </div>
        </section>
      )}

      {/* 3. CONTENT & ACCOUNT */}
      {showSection(
        'content',
        'content region country language indonesia us japan korea cookie youtube music account'
      ) && (
        <section className="space-y-2.5">
          <h2 className="px-1 text-[12px] font-bold uppercase tracking-wider text-[var(--m3-primary)]">
            Content & Account
          </h2>
          <div className="rounded-[24px] metro-surface overflow-hidden divide-y divide-black/[0.06] dark:divide-white/[0.06]">
            {/* Content Region */}
            <div className="px-4 py-3.5 space-y-3">
              <div className="flex items-center gap-3.5">
                <span
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor:
                      'color-mix(in srgb, var(--m3-primary) 14%, transparent)',
                    color: 'var(--m3-primary)',
                  }}
                >
                  <Globe className="w-[18px] h-[18px]" />
                </span>
                <div className="min-w-0">
                  <p className="text-[14.5px] font-semibold">Content Region</p>
                  <p className="text-[12.5px] opacity-60">
                    Controls Home recommendations, Trending by genre, and Charts
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pl-0 sm:pl-[54px]">
                {REGIONS.map((reg) => {
                  const active = settings.region === reg.code;
                  return (
                    <button
                      key={reg.code}
                      type="button"
                      onClick={() => {
                        updateSettings({ region: reg.code });
                        showToast(`Content region switched to ${reg.label}`);
                      }}
                      className={`inline-flex items-center gap-1.5 px-3.5 h-8 rounded-full text-[12.5px] font-semibold transition-all ${
                        active
                          ? 'bg-[var(--m3-primary)] text-[var(--m3-on-primary)]'
                          : 'bg-black/[0.05] dark:bg-white/[0.06] hover:bg-black/10 dark:hover:bg-white/10'
                      }`}
                    >
                      <span>{reg.label}</span>
                      <span className="opacity-65 text-[11px]">{reg.native}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* YouTube Music Cookie */}
            <div className="px-4 py-3.5 space-y-3">
              <div className="flex items-center gap-3.5">
                <span
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor:
                      'color-mix(in srgb, var(--m3-primary) 14%, transparent)',
                    color: 'var(--m3-primary)',
                  }}
                >
                  <KeyRound className="w-[18px] h-[18px]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14.5px] font-semibold">
                    YouTube Music Cookie (Optional)
                  </p>
                  <p className="text-[12.5px] opacity-60">
                    Stored locally in your browser and forwarded to ytmusic-api for personalized shelves
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pl-0 sm:pl-[54px]">
                <div className="relative flex-1 min-w-0">
                  <input
                    type={showCookie ? 'text' : 'password'}
                    value={cookieDraft}
                    onChange={(e) => setCookieDraft(e.target.value)}
                    placeholder="Paste SAPISID / SOCS cookie string..."
                    className="w-full h-10 pl-3.5 pr-10 rounded-xl bg-black/[0.05] dark:bg-white/[0.07] text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--m3-primary)]/45"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCookie((v) => !v)}
                    aria-label={showCookie ? 'Hide cookie' : 'Show cookie'}
                    className="w-8 h-8 rounded-lg flex items-center justify-center absolute right-1 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100"
                  >
                    {showCookie ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleSaveCookie}
                    className="px-4 h-10 rounded-xl bg-[var(--m3-primary)] text-[var(--m3-on-primary)] text-[13px] font-semibold"
                  >
                    Apply
                  </button>
                  {settings.ytCookie && (
                    <button
                      type="button"
                      onClick={() => {
                        setCookieDraft('');
                        updateSettings({ ytCookie: '' });
                        showToast('Cookie cleared');
                      }}
                      className="px-3.5 h-10 rounded-xl bg-black/[0.05] dark:bg-white/[0.07] text-[13px] font-semibold hover:bg-rose-500/15 hover:text-rose-500 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. STORAGE & BACKUP */}
      {showSection(
        'storage',
        'storage backup restore export import json history search liked playlists reset clear'
      ) && (
        <section className="space-y-2.5">
          <h2 className="px-1 text-[12px] font-bold uppercase tracking-wider text-[var(--m3-primary)]">
            Storage & Backup
          </h2>
          <div className="rounded-[24px] metro-surface overflow-hidden divide-y divide-black/[0.06] dark:divide-white/[0.06]">
            {/* Live Local Library Footprint */}
            <div className="px-4 py-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor:
                        'color-mix(in srgb, var(--m3-primary) 14%, transparent)',
                      color: 'var(--m3-primary)',
                    }}
                  >
                    <HardDrive className="w-[18px] h-[18px]" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[14.5px] font-semibold">Local Library Data</p>
                    <p className="text-[12.5px] opacity-60">
                      Saved directly on this device (~{storageSummaryKb} KB)
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pl-0 sm:pl-[54px]">
                <div className="rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] px-3 py-2.5">
                  <p className="text-[11.5px] opacity-60">Liked Songs</p>
                  <p className="text-[18px] font-bold tabular-nums mt-0.5">
                    {likedTracks.length}
                  </p>
                </div>
                <div className="rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] px-3 py-2.5">
                  <p className="text-[11.5px] opacity-60">Playlists</p>
                  <p className="text-[18px] font-bold tabular-nums mt-0.5">
                    {playlists.length}
                  </p>
                </div>
                <div className="rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] px-3 py-2.5">
                  <p className="text-[11.5px] opacity-60">Play History</p>
                  <p className="text-[18px] font-bold tabular-nums mt-0.5">
                    {history.length}
                  </p>
                </div>
                <div className="rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] px-3 py-2.5">
                  <p className="text-[11.5px] opacity-60">Searches</p>
                  <p className="text-[18px] font-bold tabular-nums mt-0.5">
                    {searchHistory.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Backup & Restore (Real JSON Export / Import) */}
            <PreferenceRow
              icon={Download}
              title="Backup Library to JSON"
              description="Export playlists, liked songs, listening history, and settings"
              onClick={handleExportBackup}
              trailing={
                <span className="px-3.5 py-1.5 rounded-full bg-[var(--m3-primary)]/14 text-[var(--m3-primary)] text-[12px] font-semibold">
                  Export
                </span>
              }
            />

            <div className="w-full">
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                onChange={handleImportFile}
                className="hidden"
              />
              <PreferenceRow
                icon={Upload}
                title="Restore from Backup"
                description="Import a previously exported Sonara JSON backup file"
                onClick={() => fileInputRef.current?.click()}
                trailing={
                  <span className="px-3.5 py-1.5 rounded-full bg-black/[0.06] dark:bg-white/[0.08] text-[12px] font-semibold">
                    Import
                  </span>
                }
              />
            </div>

            {/* Clear History Actions */}
            <PreferenceRow
              icon={Trash2}
              title="Clear Search History"
              description={
                searchHistory.length > 0
                  ? `Remove ${searchHistory.length} saved search queries`
                  : 'Search history is already empty'
              }
              accentTint="#F43F5E"
              trailing={
                <button
                  type="button"
                  disabled={searchHistory.length === 0}
                  onClick={() => {
                    clearSearchHistory();
                    showToast('Search history cleared');
                  }}
                  className="px-3.5 h-8 rounded-full text-[12px] font-semibold bg-rose-500/12 text-rose-500 hover:bg-rose-500/20 disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
                >
                  Clear
                </button>
              }
            />

            <PreferenceRow
              icon={Trash2}
              title="Clear Listening History"
              description={
                history.length > 0
                  ? `Resets Sonara Speed Dial & Quick Picks (${history.length} plays)`
                  : 'Listening history is already empty'
              }
              accentTint="#F43F5E"
              trailing={
                <button
                  type="button"
                  disabled={history.length === 0}
                  onClick={clearPlayHistory}
                  className="px-3.5 h-8 rounded-full text-[12px] font-semibold bg-rose-500/12 text-rose-500 hover:bg-rose-500/20 disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
                >
                  Clear
                </button>
              }
            />

            {/* Reset Settings */}
            <PreferenceRow
              icon={RotateCcw}
              title="Reset Preferences"
              description="Restore appearance, playback, and region settings to default"
              onClick={resetSettings}
              trailing={
                <span className="px-3.5 py-1.5 rounded-full bg-black/[0.06] dark:bg-white/[0.08] text-[12px] font-semibold">
                  Reset
                </span>
              }
            />
          </div>
        </section>
      )}

      {/* 5. DEVELOPER COMMUNITY */}
      {showSection(
        'community',
        'community komunitas developer saluran whatsapp tiktok telegram sannforum sann404 forum group'
      ) && (
        <section data-testid="developer-community" className="space-y-2.5">
          <h2 className="px-1 text-[12px] font-bold uppercase tracking-wider text-[var(--m3-primary)]">
            Komunitas Developer
          </h2>
          <div className="rounded-[24px] metro-surface overflow-hidden divide-y divide-black/[0.06] dark:divide-white/[0.06]">
            {/* Saluran WhatsApp */}
            <a
              href="https://whatsapp.com/channel/0029Vb7vOOyLY6cyTRQF1M06"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors"
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <span
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: '#22C55E22', color: '#22C55E' }}
                >
                  <MessageCircle className="w-[18px] h-[18px]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14.5px] font-semibold leading-snug">
                    Saluran WhatsApp
                  </p>
                  <p className="text-[12.5px] opacity-60 truncate mt-0.5">
                    whatsapp.com/channel/0029Vb7vOOyLY6cyTRQF1M06
                  </p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 opacity-50 shrink-0" />
            </a>

            {/* TikTok */}
            <a
              href="https://www.tiktok.com/@sannforum.id"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors"
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <span
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor:
                      'color-mix(in srgb, var(--m3-primary) 14%, transparent)',
                    color: 'var(--m3-primary)',
                  }}
                >
                  <Music2 className="w-[18px] h-[18px]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14.5px] font-semibold leading-snug">
                    TikTok
                  </p>
                  <p className="text-[12.5px] opacity-60 truncate mt-0.5">
                    @sannforum.id
                  </p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 opacity-50 shrink-0" />
            </a>

            {/* Telegram */}
            <a
              href="https://t.me/sannnforums"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors"
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <span
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: '#38BDF822', color: '#38BDF8' }}
                >
                  <Send className="w-[18px] h-[18px]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14.5px] font-semibold leading-snug">
                    Telegram
                  </p>
                  <p className="text-[12.5px] opacity-60 truncate mt-0.5">
                    t.me/sannnforums
                  </p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 opacity-50 shrink-0" />
            </a>

            {/* Subtle, balanced attribution matching Settings typography */}
            <div className="px-4 py-3">
              <p className="text-[11.5px] font-medium tracking-wide opacity-55">
                POWERED BY SANN404 FORUM GROUP
              </p>
            </div>
          </div>
        </section>
      )}

      {/* 6. ABOUT */}
      {showSection('about', 'about sonara version ytmusic-api vercel') && (
        <section className="space-y-2.5">
          <h2 className="px-1 text-[12px] font-bold uppercase tracking-wider text-[var(--m3-primary)]">
            About
          </h2>
          <div className="rounded-[24px] metro-surface p-4 flex items-center gap-3.5">
            <span
              className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
              style={{
                backgroundColor:
                  'color-mix(in srgb, var(--m3-primary) 16%, transparent)',
                color: 'var(--m3-primary)',
              }}
            >
              <Info className="w-5 h-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-bold">Sonara Music Client</p>
              <p className="text-[12.5px] opacity-65 mt-0.5 leading-relaxed">
                Powered by ytmusic-api · Sonara recommendation & queue engine · Dynamic Island Pro background player
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
