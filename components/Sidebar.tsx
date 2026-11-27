'use client';

import React from 'react';
import {
  Compass,
  Home,
  Library,
  ListMusic,
  Plus,
  Search,
  Settings,
} from 'lucide-react';
import { useMusic } from './MusicProvider';
import type { NavTab } from '@/lib/metrolist/types';
import { cn } from '@/lib/utils';

const NAV_ITEMS: Array<{ id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'charts', label: 'Explore', icon: Compass },
  { id: 'library', label: 'Library', icon: Library },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const {
    activeTab,
    setActiveTab,
    detailTarget,
    openDetail,
    playlists,
    createPlaylist,
  } = useMusic();

  return (
    <aside
      aria-label="Primary navigation"
      className="hidden lg:flex flex-col w-64 shrink-0 h-[calc(100vh-2rem)] sticky top-4 ml-4 my-4 rounded-3xl liquid-glass p-4 justify-between"
    >
      <div className="flex flex-col gap-6 min-h-0 flex-1">
        {/* Brand Wordmark */}
        <div className="px-2 pt-1 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className="text-xl font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 text-left"
          >
            ZRA
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id && !detailTarget;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-sm font-medium transition-colors duration-150 whitespace-nowrap shrink-0',
                  isActive
                    ? 'bg-[var(--m3-primary-container)] text-[var(--m3-on-primary-container)] font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/[0.06] hover:text-slate-950 dark:hover:text-white'
                )}
              >
                <Icon className="w-[18px] h-[18px] shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Playlists Quick Access */}
        <div className="flex flex-col min-h-0 flex-1 border-t border-black/5 dark:border-white/10 pt-4">
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Playlists
            </span>
            <button
              type="button"
              onClick={() => {
                const pl = createPlaylist(`Mix #${playlists.length + 1}`);
                setActiveTab('library');
                openDetail({ kind: 'user-playlist', id: pl.id });
              }}
              aria-label="New playlist"
              className="w-7 h-7 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar space-y-0.5 pr-1">
            {playlists.map((pl) => {
              const isSelected =
                detailTarget?.kind === 'user-playlist' &&
                detailTarget.id === pl.id;
              return (
                <button
                  key={pl.id}
                  type="button"
                  onClick={() => {
                    setActiveTab('library');
                    openDetail({ kind: 'user-playlist', id: pl.id });
                  }}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-sm transition-colors',
                    isSelected
                      ? 'bg-[var(--m3-primary-soft)] text-[var(--m3-primary)] font-medium'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white'
                  )}
                >
                  <ListMusic className="w-4 h-4 shrink-0 text-[var(--m3-primary)]" />
                  <span className="truncate flex-1">{pl.name}</span>
                  <span className="text-xs font-mono-nums text-slate-400 dark:text-slate-500">
                    {pl.tracks.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
