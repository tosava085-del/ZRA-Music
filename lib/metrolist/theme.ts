import type { AccentPreset, PlayerSettings, Track } from './types';

export interface MetrolistColorTokens {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  primarySoft: string;
  ring: string;
  bg: string;
  surface: string;
  surfaceHigh: string;
  border: string;
  swatch: string;
  label: string;
}

interface AccentPalette {
  label: string;
  swatch: string;
  dark: {
    primary: string;
    onPrimary: string;
    primaryContainer: string;
    onPrimaryContainer: string;
    primarySoft: string;
    ring: string;
  };
  light: {
    primary: string;
    onPrimary: string;
    primaryContainer: string;
    onPrimaryContainer: string;
    primarySoft: string;
    ring: string;
  };
}

/**
 * Authentic Material 3 / Metrolist (GitHub) tonal color schemes.
 * Default seed matches Metrolist's DefaultThemeColor (Material Blue 0xFF4285F4).
 */
export const METROLIST_ACCENT_PALETTES: Record<AccentPreset, AccentPalette> = {
  metrolist: {
    label: 'ZRA Blue',
    swatch: '#4285F4',
    dark: {
      primary: '#A8C7FA',
      onPrimary: '#062E6F',
      primaryContainer: '#0842A0',
      onPrimaryContainer: '#D3E3FD',
      primarySoft: 'rgba(168, 199, 250, 0.14)',
      ring: 'rgba(168, 199, 250, 0.45)',
    },
    light: {
      primary: '#1B5FC7',
      onPrimary: '#FFFFFF',
      primaryContainer: '#D8E5FF',
      onPrimaryContainer: '#001B3F',
      primarySoft: 'rgba(27, 95, 199, 0.12)',
      ring: 'rgba(27, 95, 199, 0.35)',
    },
  },
  rose: {
    label: 'Crimson',
    swatch: '#ED5564',
    dark: {
      primary: '#FFB2B9',
      onPrimary: '#67001B',
      primaryContainer: '#8E132E',
      onPrimaryContainer: '#FFDADC',
      primarySoft: 'rgba(255, 178, 185, 0.14)',
      ring: 'rgba(255, 178, 185, 0.45)',
    },
    light: {
      primary: '#C02942',
      onPrimary: '#FFFFFF',
      primaryContainer: '#FFDADC',
      onPrimaryContainer: '#40000D',
      primarySoft: 'rgba(192, 41, 66, 0.11)',
      ring: 'rgba(192, 41, 66, 0.35)',
    },
  },
  emerald: {
    label: 'Sage Green',
    swatch: '#34A853',
    dark: {
      primary: '#8CD9A3',
      onPrimary: '#00391B',
      primaryContainer: '#00522A',
      onPrimaryContainer: '#B4F2C4',
      primarySoft: 'rgba(140, 217, 163, 0.14)',
      ring: 'rgba(140, 217, 163, 0.45)',
    },
    light: {
      primary: '#196B38',
      onPrimary: '#FFFFFF',
      primaryContainer: '#B4F2C4',
      onPrimaryContainer: '#00210D',
      primarySoft: 'rgba(25, 107, 56, 0.11)',
      ring: 'rgba(25, 107, 56, 0.35)',
    },
  },
  violet: {
    label: 'Monet Violet',
    swatch: '#8B6CE8',
    dark: {
      primary: '#CFC0FF',
      onPrimary: '#351D75',
      primaryContainer: '#4C368D',
      onPrimaryContainer: '#E9DDFF',
      primarySoft: 'rgba(207, 192, 255, 0.14)',
      ring: 'rgba(207, 192, 255, 0.45)',
    },
    light: {
      primary: '#5F45A6',
      onPrimary: '#FFFFFF',
      primaryContainer: '#E9DDFF',
      onPrimaryContainer: '#1D0061',
      primarySoft: 'rgba(95, 69, 166, 0.11)',
      ring: 'rgba(95, 69, 166, 0.35)',
    },
  },
  amber: {
    label: 'Warm Amber',
    swatch: '#D98A2B',
    dark: {
      primary: '#F8BD72',
      onPrimary: '#472900',
      primaryContainer: '#663D00',
      onPrimaryContainer: '#FFDCBA',
      primarySoft: 'rgba(248, 189, 114, 0.14)',
      ring: 'rgba(248, 189, 114, 0.45)',
    },
    light: {
      primary: '#9A5B00',
      onPrimary: '#FFFFFF',
      primaryContainer: '#FFDCBA',
      onPrimaryContainer: '#311A00',
      primarySoft: 'rgba(154, 91, 0, 0.11)',
      ring: 'rgba(154, 91, 0, 0.35)',
    },
  },
};

const DYNAMIC_PRESET_ORDER: AccentPreset[] = [
  'metrolist',
  'violet',
  'rose',
  'emerald',
  'amber',
];

function hashVideoId(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 33 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/**
 * Deterministically resolves the active Metrolist Material 3 palette.
 * - Supports Pure Black AMOLED (#000000) when theme === 'dark' and pureBlack === true.
 * - When dynamicColor is enabled and a track is playing, derives a cohesive Material You
 *   seed from the track without expensive canvas pixel-readbacks on low-end phones.
 */
export function resolveMetrolistTheme(
  settings: Pick<PlayerSettings, 'theme' | 'pureBlack' | 'dynamicColor' | 'accentPreset'>,
  currentTrack?: Pick<Track, 'videoId' | 'title'> | null
): {
  activePreset: AccentPreset;
  tokens: MetrolistColorTokens;
} {
  const isDark = settings.theme === 'dark';
  const activePreset: AccentPreset =
    settings.dynamicColor && currentTrack?.videoId
      ? DYNAMIC_PRESET_ORDER[
          hashVideoId(currentTrack.videoId) % DYNAMIC_PRESET_ORDER.length
        ]
      : settings.accentPreset || 'metrolist';

  const palette = METROLIST_ACCENT_PALETTES[activePreset] || METROLIST_ACCENT_PALETTES.metrolist;
  const accent = isDark ? palette.dark : palette.light;

  const surfaces = isDark
    ? settings.pureBlack
      ? {
          bg: '#000000',
          surface: '#0C0C0F',
          surfaceHigh: '#16161B',
          border: 'rgba(255, 255, 255, 0.10)',
        }
      : {
          bg: '#111216',
          surface: '#1A1B20',
          surfaceHigh: '#23252C',
          border: 'rgba(255, 255, 255, 0.08)',
        }
    : {
        bg: '#F7F8FC',
        surface: '#FFFFFF',
        surfaceHigh: '#EDF0F7',
        border: 'rgba(15, 23, 42, 0.08)',
      };

  return {
    activePreset,
    tokens: {
      ...accent,
      ...surfaces,
      swatch: palette.swatch,
      label: palette.label,
    },
  };
}
