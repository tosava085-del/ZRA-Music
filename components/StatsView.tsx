'use client';

import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Play,
  Sparkles,
  Trophy,
  X,
} from 'lucide-react';
import { ArtworkImage } from './ArtworkImage';
import { useMusic } from './MusicProvider';
import { TrackContextMenu } from './TrackContextMenu';
import {
  computeListeningStats,
  type StatsPeriod,
} from '@/lib/metrolist/statsEngine';
import { cn } from '@/lib/utils';

const PERIODS: Array<{ id: StatsPeriod; label: string }> = [
  { id: 'week', label: '7 Days' },
  { id: 'month', label: '30 Days' },
  { id: 'year', label: 'This Year' },
  { id: 'all', label: 'All Time' },
];

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const ARTIST_BAR_COLORS = [
  'var(--m3-primary)',
  '#38BDF8',
  '#A78BFA',
  '#34D399',
  '#FBBF24',
  '#FB7185',
];

export function StatsView() {
  const { history, likedTracks, playlists, playTrack, currentTrack } = useMusic();
  const [period, setPeriod] = useState<StatsPeriod>('all');
  const [recapOpen, setRecapOpen] = useState(false);
  const [recapSlide, setRecapSlide] = useState(0);

  const stats = useMemo(
    () =>
      computeListeningStats({
        history,
        likedCount: likedTracks.length,
        playlistsCount: playlists.length,
        period,
      }),
    [history, likedTracks.length, playlists.length, period]
  );

  const maxWeekday = Math.max(1, ...stats.weekdayPlays);
  const maxHour = Math.max(1, ...stats.hourPlays);

  const podiumSongs = stats.topSongs.slice(0, 3);
  const restSongs = stats.topSongs.slice(3);
  const allTopTracks = stats.topSongs.map((s) => s.track);

  const topArtist = stats.topArtists[0] ?? null;
  const topSong = stats.topSongs[0] ?? null;

  const recapSlides = [
    {
      id: 'time',
      kicker: 'Your Listening Pulse',
      headline: `${stats.totalMinutes} minutes`,
      body: `Across ${stats.totalPlays} plays and ${stats.uniqueTracks} tracks. Your peak listening hour is ${stats.peakHourLabel}.`,
      gradient: 'from-[#1E1B4B] via-[#312E81] to-[#09090D]',
      artwork: topSong?.track.thumbnail ?? '',
    },
    {
      id: 'artist',
      kicker: 'Most Played Artist',
      headline: topArtist ? topArtist.name : 'Still Exploring',
      body: topArtist
        ? `${topArtist.playCount} plays · ${topArtist.minutes} min (${topArtist.sharePct}% of your rotation).`
        : 'Play a few tracks to unlock your top artist highlight.',
      gradient: 'from-[#4C0519] via-[#881337] to-[#09090D]',
      artwork: topArtist?.thumbnail ?? '',
    },
    {
      id: 'song',
      kicker: 'Number One Anthem',
      headline: topSong ? topSong.track.title : 'No Anthem Yet',
      body: topSong
        ? `${topSong.track.artist} · Replayed ${topSong.playCount} times (${topSong.minutes} min).`
        : 'Hit play on your favorite songs to crown your anthem.',
      gradient: 'from-[#064E3B] via-[#0F766E] to-[#09090D]',
      artwork: topSong?.track.thumbnail ?? '',
    },
    {
      id: 'persona',
      kicker: 'Sound Identity',
      headline: stats.listeningPersona.title,
      body: stats.listeningPersona.description,
      gradient: 'from-[#3B0764] via-[#581C87] to-[#09090D]',
      artwork: topSong?.track.thumbnail ?? '',
    },
  ];

  const openRecap = () => {
    setRecapSlide(0);
    setRecapOpen(true);
  };

  return (
    <div data-testid="stats-view" className="space-y-6">
      {/* Period Selector Dock + Recap Launch CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label="Statistics timeframe"
          className="grid grid-cols-4 sm:inline-flex items-center gap-1 p-1 rounded-full bg-black/[0.05] dark:bg-white/[0.06] w-full sm:w-auto"
        >
          {PERIODS.map((p) => {
            const active = period === p.id;
            return (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={active}
                data-testid={`stats-period-${p.id}`}
                onClick={() => setPeriod(p.id)}
                className={cn(
                  'h-9 px-2 sm:px-4 rounded-full text-[11px] sm:text-xs font-semibold transition-all whitespace-nowrap flex items-center justify-center',
                  active
                    ? 'bg-[var(--m3-primary)] text-[var(--m3-on-primary)] shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                )}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={openRecap}
          data-testid="launch-recap-btn"
          className="h-11 px-5 rounded-full bg-[var(--m3-primary)] text-[var(--m3-on-primary)] text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 shadow-lg hover:brightness-110 transition-all whitespace-nowrap self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>Play Year Recap</span>
        </button>
      </div>

      {/* Expressive Listening Hero */}
      <section className="relative overflow-hidden rounded-[28px] metro-surface p-5 sm:p-7">
        {topSong?.track.thumbnail && (
          <>
            <img
              src={topSong.track.thumbnail}
              alt=""
              aria-hidden="true"
              referrerPolicy="no-referrer"
              className="pointer-events-none absolute inset-0 w-full h-full object-cover scale-125 blur-3xl opacity-20 dark:opacity-25"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[var(--m3-surface)]/95 via-[var(--m3-surface)]/80 to-transparent" />
          </>
        )}

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <p className="text-xs font-semibold text-[var(--m3-primary)]">
              {stats.listeningPersona.title}
              <span aria-hidden="true"> · </span>
              <span>Peak around {stats.peakHourLabel}</span>
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950 dark:text-white font-mono-nums">
              {stats.totalMinutes.toLocaleString()} minutes listened
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {stats.listeningPersona.description}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-black/5 dark:border-white/10">
            <div>
              <p className="text-2xl font-bold font-mono-nums text-slate-950 dark:text-white">
                {stats.totalPlays}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total Plays</p>
            </div>
            <div>
              <p className="text-2xl font-bold font-mono-nums text-slate-950 dark:text-white">
                {stats.uniqueTracks}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Tracks</p>
            </div>
            <div>
              <p className="text-2xl font-bold font-mono-nums text-slate-950 dark:text-white">
                {stats.uniqueArtists}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Artists</p>
            </div>
            <div>
              <p className="text-2xl font-bold font-mono-nums text-slate-950 dark:text-white">
                {stats.likedCount}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Liked</p>
            </div>
          </div>
        </div>
      </section>

      {stats.totalPlays === 0 ? (
        <div className="rounded-[28px] metro-surface p-10 text-center space-y-2">
          <p className="text-base font-semibold text-slate-900 dark:text-white">
            No plays recorded in this timeframe yet
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Switch to All Time or play tracks across Home and Explore to build your insights.
          </p>
        </div>
      ) : (
        <>
          {/* Artist Share Breakdown + Rhythm Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Top Artists Share Bar */}
            <section className="lg:col-span-6 rounded-[28px] metro-surface p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-950 dark:text-white">
                  Artist Rotation Share
                </h3>
                <span className="text-xs font-mono-nums text-slate-500 dark:text-slate-400">
                  Top {stats.topArtists.length}
                </span>
              </div>

              {/* Segmented Multi-Color Bar */}
              <div className="h-3.5 w-full rounded-full overflow-hidden flex gap-0.5 bg-black/5 dark:bg-white/10">
                {stats.topArtists.map((artist, idx) => (
                  <div
                    key={artist.name}
                    title={`${artist.name}: ${artist.sharePct}%`}
                    style={{
                      width: `${Math.max(6, artist.sharePct)}%`,
                      backgroundColor:
                        ARTIST_BAR_COLORS[idx % ARTIST_BAR_COLORS.length],
                    }}
                    className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-300"
                  />
                ))}
              </div>

              {/* Artist Breakdown Rows */}
              <div className="space-y-2.5 pt-1">
                {stats.topArtists.map((artist, idx) => (
                  <div
                    key={artist.name}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{
                          backgroundColor:
                            ARTIST_BAR_COLORS[idx % ARTIST_BAR_COLORS.length],
                        }}
                      />
                      <ArtworkImage
                        src={artist.thumbnail}
                        alt={artist.name}
                        className="w-9 h-9 shrink-0"
                        rounded="rounded-full"
                        sizeHint="sm"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {artist.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono-nums">
                          {artist.playCount} plays · {artist.minutes} min
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold font-mono-nums text-slate-700 dark:text-slate-200 shrink-0">
                      {artist.sharePct}%
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* 7-Day Weekday + 24-Hour Clock Charts */}
            <section className="lg:col-span-6 rounded-[28px] metro-surface p-5 flex flex-col justify-between gap-6">
              {/* Weekday Bar Chart */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-950 dark:text-white">
                    Weekly Rhythm
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Mon – Sun
                  </span>
                </div>
                <div className="grid grid-cols-7 gap-2 items-end h-28 pt-2">
                  {stats.weekdayPlays.map((count, idx) => {
                    const heightPct = Math.max(10, Math.round((count / maxWeekday) * 100));
                    const isPeak = count === maxWeekday && count > 0;
                    return (
                      <div
                        key={WEEKDAYS[idx]}
                        className="flex flex-col items-center justify-end gap-1.5 h-full"
                      >
                        <div className="w-full flex-1 flex items-end justify-center">
                          <div
                            style={{ height: `${heightPct}%` }}
                            className={cn(
                              'w-full max-w-[28px] rounded-t-xl rounded-b-md transition-all duration-300',
                              isPeak
                                ? 'bg-[var(--m3-primary)]'
                                : 'bg-black/10 dark:bg-white/15'
                            )}
                          />
                        </div>
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          {WEEKDAYS[idx]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 24-Hour Listening Clock */}
              <div className="space-y-2.5 pt-4 border-t border-black/5 dark:border-white/[0.08]">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-950 dark:text-white">
                    Listening Clock
                  </h3>
                  <span className="text-xs font-mono-nums text-[var(--m3-primary)] font-semibold">
                    Peak: {stats.peakHourLabel}
                  </span>
                </div>
                <div className="grid grid-cols-24 gap-1 items-end h-14">
                  {stats.hourPlays.map((count, hr) => {
                    const hPct = Math.max(12, Math.round((count / maxHour) * 100));
                    const isPeakHr = hr === stats.peakHour && count > 0;
                    return (
                      <div
                        key={`hr-${hr}`}
                        title={`${hr}:00 — ${count} plays`}
                        style={{ height: `${hPct}%` }}
                        className={cn(
                          'w-full rounded-full transition-all',
                          isPeakHr
                            ? 'bg-[var(--m3-primary)]'
                            : count > 0
                              ? 'bg-[var(--m3-primary)]/40'
                              : 'bg-black/8 dark:bg-white/10'
                        )}
                      />
                    );
                  })}
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono-nums text-slate-400">
                  <span>12 AM</span>
                  <span>6 AM</span>
                  <span>12 PM</span>
                  <span>6 PM</span>
                  <span>11 PM</span>
                </div>
              </div>
            </section>
          </div>

          {/* Top Songs Expressive Podium (#1, #2, #3) */}
          {podiumSongs.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold tracking-tight text-slate-950 dark:text-white">
                  Top Tracks Podium
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Tap any card to play
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {podiumSongs.map((item, idx) => {
                  const isFirst = idx === 0;
                  const active = currentTrack?.videoId === item.track.videoId;
                  return (
                    <button
                      key={item.track.videoId}
                      type="button"
                      onClick={() => playTrack(item.track, allTopTracks)}
                      className={cn(
                        'relative overflow-hidden text-left p-4 transition-all group',
                        isFirst
                          ? 'rounded-tl-[28px] rounded-tr-[14px] rounded-bl-[14px] rounded-br-[28px] bg-[var(--m3-primary-container)] text-[var(--m3-on-primary-container)]'
                          : 'rounded-2xl metro-surface hover:bg-[var(--m3-surface-high)]',
                        active && 'ring-2 ring-[var(--m3-primary)]'
                      )}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={cn(
                            'text-xs font-bold font-mono-nums flex items-center gap-1',
                            isFirst
                              ? 'text-[var(--m3-on-primary-container)]'
                              : 'text-[var(--m3-primary)]'
                          )}
                        >
                          {isFirst ? (
                            <Trophy className="w-3.5 h-3.5" />
                          ) : (
                            <Flame className="w-3.5 h-3.5" />
                          )}
                          #{idx + 1}
                        </span>
                        <span className="text-xs font-mono-nums opacity-75">
                          {item.playCount} plays · {item.minutes}m
                        </span>
                      </div>

                      <div className="flex items-center gap-3.5">
                        <div className="relative w-16 h-16 shrink-0 rounded-2xl overflow-hidden shadow-md">
                          <ArtworkImage
                            src={item.track.thumbnail}
                            alt={item.track.title}
                            className="w-full h-full"
                            rounded=""
                            sizeHint="sm"
                          />
                          <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Play className="w-5 h-5 text-white fill-current" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-base font-bold truncate">
                            {item.track.title}
                          </p>
                          <p className="text-xs opacity-75 truncate mt-0.5">
                            {item.track.artist}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Remaining Ranked Tracks (#4+) */}
          {restSongs.length > 0 && (
            <section className="rounded-[28px] metro-surface divide-y divide-black/5 dark:divide-white/[0.06]">
              {restSongs.map((item, idx) => {
                const rank = idx + 4;
                const active = currentTrack?.videoId === item.track.videoId;
                return (
                  <div
                    key={item.track.videoId}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2.5 first:rounded-t-[28px] last:rounded-b-[28px]',
                      active && 'bg-[var(--m3-primary-soft)]'
                    )}
                  >
                    <span className="w-6 text-center text-xs font-mono-nums font-semibold text-slate-400 shrink-0">
                      {rank}
                    </span>
                    <button
                      type="button"
                      onClick={() => playTrack(item.track, allTopTracks)}
                      className="flex items-center gap-3 min-w-0 flex-1 text-left"
                    >
                      <ArtworkImage
                        src={item.track.thumbnail}
                        alt={item.track.title}
                        className="w-11 h-11"
                        rounded="rounded-xl"
                        sizeHint="sm"
                      />
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            'text-sm font-semibold truncate',
                            active
                              ? 'text-[var(--m3-primary)]'
                              : 'text-slate-900 dark:text-white'
                          )}
                        >
                          {item.track.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {item.track.artist}
                          <span aria-hidden="true"> · </span>
                          <span className="font-mono-nums">
                            {item.playCount} plays · {item.minutes}m
                          </span>
                        </p>
                      </div>
                    </button>
                    <TrackContextMenu track={item.track} />
                  </div>
                );
              })}
            </section>
          )}
        </>
      )}

      {/* Interactive Year-in-Music Recap Story Reel Modal */}
      <AnimatePresence>
        {recapOpen && (
          <motion.div
            key="recap-story-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="ZRA Listening Recap Story"
            data-testid="recap-story-modal"
            className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <motion.div
              key={`slide-${recapSlide}`}
              initial={{ scale: 0.96, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0.5 }}
              transition={{ duration: 0.24 }}
              className={cn(
                'relative w-full max-w-sm aspect-[9/16] max-h-[84vh] rounded-[32px] overflow-hidden text-white p-6 flex flex-col justify-between shadow-2xl border border-white/15 bg-gradient-to-b',
                recapSlides[recapSlide].gradient
              )}
            >
              {/* Story Progress Bars */}
              <div className="space-y-4 relative z-10">
                <div className="grid grid-cols-4 gap-1.5">
                  {recapSlides.map((s, idx) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setRecapSlide(idx)}
                      aria-label={`Jump to recap slide ${idx + 1}`}
                      className="h-1 rounded-full bg-white/25 overflow-hidden"
                    >
                      <div
                        className={cn(
                          'h-full rounded-full bg-white transition-all duration-300',
                          idx <= recapSlide ? 'w-full' : 'w-0'
                        )}
                      />
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white/75">
                    ZRA Recap · {recapSlide + 1}/{recapSlides.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => setRecapOpen(false)}
                    aria-label="Close Recap Story"
                    className="w-10 h-10 rounded-full bg-black/25 hover:bg-black/45 flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Slide Visual & Narrative */}
              <div className="relative z-10 flex flex-col items-center text-center gap-5 my-auto">
                {recapSlides[recapSlide].artwork && (
                  <div className="w-40 h-40 rounded-[28px] overflow-hidden shadow-2xl border border-white/20">
                    <ArtworkImage
                      src={recapSlides[recapSlide].artwork}
                      alt={recapSlides[recapSlide].headline}
                      className="w-full h-full"
                      rounded=""
                      sizeHint="lg"
                    />
                  </div>
                )}

                <div className="space-y-2 px-2">
                  <p className="text-xs font-semibold text-white/75">
                    {recapSlides[recapSlide].kicker}
                  </p>
                  <h3 className="text-3xl font-bold tracking-tight leading-tight text-balance">
                    {recapSlides[recapSlide].headline}
                  </h3>
                  <p className="text-sm text-white/80 leading-relaxed">
                    {recapSlides[recapSlide].body}
                  </p>
                </div>
              </div>

              {/* Story Navigation Footer */}
              <div className="relative z-10 flex items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={recapSlide === 0}
                  onClick={() => setRecapSlide((prev) => Math.max(0, prev - 1))}
                  aria-label="Previous recap slide"
                  className="h-11 px-4 rounded-full bg-white/15 hover:bg-white/25 disabled:opacity-30 text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Prev</span>
                </button>

                {recapSlide < recapSlides.length - 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setRecapSlide((prev) =>
                        Math.min(recapSlides.length - 1, prev + 1)
                      )
                    }
                    aria-label="Next recap slide"
                    className="h-11 px-5 rounded-full bg-white text-slate-950 text-xs font-bold inline-flex items-center gap-1 hover:brightness-95 transition-all"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setRecapOpen(false)}
                    className="h-11 px-5 rounded-full bg-white text-slate-950 text-xs font-bold inline-flex items-center gap-1 hover:brightness-95 transition-all"
                  >
                    <span>Done</span>
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
