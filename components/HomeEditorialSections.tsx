'use client';

import React, { useMemo } from 'react';
import { ChevronRight, Music2, Play, Plus } from 'lucide-react';
import { ArtworkImage } from './ArtworkImage';
import { TrackContextMenu } from './TrackContextMenu';
import type { ContentRegion, HomeShelf, HomeShelfItem, Track } from '@/lib/metrolist/types';

const COLLAGE_PALETTES = [
  { bg: 'linear-gradient(160deg, #9C3F1E 0%, #B44E27 55%, #843115 100%)', ring: 'rgba(255,255,255,0.16)' },
  { bg: 'linear-gradient(160deg, #4E584D 0%, #616D60 55%, #3C443B 100%)', ring: 'rgba(255,255,255,0.16)' },
  { bg: 'linear-gradient(160deg, #8E1B3A 0%, #B02348 55%, #6A122A 100%)', ring: 'rgba(255,255,255,0.16)' },
  { bg: 'linear-gradient(160deg, #25385C 0%, #314C7A 55%, #1A2843 100%)', ring: 'rgba(255,255,255,0.16)' },
  { bg: 'linear-gradient(160deg, #4A2E66 0%, #603D82 55%, #351F4B 100%)', ring: 'rgba(255,255,255,0.16)' },
  { bg: 'linear-gradient(160deg, #6E4A22 0%, #8A5E2B 55%, #4E3416 100%)', ring: 'rgba(255,255,255,0.16)' },
];

const REGION_DISPLAY: Record<ContentRegion, string> = {
  ID: 'Indonesia',
  US: 'United States',
  JP: 'Japan',
  KR: 'South Korea',
  GB: 'United Kingdom',
};

function dedupeTracksById(tracks: Track[]): Track[] {
  const seen = new Set<string>();
  const out: Track[] = [];
  for (const t of tracks) {
    if (!t.videoId || seen.has(t.videoId)) continue;
    seen.add(t.videoId);
    out.push(t);
  }
  return out;
}

/* ============================================================================
 * VARIATION 1: "Pilihan Teratas untuk Anda"
 * Tall rich-toned editorial artist-collage poster cards (3 overlapping circles)
 * ============================================================================ */
export function TopPicksCollageSection({
  tracks,
  onPlayMix,
}: {
  tracks: Track[];
  onPlayMix: (lead: Track, queue: Track[]) => void;
}) {
  const collageCards = useMemo(() => {
    const unique = dedupeTracksById(tracks);
    if (unique.length === 0) return [];

    // Group distinct lead artists so every tall poster features a fresh headliner
    const seenArtists = new Set<string>();
    const leads: Track[] = [];
    for (const track of unique) {
      const primaryArtist = (track.artists?.[0]?.name || track.artist || 'ZRA')
        .split(/[,&]|feat\.|ft\./i)[0]
        .trim();
      const key = primaryArtist.toLowerCase();
      if (!key || seenArtists.has(key)) continue;
      seenArtists.add(key);
      leads.push(track);
      if (leads.length >= 6) break;
    }

    if (leads.length === 0) return [];

    return leads.map((lead, idx) => {
      const primaryArtist = (lead.artists?.[0]?.name || lead.artist || 'ZRA')
        .split(/[,&]|feat\.|ft\./i)[0]
        .trim();
      const others = unique.filter((t) => t.videoId !== lead.videoId);
      const circle2 = others[(idx * 2) % Math.max(1, others.length)] || lead;
      const circle3 = others[(idx * 2 + 1) % Math.max(1, others.length)] || lead;
      const queue = [lead, ...others.slice(0, 12)];
      return {
        id: `collage-${lead.videoId}-${idx}`,
        lead,
        artistName: primaryArtist,
        thumbs: [lead.thumbnail, circle2.thumbnail, circle3.thumbnail],
        palette: COLLAGE_PALETTES[idx % COLLAGE_PALETTES.length],
        queue,
      };
    });
  }, [tracks]);

  if (collageCards.length === 0) return null;

  return (
    <section
      data-testid="home-top-picks-collage"
      className="space-y-3 cv-auto"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-[21px] sm:text-[23px] font-bold tracking-tight">
          Pilihan Teratas untuk Anda
        </h2>
      </div>

      <div className="flex gap-3.5 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-1">
        {collageCards.map((card) => (
          <button
            key={card.id}
            type="button"
            onClick={() => onPlayMix(card.lead, card.queue)}
            style={{ background: card.palette.bg }}
            className="group relative w-[228px] sm:w-[248px] h-[300px] sm:h-[318px] rounded-[22px] shrink-0 snap-start overflow-hidden text-left p-4 flex flex-col justify-between shadow-lg active:scale-[0.98] transition-transform"
          >
            {/* Subtle top-right Sonara badge */}
            <div className="flex items-center justify-end">
              <span className="inline-flex items-center gap-1 text-[12px] font-bold tracking-tight text-white/90">
                <Music2 className="w-3.5 h-3.5" />
                Sonara
              </span>
            </div>

            {/* 3-Circle Overlapping Artist/Track Collage */}
            <div className="relative w-full h-[176px] my-auto">
              {/* Primary large circle (top-left) */}
              <div
                className="absolute left-0 top-0 w-[118px] h-[118px] rounded-full overflow-hidden shadow-xl ring-1"
                style={{ borderColor: card.palette.ring }}
              >
                <ArtworkImage
                  src={card.thumbs[0]}
                  alt={card.artistName}
                  className="w-full h-full group-hover:scale-105 transition-transform duration-300"
                  rounded="rounded-full"
                />
              </div>

              {/* Secondary medium circle (middle-right) */}
              <div
                className="absolute right-0 top-[56px] w-[76px] h-[76px] rounded-full overflow-hidden shadow-xl ring-1"
                style={{ borderColor: card.palette.ring }}
              >
                <ArtworkImage
                  src={card.thumbs[1]}
                  alt={`${card.artistName} mix`}
                  className="w-full h-full group-hover:scale-105 transition-transform duration-300"
                  rounded="rounded-full"
                />
              </div>

              {/* Tertiary accent circle (bottom-center-left) */}
              <div
                className="absolute left-[46px] bottom-0 w-[68px] h-[68px] rounded-full overflow-hidden shadow-xl ring-1"
                style={{ borderColor: card.palette.ring }}
              >
                <ArtworkImage
                  src={card.thumbs[2]}
                  alt={`${card.artistName} radio`}
                  className="w-full h-full group-hover:scale-105 transition-transform duration-300"
                  rounded="rounded-full"
                />
              </div>
            </div>

            {/* Editorial Footer Typography */}
            <div className="space-y-0.5 pt-2">
              <p className="text-[12.5px] font-medium text-white/80 truncate">
                Menampilkan {card.artistName}
              </p>
              <p className="text-[16px] font-bold leading-snug text-white line-clamp-2">
                {card.artistName} &amp; Artis Serupa
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ============================================================================
 * VARIATION 2: "Dengarkan Sekarang" Wide Editorial Story Cards
 * Header (eyebrow + title + subtitle) ABOVE large bold visual poster card
 * ============================================================================ */
export function EditorialFeatureCarousel({
  tracks,
  shelves,
  region,
  onPlayTrack,
  onOpenShelfItem,
}: {
  tracks: Track[];
  shelves: HomeShelf[];
  region: ContentRegion;
  onPlayTrack: (track: Track, queue: Track[]) => void;
  onOpenShelfItem: (item: HomeShelfItem, shelf: HomeShelf) => void;
}) {
  const regionName = REGION_DISPLAY[region] || 'Indonesia';
  const uniqueTracks = useMemo(() => dedupeTracksById(tracks), [tracks]);

  // Extract up to 3 featured albums/playlists/tracks for secondary story cards
  const secondaryStories = useMemo(() => {
    const picked: Array<{
      id: string;
      eyebrow: string;
      title: string;
      subtitle: string;
      caption: string;
      thumbnail: string;
      accentBg: string;
      onClick: () => void;
    }> = [];

    const albumOrPlaylistItems: Array<{ item: HomeShelfItem; shelf: HomeShelf }> = [];
    for (const shelf of shelves) {
      for (const item of shelf.items) {
        if (item.kind === 'ALBUM' || item.kind === 'PLAYLIST') {
          albumOrPlaylistItems.push({ item, shelf });
        }
      }
    }

    const backdrops = [
      'linear-gradient(155deg, #BE123C 0%, #4C0519 100%)',
      'linear-gradient(155deg, #1D4ED8 0%, #172554 100%)',
      'linear-gradient(155deg, #047857 0%, #064E3B 100%)',
    ];

    for (let i = 0; i < Math.min(3, albumOrPlaylistItems.length); i++) {
      const { item, shelf } = albumOrPlaylistItems[i];
      const title = item.kind === 'ARTIST' ? item.name : item.title;
      const subtitle = item.kind === 'ARTIST' ? 'Artist' : item.artist;
      picked.push({
        id: `story-shelf-${i}-${title}`,
        eyebrow: item.kind === 'ALBUM' ? 'ALBUM PILIHAN' : 'PLAYLIST KURASI',
        title,
        subtitle,
        caption:
          item.kind === 'ALBUM'
            ? `Karya pilihan dari ${subtitle} yang wajib diputar.`
            : `Koleksi lagu pilihan yang disusun untuk suasana hari ini.`,
        thumbnail: item.thumbnail,
        accentBg: backdrops[i % backdrops.length],
        onClick: () => onOpenShelfItem(item, shelf),
      });
    }

    // Pad with top tracks if shelves didn't return enough albums/playlists yet
    let fallbackIdx = 1;
    while (picked.length < 3 && fallbackIdx < uniqueTracks.length) {
      const t = uniqueTracks[fallbackIdx];
      picked.push({
        id: `story-track-${t.videoId}`,
        eyebrow: fallbackIdx === 1 ? 'PILIHAN EDITOR' : 'SEDANG NAIK DAUN',
        title: t.title,
        subtitle: t.artist,
        caption: `Dengarkan pilihan populer dari ${t.artist} sekarang.`,
        thumbnail: t.thumbnail,
        accentBg: backdrops[picked.length % backdrops.length],
        onClick: () => onPlayTrack(t, uniqueTracks),
      });
      fallbackIdx++;
    }

    return picked;
  }, [shelves, uniqueTracks, onOpenShelfItem, onPlayTrack]);

  if (uniqueTracks.length === 0) return null;

  return (
    <section
      data-testid="home-editorial-featured"
      className="cv-auto"
    >
      <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-1">
        {/* Card 1: Signature Top 100 Graphic Poster Card (matching IMG_2162 top-left) */}
        <button
          type="button"
          onClick={() => onPlayTrack(uniqueTracks[0], uniqueTracks)}
          className="group w-[288px] sm:w-[332px] shrink-0 snap-start text-left space-y-2.5 active:scale-[0.985] transition-transform"
        >
          <div className="space-y-0.5 px-0.5">
            <p className="text-[11px] font-bold uppercase tracking-wider opacity-55">
              Dengarkan Sekarang
            </p>
            <h2 className="text-[20px] font-bold tracking-tight leading-tight truncate">
              Top 100: {regionName}
            </h2>
            <p className="text-[15px] opacity-60 leading-tight truncate">
              Sonara Charts
            </p>
          </div>

          <div className="relative h-[212px] sm:h-[224px] rounded-[20px] overflow-hidden bg-[#ECEEF2] dark:bg-[#EFEFF2] p-4 flex flex-col justify-between shadow-lg">
            {/* Typographic Top Header */}
            <div className="text-neutral-950 leading-none space-y-1">
              <p className="text-[20px] font-extrabold tracking-tight">Top 100</p>
              <p className="text-[22px] font-bold tracking-tight">{regionName}</p>
            </div>

            {/* Vivid Crimson Geometric Mosaic Band */}
            <div
              className="relative flex-1 mt-3 rounded-xl overflow-hidden flex items-end p-3"
              style={{
                background:
                  'linear-gradient(125deg, #F5D5D2 0%, #EF4444 36%, #DC2626 65%, #991B1B 100%)',
              }}
            >
              {/* Subtle geometric grid mosaic tiles matching IMG_2162 */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-35"
                style={{
                  backgroundImage:
                    'linear-gradient(90deg, rgba(255,255,255,0.22) 1px, transparent 1px), linear-gradient(180deg, rgba(0,0,0,0.16) 1px, transparent 1px)',
                  backgroundSize: '36px 36px',
                }}
              />
              <p className="relative z-10 text-[13px] font-semibold leading-snug text-white drop-shadow-sm pr-10">
                Lagu-lagu yang paling sering diputar di {regionName}.
              </p>
              <span className="absolute right-3 bottom-3 w-9 h-9 rounded-full bg-white/25 backdrop-blur-sm text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </span>
            </div>
          </div>
        </button>

        {/* Cards 2..4: Full-Bleed Editorial Feature Poster Cards */}
        {secondaryStories.map((story) => (
          <button
            key={story.id}
            type="button"
            onClick={story.onClick}
            className="group w-[288px] sm:w-[332px] shrink-0 snap-start text-left space-y-2.5 active:scale-[0.985] transition-transform"
          >
            <div className="space-y-0.5 px-0.5">
              <p className="text-[11px] font-bold uppercase tracking-wider opacity-55">
                {story.eyebrow}
              </p>
              <h2 className="text-[20px] font-bold tracking-tight leading-tight truncate">
                {story.title}
              </h2>
              <p className="text-[15px] opacity-60 leading-tight truncate">
                {story.subtitle}
              </p>
            </div>

            <div
              className="relative h-[212px] sm:h-[224px] rounded-[20px] overflow-hidden shadow-lg"
              style={{ background: story.accentBg }}
            >
              <ArtworkImage
                src={story.thumbnail}
                alt={story.title}
                className="w-full h-full group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 flex items-end justify-between gap-3">
                <p className="text-[13px] font-medium leading-snug text-white/95 line-clamp-2">
                  {story.caption}
                </p>
                <span className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ============================================================================
 * VARIATION 3: "Album & Essentials Pilihan"
 * Split-header Essentials card (IMG_2161) + Large Square Showcase Cards with E badge (IMG_2162)
 * ============================================================================ */
export function EssentialsAndAlbumsSection({
  tracks,
  shelves,
  onPlayTrack,
  onOpenShelfItem,
}: {
  tracks: Track[];
  shelves: HomeShelf[];
  onPlayTrack: (track: Track, queue: Track[]) => void;
  onOpenShelfItem: (item: HomeShelfItem, shelf: HomeShelf) => void;
}) {
  const uniqueTracks = useMemo(() => dedupeTracksById(tracks), [tracks]);

  const showcaseItems = useMemo(() => {
    const cards: Array<{
      id: string;
      title: string;
      subtitle: string;
      thumbnail: string;
      explicit?: boolean;
      onClick: () => void;
    }> = [];

    for (const shelf of shelves) {
      for (const item of shelf.items) {
        if (item.kind === 'ALBUM' || item.kind === 'PLAYLIST') {
          cards.push({
            id: `ea-${item.kind}-${item.kind === 'ALBUM' ? item.albumId : item.playlistId}`,
            title: item.title,
            subtitle: item.artist,
            thumbnail: item.thumbnail,
            onClick: () => onOpenShelfItem(item, shelf),
          });
        }
        if (cards.length >= 7) break;
      }
      if (cards.length >= 7) break;
    }

    // Fill with diverse tracks if needed
    for (let i = 1; i < uniqueTracks.length && cards.length < 7; i++) {
      const t = uniqueTracks[i];
      cards.push({
        id: `ea-track-${t.videoId}`,
        title: t.album?.name || t.title,
        subtitle: t.artist,
        thumbnail: t.thumbnail,
        explicit: t.explicit,
        onClick: () => onPlayTrack(t, uniqueTracks),
      });
    }

    return cards;
  }, [shelves, uniqueTracks, onOpenShelfItem, onPlayTrack]);

  const essentialsLead = uniqueTracks[0];
  if (!essentialsLead) return null;

  const leadArtist = (essentialsLead.artists?.[0]?.name || essentialsLead.artist || 'Sonara')
    .split(/[,&]|feat\.|ft\./i)[0]
    .trim();

  return (
    <section
      data-testid="home-essentials-albums"
      className="space-y-3 cv-auto"
    >
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onPlayTrack(essentialsLead, uniqueTracks)}
          className="inline-flex items-center gap-1 text-[21px] sm:text-[23px] font-bold tracking-tight hover:opacity-80 transition-opacity"
        >
          <span>Album &amp; Essentials Pilihan</span>
          <ChevronRight className="w-5 h-5 opacity-55" />
        </button>
      </div>

      <div className="flex gap-3.5 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-1">
        {/* Card 1: Signature Split-Top "Essentials" Editorial Card (matching IMG_2161 bottom-left) */}
        <button
          type="button"
          onClick={() => onPlayTrack(essentialsLead, uniqueTracks)}
          className="group w-[164px] sm:w-[186px] shrink-0 snap-start text-left space-y-2 active:scale-[0.98] transition-transform"
        >
          <div className="w-[164px] h-[164px] sm:w-[186px] sm:h-[186px] rounded-[14px] overflow-hidden shadow-md flex flex-col bg-[#BDD0DC]">
            <div className="px-2.5 pt-2 pb-1.5 flex flex-col justify-between bg-[#BDD0DC] text-slate-950 shrink-0">
              <span className="self-end inline-flex items-center gap-0.5 text-[10px] font-bold opacity-80">
                <Music2 className="w-2.5 h-2.5" /> Sonara
              </span>
              <span className="text-[17px] font-extrabold tracking-tight leading-none">
                Essentials
              </span>
            </div>
            <div className="relative flex-1 w-full overflow-hidden">
              <ArtworkImage
                src={essentialsLead.thumbnail}
                alt={`${leadArtist} Essentials`}
                className="w-full h-full group-hover:scale-105 transition-transform duration-300"
                rounded="rounded-none"
              />
            </div>
          </div>
          <div className="px-0.5">
            <p className="text-[14px] font-semibold leading-snug truncate">
              {leadArtist} Essentials
            </p>
            <p className="text-[12.5px] opacity-60 truncate">Sonara Mix</p>
          </div>
        </button>

        {/* Cards 2..8: Large Crisp Square Album/Track Showcase Cards */}
        {showcaseItems.map((card) => (
          <button
            key={card.id}
            type="button"
            onClick={card.onClick}
            className="group w-[164px] sm:w-[186px] shrink-0 snap-start text-left space-y-2 active:scale-[0.98] transition-transform"
          >
            <div className="relative w-[164px] h-[164px] sm:w-[186px] sm:h-[186px] rounded-[14px] overflow-hidden shadow-md">
              <ArtworkImage
                src={card.thumbnail}
                alt={card.title}
                className="w-full h-full group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute right-2.5 bottom-2.5 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              </span>
            </div>
            <div className="px-0.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <p className="text-[14px] font-semibold leading-snug truncate">
                  {card.title}
                </p>
                {card.explicit && (
                  <span className="shrink-0 inline-flex items-center justify-center w-3.5 h-3.5 rounded-[3px] bg-black/15 dark:bg-white/20 text-[9px] font-bold">
                    E
                  </span>
                )}
              </div>
              <p className="text-[12.5px] opacity-60 truncate">{card.subtitle}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ============================================================================
 * VARIATION 4: "+ Tambahkan Hit Viral Ini >"
 * 4-Row Swipeable Editorial Track Columns with Crisp Hairline Dividers (IMG_2162 bottom)
 * ============================================================================ */
export function ViralHitsCompactSection({
  tracks,
  currentVideoId,
  onPlayTrack,
}: {
  tracks: Track[];
  currentVideoId?: string | null;
  onPlayTrack: (track: Track, queue: Track[]) => void;
}) {
  const viralTracks = useMemo(() => dedupeTracksById(tracks).slice(0, 12), [tracks]);

  const columns = useMemo(() => {
    const cols: Track[][] = [];
    for (let i = 0; i < viralTracks.length; i += 4) {
      cols.push(viralTracks.slice(i, i + 4));
    }
    return cols;
  }, [viralTracks]);

  if (columns.length === 0) return null;

  return (
    <section
      data-testid="home-viral-hits"
      className="space-y-3 cv-auto"
    >
      <button
        type="button"
        onClick={() => onPlayTrack(viralTracks[0], viralTracks)}
        className="inline-flex items-center gap-1.5 text-[21px] sm:text-[23px] font-bold tracking-tight hover:opacity-80 transition-opacity"
      >
        <Plus className="w-5 h-5 opacity-60 stroke-[2.6]" />
        <span>Tambahkan Hit Viral Ini</span>
        <ChevronRight className="w-5 h-5 opacity-55" />
      </button>

      <div className="flex gap-4 sm:gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-1">
        {columns.map((col, colIdx) => (
          <div
            key={`viral-col-${colIdx}`}
            className="w-[84vw] max-w-[356px] sm:w-[348px] shrink-0 snap-start divide-y divide-black/[0.08] dark:divide-white/[0.09]"
          >
            {col.map((track, rowIdx) => {
              const active = currentVideoId === track.videoId;
              return (
                <div
                  key={`viral-${track.videoId}-${rowIdx}`}
                  className={`group flex items-center gap-3 py-2.5 transition-colors ${
                    active ? 'bg-[var(--m3-primary)]/[0.08] rounded-xl px-1.5 -mx-1.5' : ''
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onPlayTrack(track, viralTracks)}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left"
                  >
                    <div className="relative w-12 h-12 rounded-[10px] overflow-hidden shrink-0 shadow-sm">
                      <ArtworkImage
                        src={track.thumbnail}
                        alt={track.title}
                        className="w-full h-full"
                      />
                      <div
                        className={`absolute inset-0 bg-black/45 flex items-center justify-center transition-opacity ${
                          active
                            ? 'opacity-100'
                            : 'opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        <Play className="w-4 h-4 text-white fill-current" />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-[15px] font-semibold leading-snug truncate ${
                          active ? 'text-[var(--m3-primary)]' : ''
                        }`}
                      >
                        {track.title}
                      </p>
                      <p className="text-[13px] opacity-60 truncate">
                        {track.artist}
                      </p>
                    </div>
                  </button>

                  <TrackContextMenu track={track} />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
