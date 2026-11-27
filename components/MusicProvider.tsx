'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  advanceQueue,
  appendRadioContinuation,
  appendToQueue,
  createQueueState,
  cycleRepeatMode,
  getCurrentTrack,
  insertPlayNext,
  playTrackInQueue,
  removeFromQueue,
  reorderQueue,
  toggleShuffleQueue,
  type QueueState,
} from '@/lib/metrolist/queue';
import { DEFAULT_SETTINGS } from '@/lib/metrolist/seed';
import { resolveMetrolistTheme } from '@/lib/metrolist/theme';
import {
  loadLibraryState,
  recordTrackPlay,
  saveCollection,
  saveHistory,
  saveLikedTracks,
  savePlaylists,
  saveSearchHistory,
  saveSettings,
  type SavedCollectionItem,
} from '@/lib/metrolist/storage';
import {
  BACKGROUND_RECOVERY_DELAYS_MS,
  buildMediaSessionPosition,
  computeElapsedWithDrift,
  shouldAutoRecoverBackgroundPlayback,
} from '@/lib/metrolist/background';
import type {
  BackgroundPopupMode,
  DetailTarget,
  LyricsPayload,
  NavTab,
  PlayEvent,
  PlayerSettings,
  RepeatMode,
  Track,
  UserPlaylist,
} from '@/lib/metrolist/types';

declare global {
  interface Window {
    YT?: {
      Player: new (
        el: string | HTMLElement,
        opts: {
          height?: string | number;
          width?: string | number;
          videoId?: string;
          playerVars?: Record<string, string | number>;
          events?: {
            onReady?: (ev: { target: YTPlayerInstance }) => void;
            onStateChange?: (ev: { data: number; target: YTPlayerInstance }) => void;
            onError?: () => void;
          };
        }
      ) => YTPlayerInstance;
      PlayerState?: {
        UNSTARTED?: number;
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED?: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
    webkitAudioContext?: typeof AudioContext;
  }
}

interface YTPlayerInstance {
  loadVideoById: (videoId: string) => void;
  cueVideoById?: (videoId: string) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  setVolume: (volume: number) => void;
  mute: () => void;
  unMute: () => void;
  setPlaybackRate: (rate: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState?: () => number;
  getIframe?: () => HTMLIFrameElement | null;
  destroy: () => void;
}

export type NowPlayingTab = 'player' | 'lyrics' | 'queue';

interface MusicContextValue {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  detailTarget: DetailTarget | null;
  openDetail: (target: DetailTarget | null) => void;
  queueState: QueueState;
  currentTrack: Track | null;
  isPlaying: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isNowPlayingOpen: boolean;
  setIsNowPlayingOpen: (open: boolean) => void;
  nowPlayingTab: NowPlayingTab;
  setNowPlayingTab: (tab: NowPlayingTab) => void;
  showVideoStage: boolean;
  setShowVideoStage: (show: boolean) => void;
  sleepTimerMinutes: number | null;
  setSleepTimer: (minutes: number | null) => void;
  sleepTimerEndOfTrack: boolean;
  setSleepTimerEndOfTrack: (enabled: boolean) => void;
  popupMode: BackgroundPopupMode;
  setPopupMode: (mode: BackgroundPopupMode) => void;
  openBackgroundPopup: () => void;
  closeBackgroundPopup: () => void;
  toggleBackgroundPopup: () => void;
  resumePlaybackKeepAlive: () => void;
  registerPopupHandlers: (handlers: {
    open: () => void;
    close: () => void;
  }) => void;
  playTrack: (track: Track, contextQueue?: Track[]) => void;
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  nextTrack: (manual?: boolean) => void;
  prevTrack: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  playNextInQueue: (track: Track) => void;
  addTrackToQueue: (track: Track) => void;
  removeQueueIndex: (idx: number) => void;
  moveQueueItem: (from: number, to: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  startRadio: (track: Track) => Promise<void>;
  jumpToQueueIndex: (idx: number) => void;
  lyrics: LyricsPayload | null;
  lyricsLoading: boolean;
  history: PlayEvent[];
  likedTracks: Track[];
  isLiked: (videoId: string) => boolean;
  toggleLike: (track: Track) => void;
  playlists: UserPlaylist[];
  createPlaylist: (name: string, description?: string, initialTracks?: Track[]) => UserPlaylist;
  renamePlaylist: (id: string, name: string) => void;
  updatePlaylistTags: (playlistId: string, tags: string[]) => void;
  deletePlaylist: (id: string) => void;
  addTrackToPlaylist: (playlistId: string, track: Track) => void;
  removeTrackFromPlaylist: (playlistId: string, videoId: string) => void;
  playlistPickerTrack: Track | null;
  openPlaylistPicker: (track: Track | null) => void;
  savedCollection: SavedCollectionItem[];
  isSavedInCollection: (kind: SavedCollectionItem['kind'], id: string) => boolean;
  toggleSaveCollection: (item: Omit<SavedCollectionItem, 'savedAt'>) => void;
  searchHistory: string[];
  addSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
  clearPlayHistory: () => void;
  settings: PlayerSettings;
  updateSettings: (patch: Partial<PlayerSettings>) => void;
  resetSettings: () => void;
  exportLibraryBackup: () => string;
  importLibraryBackup: (rawJson: string) => { ok: boolean; message: string };
  toastMessage: string | null;
  showToast: (msg: string) => void;
  ytContainerRef: React.RefObject<HTMLDivElement | null>;
}

const MusicContext = createContext<MusicContextValue | null>(null);

export function useMusic(): MusicContextValue {
  const ctx = useContext(MusicContext);
  if (!ctx) {
    throw new Error('useMusic must be used inside MusicProvider');
  }
  return ctx;
}

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [activeTab, setActiveTabState] = useState<NavTab>('home');
  const [detailTarget, setDetailTarget] = useState<DetailTarget | null>(null);
  const [queueState, setQueueState] = useState<QueueState>(createQueueState);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(85);
  const [isMuted, setIsMuted] = useState(false);
  const [isNowPlayingOpen, setIsNowPlayingOpen] = useState(false);
  const [nowPlayingTab, setNowPlayingTab] = useState<NowPlayingTab>('player');
  const [showVideoStage, setShowVideoStage] = useState(false);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [sleepTimerEndOfTrack, setSleepTimerEndOfTrackState] = useState(false);
  const sleepDeadlineRef = useRef<number | null>(null);
  const sleepEndOfTrackRef = useRef(false);
  const [history, setHistory] = useState<PlayEvent[]>([]);
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<UserPlaylist[]>([]);
  const [savedCollection, setSavedCollection] = useState<SavedCollectionItem[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [settings, setSettings] = useState<PlayerSettings>(DEFAULT_SETTINGS);
  const [playlistPickerTrack, setPlaylistPickerTrack] = useState<Track | null>(null);
  const [lyrics, setLyrics] = useState<LyricsPayload | null>(null);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [popupMode, setPopupMode] = useState<BackgroundPopupMode>('off');
  const popupHandlersRef = useRef<{ open: () => void; close: () => void }>({
    open: () => {},
    close: () => {},
  });
  const ytContainerRef = useRef<HTMLDivElement | null>(null);
  const ytPlayerRef = useRef<YTPlayerInstance | null>(null);
  const ytReadyRef = useRef(false);
  const lastLoadedVideoIdRef = useRef<string | null>(null);
  const nextTrackRef = useRef<(manual?: boolean) => void>(() => {});
  const radioFetchingRef = useRef<string | null>(null);
  const userPausedRef = useRef(false);
  const intendedPlayingRef = useRef(false);
  const bgRecoveryCountRef = useRef(0);
  const bgRecoveryWindowStartRef = useRef(0);
  const lastAutoSkipAtRef = useRef(0);
  const settingsRef = useRef<PlayerSettings>(DEFAULT_SETTINGS);
  const popupModeRef = useRef<BackgroundPopupMode>('off');
  const volumeRef = useRef(85);
  const isMutedRef = useRef(false);
  const recoveryTimersRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastTickMsRef = useRef<number>(0);
  const currentTrack = useMemo(() => getCurrentTrack(queueState), [queueState]);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    popupModeRef.current = popupMode;
  }, [popupMode]);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  const clearRecoveryTimers = useCallback(() => {
    for (const id of recoveryTimersRef.current) {
      clearTimeout(id);
    }
    recoveryTimersRef.current = [];
  }, []);

  const ensureSilentAudioThread = useCallback(() => {
    if (typeof window === 'undefined' || !settingsRef.current.backgroundPlay) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!audioCtxRef.current) {
        const ctx = new Ctx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        gain.gain.value = 0.00001;
        osc.frequency.value = 20;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        audioCtxRef.current = ctx;
      } else if (audioCtxRef.current.state === 'suspended') {
        void audioCtxRef.current.resume().catch(() => {});
      }
    } catch {
    }
  }, []);

  const resumePlaybackKeepAlive = useCallback(() => {
    if (!intendedPlayingRef.current || userPausedRef.current) return;
    clearRecoveryTimers();
    ensureSilentAudioThread();
    const pulse = () => {
      if (!intendedPlayingRef.current || userPausedRef.current) return;
      if (!ytReadyRef.current || !ytPlayerRef.current) return;
      try {
        const state = ytPlayerRef.current.getPlayerState?.();
        if (!isMutedRef.current) {
          ytPlayerRef.current.unMute();
          ytPlayerRef.current.setVolume(volumeRef.current);
        }
        if (state !== 1 && state !== 3) {
          ytPlayerRef.current.playVideo();
        }
      } catch {
      }
    };
    for (const delay of BACKGROUND_RECOVERY_DELAYS_MS) {
      if (delay === 0) {
        pulse();
      } else {
        const id = setTimeout(pulse, delay);
        recoveryTimersRef.current.push(id);
      }
    }
  }, [clearRecoveryTimers, ensureSilentAudioThread]);

  const registerPopupHandlers = useCallback(
    (handlers: { open: () => void; close: () => void }) => {
      popupHandlersRef.current = handlers;
    },
    []
  );

  const openBackgroundPopup = useCallback(() => {
    popupHandlersRef.current.open();
  }, []);

  const closeBackgroundPopup = useCallback(() => {
    popupHandlersRef.current.close();
  }, []);

  const toggleBackgroundPopup = useCallback(() => {
    if (popupMode === 'off') {
      popupHandlersRef.current.open();
    } else {
      popupHandlersRef.current.close();
    }
  }, [popupMode]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2600);
  }, []);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      const loaded = loadLibraryState();
      setHistory(loaded.history);
      setLikedTracks(loaded.likedTracks);
      setPlaylists(loaded.playlists);
      setSettings(loaded.settings);
      setSearchHistory(loaded.searchHistory);
      setSavedCollection(loaded.savedCollection);
      setHydrated(true);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    if (settings.theme === 'dark' && settings.pureBlack) {
      root.classList.add('pure-black');
    } else {
      root.classList.remove('pure-black');
    }
    const { tokens } = resolveMetrolistTheme(
      {
        theme: settings.theme,
        pureBlack: settings.pureBlack,
        dynamicColor: settings.dynamicColor,
        accentPreset: settings.accentPreset,
      },
      currentTrack
    );
    root.style.setProperty('--m3-bg', tokens.bg);
    root.style.setProperty('--m3-surface', tokens.surface);
    root.style.setProperty('--m3-surface-high', tokens.surfaceHigh);
    root.style.setProperty('--m3-border', tokens.border);
    root.style.setProperty('--m3-primary', tokens.primary);
    root.style.setProperty('--m3-on-primary', tokens.onPrimary);
    root.style.setProperty('--m3-primary-container', tokens.primaryContainer);
    root.style.setProperty('--m3-on-primary-container', tokens.onPrimaryContainer);
    root.style.setProperty('--m3-primary-soft', tokens.primarySoft);
    root.style.setProperty('--m3-ring', tokens.ring);
  }, [
    settings.theme,
    settings.pureBlack,
    settings.dynamicColor,
    settings.accentPreset,
    currentTrack,
    hydrated,
  ]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const initPlayer = () => {
      if (!ytContainerRef.current || ytPlayerRef.current || !window.YT?.Player) return;
      try {
        ytPlayerRef.current = new window.YT.Player(ytContainerRef.current, {
          height: '100%',
          width: '100%',
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            iv_load_policy: 3,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
            origin: window.location.origin,
          },
          events: {
            onReady: (ev) => {
              ytReadyRef.current = true;
              try {
                const iframe = ev.target.getIframe?.();
                if (iframe) {
                  iframe.setAttribute(
                    'allow',
                    'autoplay; encrypted-media; picture-in-picture; fullscreen'
                  );
                }
              } catch {
              }
              ev.target.setVolume(volumeRef.current);
              if (!isMutedRef.current) ev.target.unMute();
              if (lastLoadedVideoIdRef.current) {
                ev.target.loadVideoById(lastLoadedVideoIdRef.current);
              }
            },
            onStateChange: (ev) => {
              const PS = window.YT?.PlayerState;
              if (!PS) return;
              if (ev.data === PS.PLAYING) {
                intendedPlayingRef.current = true;
                userPausedRef.current = false;
                bgRecoveryCountRef.current = 0;
                setIsPlaying(true);
                setIsBuffering(false);
                if (!isMutedRef.current) {
                  try {
                    ev.target.unMute();
                    ev.target.setVolume(volumeRef.current);
                  } catch {
                  }
                }
                const d = ev.target.getDuration();
                if (d && d > 0) setDuration(d);
              } else if (ev.data === PS.PAUSED) {
                const now = Date.now();
                if (now - bgRecoveryWindowStartRef.current > 6000) {
                  bgRecoveryWindowStartRef.current = now;
                  bgRecoveryCountRef.current = 0;
                }
                const shouldRecover = shouldAutoRecoverBackgroundPlayback({
                  backgroundPlayEnabled: settingsRef.current.backgroundPlay,
                  intendedPlaying: intendedPlayingRef.current,
                  userPaused: userPausedRef.current,
                  visibilityHidden:
                    typeof document !== 'undefined' &&
                    document.visibilityState === 'hidden',
                  popupActive: popupModeRef.current !== 'off',
                  ytState: 'paused',
                });
                if (shouldRecover && bgRecoveryCountRef.current < 6) {
                  bgRecoveryCountRef.current += 1;
                  try {
                    if (!isMutedRef.current) {
                      ev.target.unMute();
                      ev.target.setVolume(volumeRef.current);
                    }
                    ev.target.playVideo();
                  } catch {
                  }
                  resumePlaybackKeepAlive();
                  return;
                }
                setIsPlaying(false);
                setIsBuffering(false);
              } else if (ev.data === PS.BUFFERING) {
                setIsBuffering(true);
              } else if (ev.data === PS.ENDED) {
                setIsBuffering(false);
                if (sleepEndOfTrackRef.current) {
                  sleepEndOfTrackRef.current = false;
                  setSleepTimerEndOfTrackState(false);
                  userPausedRef.current = true;
                  intendedPlayingRef.current = false;
                  setIsPlaying(false);
                  showToast('Sleep timer paused at end of track');
                  return;
                }
                nextTrackRef.current(false);
              }
            },
            onError: () => {
              setIsBuffering(false);
              if (settingsRef.current.autoSkipOnError) {
                const now = Date.now();
                if (now - lastAutoSkipAtRef.current > 2500) {
                  lastAutoSkipAtRef.current = now;
                  showToast('Track unavailable — skipping to next');
                  nextTrackRef.current(false);
                }
              }
            },
          },
        });
      } catch {
      }
    };
    if (window.YT?.Player) {
      initPlayer();
      return;
    }
    const existingScript = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]'
    );
    window.onYouTubeIframeAPIReady = () => initPlayer();
    if (!existingScript) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      document.head.appendChild(tag);
    }
  }, [resumePlaybackKeepAlive, showToast]);

  useEffect(() => {
    if (!currentTrack) return;
    let cancelled = false;
    lastLoadedVideoIdRef.current = currentTrack.videoId;
    if (ytReadyRef.current && ytPlayerRef.current) {
      try {
        const shouldCuePaused =
          !intendedPlayingRef.current &&
          settingsRef.current.keepPausedOnSongChange;
        if (shouldCuePaused && ytPlayerRef.current.cueVideoById) {
          ytPlayerRef.current.cueVideoById(currentTrack.videoId);
        } else {
          ytPlayerRef.current.loadVideoById(currentTrack.videoId);
          if (shouldCuePaused) {
            ytPlayerRef.current.pauseVideo();
          } else if (isPlaying) {
            ytPlayerRef.current.playVideo();
          }
        }
        ytPlayerRef.current.setPlaybackRate(settings.playbackRate);
      } catch {
      }
    }
    const syncTrackData = async () => {
      setCurrentTime(0);
      setDuration(currentTrack.duration ?? 210);
      setHistory((prev) => {
        const updated = recordTrackPlay(prev, currentTrack);
        saveHistory(updated);
        return updated;
      });
      setLyricsLoading(true);
      const params = new URLSearchParams({
        videoId: currentTrack.videoId,
        title: currentTrack.title,
        artist: currentTrack.artist,
        duration: String(currentTrack.duration ?? 0),
      });
      try {
        const res = await fetch(`/api/music/lyrics?${params.toString()}`);
        const data = (await res.json()) as LyricsPayload;
        if (!cancelled) setLyrics(data);
      } catch {
        if (!cancelled) {
          setLyrics({ synced: false, lines: [], plainText: null, source: 'none' });
        }
      } finally {
        if (!cancelled) setLyricsLoading(false);
      }
      const remaining = queueState.queue.length - 1 - queueState.currentIndex;
      if (
        settings.autoContinueRadio &&
        remaining <= 1 &&
        radioFetchingRef.current !== currentTrack.videoId
      ) {
        radioFetchingRef.current = currentTrack.videoId;
        try {
          const res = await fetch(
            `/api/music/up-next?videoId=${encodeURIComponent(currentTrack.videoId)}&gl=${settings.region}`
          );
          const data = (await res.json()) as { tracks?: Track[] };
          if (!cancelled && data.tracks && data.tracks.length > 0) {
            setQueueState((prev) =>
              appendRadioContinuation(prev, data.tracks!, settings, 12)
            );
          }
        } catch {
        }
      }
    };
    void syncTrackData();
    return () => {
      cancelled = true;
    };
  }, [currentTrack?.videoId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (currentTrack && isPlaying) {
      document.title = `▶ ${currentTrack.title} · ${currentTrack.artist} — ZRA`;
    } else if (currentTrack) {
      document.title = `${currentTrack.title} — ZRA`;
    } else {
      document.title = 'ZRA — Spatial Music';
    }
    if (isPlaying && settings.backgroundPlay && currentTrack) {
      ensureSilentAudioThread();
    } else if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
      void audioCtxRef.current.suspend().catch(() => {});
    }
  }, [isPlaying, settings.backgroundPlay, currentTrack, ensureSilentAudioThread]);

  useEffect(() => {
    return () => {
      clearRecoveryTimers();
      if (audioCtxRef.current) {
        void audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, [clearRecoveryTimers]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (
          settingsRef.current.backgroundPlay &&
          intendedPlayingRef.current &&
          !userPausedRef.current
        ) {
          resumePlaybackKeepAlive();
          if (settingsRef.current.autoPopoutIsland && popupModeRef.current === 'off') {
            popupHandlersRef.current.open();
          }
        }
      } else {
        bgRecoveryCountRef.current = 0;
        lastTickMsRef.current = Date.now();
        if (intendedPlayingRef.current && !userPausedRef.current) {
          resumePlaybackKeepAlive();
        }
        if (ytReadyRef.current && ytPlayerRef.current) {
          try {
            const ytTime = ytPlayerRef.current.getCurrentTime();
            if (typeof ytTime === 'number' && !Number.isNaN(ytTime) && ytTime > 0) {
              setCurrentTime(ytTime);
            }
          } catch {
          }
        }
      }
    };
    const handleWindowBlur = () => {
      if (
        settingsRef.current.backgroundPlay &&
        intendedPlayingRef.current &&
        !userPausedRef.current
      ) {
        resumePlaybackKeepAlive();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('pageshow', handleWindowBlur);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('pageshow', handleWindowBlur);
    };
  }, [resumePlaybackKeepAlive]);

  useEffect(() => {
    if (!isPlaying || !currentTrack) return;
    lastTickMsRef.current = Date.now();
    const timer = setInterval(() => {
      const now = Date.now();
      const lastTick = lastTickMsRef.current;
      lastTickMsRef.current = now;
      if (sleepDeadlineRef.current && now >= sleepDeadlineRef.current) {
        sleepDeadlineRef.current = null;
        setSleepTimerMinutes(null);
        userPausedRef.current = true;
        intendedPlayingRef.current = false;
        clearRecoveryTimers();
        setIsPlaying(false);
        ytPlayerRef.current?.pauseVideo();
        showToast('Sleep timer paused playback');
        return;
      }
      if (ytReadyRef.current && ytPlayerRef.current) {
        try {
          const ytState = ytPlayerRef.current.getPlayerState?.();
          if (
            intendedPlayingRef.current &&
            !userPausedRef.current &&
            settingsRef.current.backgroundPlay &&
            (popupModeRef.current !== 'off' || document.visibilityState === 'hidden') &&
            (ytState === 2 || ytState === 5)
          ) {
            if (!isMutedRef.current) {
              ytPlayerRef.current.unMute();
              ytPlayerRef.current.setVolume(volumeRef.current);
            }
            ytPlayerRef.current.playVideo();
          }
          const ytTime = ytPlayerRef.current.getCurrentTime();
          const ytDur = ytPlayerRef.current.getDuration();
          if (ytDur && ytDur > 0) setDuration(ytDur);
          if (typeof ytTime === 'number' && !Number.isNaN(ytTime) && ytTime > 0) {
            setCurrentTime(ytTime);
            return;
          }
        } catch {
        }
      }
      setCurrentTime((prev) => {
        const maxDur = duration || currentTrack.duration || 210;
        const { nextTime, reachedEnd } = computeElapsedWithDrift(
          prev,
          lastTick,
          now,
          settings.playbackRate,
          maxDur
        );
        if (reachedEnd) {
          nextTrackRef.current(false);
          return 0;
        }
        return nextTime;
      });
    }, 250);
    return () => clearInterval(timer);
  }, [isPlaying, currentTrack, duration, settings.playbackRate, showToast, clearRecoveryTimers]);

  const setActiveTab = useCallback((tab: NavTab) => {
    setActiveTabState(tab);
    setDetailTarget(null);
  }, []);

  const openDetail = useCallback((target: DetailTarget | null) => {
    setDetailTarget(target);
  }, []);

  const playTrack = useCallback((track: Track, contextQueue?: Track[]) => {
    userPausedRef.current = false;
    intendedPlayingRef.current = true;
    bgRecoveryCountRef.current = 0;
    setQueueState((prev) => playTrackInQueue(prev, track, contextQueue));
    setIsPlaying(true);
    if (ytReadyRef.current && ytPlayerRef.current) {
      try {
        ytPlayerRef.current.loadVideoById(track.videoId);
        ytPlayerRef.current.playVideo();
      } catch {
      }
    }
  }, []);

  const play = useCallback(() => {
    if (!currentTrack) return;
    userPausedRef.current = false;
    intendedPlayingRef.current = true;
    bgRecoveryCountRef.current = 0;
    setIsPlaying(true);
    ensureSilentAudioThread();
    if (ytReadyRef.current && ytPlayerRef.current) {
      try {
        if (!isMutedRef.current) {
          ytPlayerRef.current.unMute();
          ytPlayerRef.current.setVolume(volumeRef.current);
        }
        ytPlayerRef.current.playVideo();
      } catch {
      }
    }
  }, [currentTrack, ensureSilentAudioThread]);

  const pause = useCallback(() => {
    if (!currentTrack) return;
    userPausedRef.current = true;
    intendedPlayingRef.current = false;
    clearRecoveryTimers();
    setIsPlaying(false);
    if (ytReadyRef.current && ytPlayerRef.current) {
      try {
        ytPlayerRef.current.pauseVideo();
      } catch {
      }
    }
  }, [currentTrack, clearRecoveryTimers]);

  const togglePlayPause = useCallback(() => {
    if (!currentTrack) return;
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [currentTrack, isPlaying, pause, play]);

  const nextTrack = useCallback((manual = true) => {
    const stayPaused =
      manual &&
      settingsRef.current.keepPausedOnSongChange &&
      !intendedPlayingRef.current;
    setQueueState((prev) => {
      const res = advanceQueue(prev, 'next', { manual });
      if (res.ended || stayPaused) {
        userPausedRef.current = true;
        intendedPlayingRef.current = false;
        setIsPlaying(false);
      } else {
        userPausedRef.current = false;
        intendedPlayingRef.current = true;
        setIsPlaying(true);
      }
      return res.state;
    });
  }, []);

  useEffect(() => {
    nextTrackRef.current = nextTrack;
  }, [nextTrack]);

  const prevTrack = useCallback(() => {
    if (currentTime > 4) {
      setCurrentTime(0);
      ytPlayerRef.current?.seekTo(0, true);
      return;
    }
    const stayPaused =
      settingsRef.current.keepPausedOnSongChange &&
      !intendedPlayingRef.current;
    userPausedRef.current = stayPaused;
    intendedPlayingRef.current = !stayPaused;
    setQueueState((prev) => {
      const res = advanceQueue(prev, 'prev');
      setIsPlaying(!stayPaused);
      return res.state;
    });
  }, [currentTime]);

  const seekTo = useCallback((seconds: number) => {
    const clamped = Math.max(0, seconds);
    setCurrentTime(clamped);
    if (ytReadyRef.current && ytPlayerRef.current) {
      try {
        ytPlayerRef.current.seekTo(clamped, true);
      } catch {
      }
    }
  }, []);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    if (!currentTrack) {
      try {
        navigator.mediaSession.playbackState = 'none';
      } catch {
      }
      return;
    }
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist,
        album: currentTrack.album?.name || 'ZRA Music',
        artwork: currentTrack.thumbnail
          ? [
              { src: currentTrack.thumbnail, sizes: '256x256', type: 'image/jpeg' },
              { src: currentTrack.thumbnail, sizes: '544x544', type: 'image/jpeg' },
            ]
          : [],
      });
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
      navigator.mediaSession.setActionHandler('play', () => {
        play();
        resumePlaybackKeepAlive();
      });
      navigator.mediaSession.setActionHandler('pause', () => pause());
      navigator.mediaSession.setActionHandler('stop', () => pause());
      navigator.mediaSession.setActionHandler('nexttrack', () => nextTrack(true));
      navigator.mediaSession.setActionHandler('previoustrack', () => prevTrack());
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        const offset = details.seekOffset ?? 10;
        seekTo(Math.max(0, currentTime - offset));
      });
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        const offset = details.seekOffset ?? 10;
        seekTo(Math.min(duration || 210, currentTime + offset));
      });
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (typeof details.seekTime === 'number') {
          seekTo(details.seekTime);
        }
      });
    } catch {
    }
  }, [currentTrack, isPlaying, play, pause, resumePlaybackKeepAlive, nextTrack, prevTrack, seekTo, currentTime, duration]);

  useEffect(() => {
    if (
      typeof navigator === 'undefined' ||
      !('mediaSession' in navigator) ||
      typeof navigator.mediaSession.setPositionState !== 'function' ||
      !currentTrack
    ) {
      return;
    }
    const pos = buildMediaSessionPosition(currentTime, duration, settings.playbackRate);
    if (!pos) return;
    try {
      navigator.mediaSession.setPositionState(pos);
    } catch {
    }
  }, [currentTrack, currentTime, duration, settings.playbackRate]);

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(100, vol));
    setVolumeState(clamped);
    setIsMuted(clamped === 0);
    if (ytReadyRef.current && ytPlayerRef.current) {
      try {
        ytPlayerRef.current.setVolume(clamped);
        if (clamped > 0) ytPlayerRef.current.unMute();
      } catch {
      }
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (ytReadyRef.current && ytPlayerRef.current) {
        try {
          if (next) ytPlayerRef.current.mute();
          else ytPlayerRef.current.unMute();
        } catch {
        }
      }
      return next;
    });
  }, []);

  const playNextInQueue = useCallback(
    (track: Track) => {
      const wasEmpty = queueState.queue.length === 0;
      setQueueState((prev) => insertPlayNext(prev, track));
      if (wasEmpty) setIsPlaying(true);
      showToast(`Playing "${track.title}" next`);
    },
    [queueState.queue.length, showToast]
  );

  const addTrackToQueue = useCallback(
    (track: Track) => {
      const wasEmpty = queueState.queue.length === 0;
      setQueueState((prev) => appendToQueue(prev, track));
      if (wasEmpty) setIsPlaying(true);
      showToast(`Added "${track.title}" to queue`);
    },
    [queueState.queue.length, showToast]
  );

  const removeQueueIndex = useCallback((idx: number) => {
    setQueueState((prev) => removeFromQueue(prev, idx));
  }, []);

  const moveQueueItem = useCallback((from: number, to: number) => {
    setQueueState((prev) => reorderQueue(prev, from, to));
  }, []);

  const toggleShuffle = useCallback(() => {
    setQueueState((prev) => toggleShuffleQueue(prev));
  }, []);

  const cycleRepeat = useCallback(() => {
    setQueueState((prev) => ({ ...prev, repeat: cycleRepeatMode(prev.repeat) }));
  }, []);

  const jumpToQueueIndex = useCallback((idx: number) => {
    setQueueState((prev) => {
      if (idx < 0 || idx >= prev.queue.length) return prev;
      return { ...prev, currentIndex: idx };
    });
    setIsPlaying(true);
  }, []);

  const startRadio = useCallback(
    async (track: Track) => {
      playTrack(track, [track]);
      showToast(`Starting radio from "${track.title}"`);
      try {
        const res = await fetch(
          `/api/music/up-next?videoId=${encodeURIComponent(track.videoId)}&gl=${settings.region}`
        );
        const data = (await res.json()) as { tracks?: Track[] };
        if (data.tracks && data.tracks.length > 0) {
          setQueueState((prev) =>
            appendRadioContinuation(prev, data.tracks!, settings, 20)
          );
        }
      } catch {
      }
    },
    [playTrack, settings, showToast]
  );

  const setSleepTimer = useCallback(
    (minutes: number | null) => {
      setSleepTimerMinutes(minutes);
      if (minutes === null) {
        sleepDeadlineRef.current = null;
        if (!sleepEndOfTrackRef.current) {
          showToast('Sleep timer cancelled');
        }
      } else {
        sleepEndOfTrackRef.current = false;
        setSleepTimerEndOfTrackState(false);
        sleepDeadlineRef.current = Date.now() + minutes * 60_000;
        showToast(`Sleep timer set for ${minutes} min`);
      }
    },
    [showToast]
  );

  const setSleepTimerEndOfTrack = useCallback(
    (enabled: boolean) => {
      sleepEndOfTrackRef.current = enabled;
      setSleepTimerEndOfTrackState(enabled);
      if (enabled) {
        setSleepTimerMinutes(null);
        sleepDeadlineRef.current = null;
        showToast('Will pause at end of current track');
      } else {
        showToast('End-of-track sleep timer cancelled');
      }
    },
    [showToast]
  );

  const isLiked = useCallback(
    (videoId: string) => likedTracks.some((t) => t.videoId === videoId),
    [likedTracks]
  );

  const toggleLike = useCallback(
    (track: Track) => {
      setLikedTracks((prev) => {
        const exists = prev.some((t) => t.videoId === track.videoId);
        const next = exists
          ? prev.filter((t) => t.videoId !== track.videoId)
          : [track, ...prev];
        saveLikedTracks(next);
        showToast(exists ? 'Removed from Liked Songs' : 'Added to Liked Songs');
        return next;
      });
    },
    [showToast]
  );

  const createPlaylist = useCallback(
    (name: string, description?: string, initialTracks: Track[] = []) => {
      const now = Date.now();
      const created: UserPlaylist = {
        id: `pl-${now}-${Math.random().toString(36).slice(2, 6)}`,
        name: name.trim() || 'Untitled Playlist',
        description: description?.trim() || '',
        createdAt: now,
        updatedAt: now,
        tracks: initialTracks,
      };
      setPlaylists((prev) => {
        const next = [created, ...prev];
        savePlaylists(next);
        return next;
      });
      showToast(`Created playlist "${created.name}"`);
      return created;
    },
    [showToast]
  );

  const renamePlaylist = useCallback((id: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setPlaylists((prev) => {
      const next = prev.map((pl) =>
        pl.id === id ? { ...pl, name: trimmed, updatedAt: Date.now() } : pl
      );
      savePlaylists(next);
      return next;
    });
  }, []);

  const updatePlaylistTags = useCallback(
    (playlistId: string, tags: string[]) => {
      const normalized = Array.from(
        new Set(
          tags
            .map((t) => t.trim())
            .filter(Boolean)
            .slice(0, 8)
        )
      );
      setPlaylists((prev) => {
        const next = prev.map((pl) =>
          pl.id === playlistId
            ? { ...pl, tags: normalized, updatedAt: Date.now() }
            : pl
        );
        savePlaylists(next);
        return next;
      });
      showToast('Playlist tags updated');
    },
    [showToast]
  );

  const deletePlaylist = useCallback(
    (id: string) => {
      setPlaylists((prev) => {
        const next = prev.filter((pl) => pl.id !== id);
        savePlaylists(next);
        return next;
      });
      if (detailTarget?.kind === 'user-playlist' && detailTarget.id === id) {
        setDetailTarget(null);
      }
      showToast('Playlist deleted');
    },
    [detailTarget, showToast]
  );

  const addTrackToPlaylist = useCallback(
    (playlistId: string, track: Track) => {
      setPlaylists((prev) => {
        const next = prev.map((pl) => {
          if (pl.id !== playlistId) return pl;
          if (pl.tracks.some((t) => t.videoId === track.videoId)) return pl;
          return {
            ...pl,
            updatedAt: Date.now(),
            tracks: [...pl.tracks, track],
          };
        });
        savePlaylists(next);
        return next;
      });
      const targetPl = playlists.find((p) => p.id === playlistId);
      showToast(
        targetPl ? `Saved to "${targetPl.name}"` : 'Added track to playlist'
      );
    },
    [playlists, showToast]
  );

  const removeTrackFromPlaylist = useCallback(
    (playlistId: string, videoId: string) => {
      setPlaylists((prev) => {
        const next = prev.map((pl) =>
          pl.id === playlistId
            ? {
                ...pl,
                updatedAt: Date.now(),
                tracks: pl.tracks.filter((t) => t.videoId !== videoId),
              }
            : pl
        );
        savePlaylists(next);
        return next;
      });
    },
    []
  );

  const isSavedInCollection = useCallback(
    (kind: SavedCollectionItem['kind'], id: string) =>
      savedCollection.some((item) => item.kind === kind && item.id === id),
    [savedCollection]
  );

  const toggleSaveCollection = useCallback(
    (item: Omit<SavedCollectionItem, 'savedAt'>) => {
      setSavedCollection((prev) => {
        const exists = prev.some(
          (i) => i.kind === item.kind && i.id === item.id
        );
        const next = exists
          ? prev.filter((i) => !(i.kind === item.kind && i.id === item.id))
          : [{ ...item, savedAt: Date.now() }, ...prev];
        saveCollection(next);
        showToast(exists ? 'Removed from Library' : 'Saved to Library');
        return next;
      });
    },
    [showToast]
  );

  const addSearchHistory = useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setSearchHistory((prev) => {
      const next = [trimmed, ...prev.filter((q) => q.toLowerCase() !== trimmed.toLowerCase())].slice(0, 12);
      saveSearchHistory(next);
      return next;
    });
  }, []);

  const clearSearchHistory = useCallback(() => {
    setSearchHistory([]);
    saveSearchHistory([]);
  }, []);

  const clearPlayHistory = useCallback(() => {
    setHistory([]);
    saveHistory([]);
    showToast('Listening history cleared');
  }, [showToast]);

  const updateSettings = useCallback((patch: Partial<PlayerSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      if (patch.playbackRate && ytReadyRef.current && ytPlayerRef.current) {
        try {
          ytPlayerRef.current.setPlaybackRate(patch.playbackRate);
        } catch {
        }
      }
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    saveSettings(DEFAULT_SETTINGS);
    if (ytReadyRef.current && ytPlayerRef.current) {
      try {
        ytPlayerRef.current.setPlaybackRate(DEFAULT_SETTINGS.playbackRate);
      } catch {
      }
    }
    showToast('Preferences reset to ZRA defaults');
  }, [showToast]);

  const exportLibraryBackup = useCallback(() => {
    const payload = {
      app: 'ZRA',
      version: 1,
      exportedAt: new Date().toISOString(),
      history,
      likedTracks,
      playlists,
      savedCollection,
      searchHistory,
      settings,
    };
    return JSON.stringify(payload, null, 2);
  }, [history, likedTracks, playlists, savedCollection, searchHistory, settings]);

  const importLibraryBackup = useCallback(
    (rawJson: string): { ok: boolean; message: string } => {
      try {
        const parsed = JSON.parse(rawJson) as Record<string, unknown>;
        if (!parsed || typeof parsed !== 'object') {
          return { ok: false, message: 'Invalid backup JSON file' };
        }
        let importedCount = 0;
        if (Array.isArray(parsed.history)) {
          const validHistory = parsed.history as PlayEvent[];
          setHistory(validHistory);
          saveHistory(validHistory);
          importedCount += validHistory.length;
        }
        if (Array.isArray(parsed.likedTracks)) {
          const validLiked = parsed.likedTracks as Track[];
          setLikedTracks(validLiked);
          saveLikedTracks(validLiked);
          importedCount += validLiked.length;
        }
        if (Array.isArray(parsed.playlists)) {
          const validPlaylists = parsed.playlists as UserPlaylist[];
          setPlaylists(validPlaylists);
          savePlaylists(validPlaylists);
          importedCount += validPlaylists.length;
        }
        if (Array.isArray(parsed.savedCollection)) {
          const validSaved = parsed.savedCollection as SavedCollectionItem[];
          setSavedCollection(validSaved);
          saveCollection(validSaved);
        }
        if (Array.isArray(parsed.searchHistory)) {
          const validSearch = parsed.searchHistory.filter(
            (q): q is string => typeof q === 'string'
          );
          setSearchHistory(validSearch);
          saveSearchHistory(validSearch);
        }
        if (parsed.settings && typeof parsed.settings === 'object') {
          const merged: PlayerSettings = {
            ...DEFAULT_SETTINGS,
            ...(parsed.settings as Partial<PlayerSettings>),
          };
          setSettings(merged);
          saveSettings(merged);
        }
        const msg =
          importedCount > 0
            ? `Backup restored (${importedCount} items)`
            : 'Backup settings restored';
        showToast(msg);
        return { ok: true, message: msg };
      } catch {
        return { ok: false, message: 'Could not parse backup file' };
      }
    },
    [showToast]
  );

  const value: MusicContextValue = {
    activeTab,
    setActiveTab,
    detailTarget,
    openDetail,
    queueState,
    currentTrack,
    isPlaying,
    isBuffering,
    currentTime,
    duration,
    volume,
    isMuted,
    isNowPlayingOpen,
    setIsNowPlayingOpen,
    nowPlayingTab,
    setNowPlayingTab,
    showVideoStage,
    setShowVideoStage,
    sleepTimerMinutes,
    setSleepTimer,
    sleepTimerEndOfTrack,
    setSleepTimerEndOfTrack,
    popupMode,
    setPopupMode,
    openBackgroundPopup,
    closeBackgroundPopup,
    toggleBackgroundPopup,
    resumePlaybackKeepAlive,
    registerPopupHandlers,
    playTrack,
    play,
    pause,
    togglePlayPause,
    nextTrack,
    prevTrack,
    seekTo,
    setVolume,
    toggleMute,
    playNextInQueue,
    addTrackToQueue,
    removeQueueIndex,
    moveQueueItem,
    toggleShuffle,
    cycleRepeat,
    startRadio,
    jumpToQueueIndex,
    lyrics,
    lyricsLoading,
    history,
    likedTracks,
    isLiked,
    toggleLike,
    playlists,
    createPlaylist,
    renamePlaylist,
    updatePlaylistTags,
    deletePlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    playlistPickerTrack,
    openPlaylistPicker: setPlaylistPickerTrack,
    savedCollection,
    isSavedInCollection,
    toggleSaveCollection,
    searchHistory,
    addSearchHistory,
    clearSearchHistory,
    clearPlayHistory,
    settings,
    updateSettings,
    resetSettings,
    exportLibraryBackup,
    importLibraryBackup,
    toastMessage,
    showToast,
    ytContainerRef,
  };

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
  }
