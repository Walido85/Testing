import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { playerGlobalState } from '../services/playerState';
import { Station } from '../types';

interface PlayerContextType {
  currentStream: string | null;
  stationInfo: Station | null;
  isPlaying: boolean;
  isExpanded: boolean;
  favorites: string[];
  recentlyPlayed: Station[];
  sleepTimer: number | null;
  accentColor: string;
  volume: number;
  playRadio: (streamUrl: string, info: Station) => void;
  togglePlay: () => void;
  toggleExpand: () => void;
  closePlayer: () => void;
  toggleFavorite: (id: string) => void;
  setSleepTimer: (minutes: number | null) => void;
  setAccentColor: (color: string) => void;
  setVolume: (volume: number) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  // Initialize from global state
  const initialState = playerGlobalState.get();
  const [currentStream, setCurrentStream] = useState<string | null>(initialState.currentStream);
  const [stationInfo, setStationInfo] = useState<Station | null>(initialState.stationInfo);
  const [isPlaying, setIsPlaying] = useState(initialState.isPlaying);

  const [isExpanded, setIsExpanded] = useState(false);
  const [volume, setVolume] = useState(1);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Station[]>([]);
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);
  const [accentColor, setAccentColor] = useState('#ff4e00');

  // Load saved state on mount (Client only)
  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      const savedVolume = localStorage.getItem('radio_volume');
      if (savedVolume) setVolume(parseFloat(savedVolume));

      const savedFavs = localStorage.getItem('radio_favorites');
      if (savedFavs) setFavorites(JSON.parse(savedFavs));

      const savedRecent = localStorage.getItem('radio_recent');
      if (savedRecent) setRecentlyPlayed(JSON.parse(savedRecent));

      // NEW: Restore player state and resume if was playing
      const savedPlayerState = localStorage.getItem('player_state');
      if (savedPlayerState) {
        setTimeout(() => {
          const { currentStream, stationInfo } = JSON.parse(savedPlayerState);
          if (currentStream && stationInfo) {
            playerGlobalState.set({
              currentStream,
              stationInfo,
              isPlaying: false // Do not auto-play on initial load
            });
          }
        }, 0);
      }
    }
  }, []);

  // Sync with Global State & Persist
  useEffect(() => {
    return playerGlobalState.subscribe((state) => {
      setCurrentStream(state.currentStream);
      setStationInfo(state.stationInfo);
      setIsPlaying(state.isPlaying);

      // Persist to localStorage
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('player_state', JSON.stringify({
          currentStream: state.currentStream,
          stationInfo: state.stationInfo,
          isPlaying: state.isPlaying // saving actual isPlaying state, but will force false on read
        }));
      }
    });
  }, []);

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('radio_favorites', JSON.stringify(favorites));
    }
  }, [favorites]);

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('radio_recent', JSON.stringify(recentlyPlayed));
    }
  }, [recentlyPlayed]);

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('radio_volume', volume.toString());
    }
  }, [volume]);

  // Sleep Timer Logic
  useEffect(() => {
    if (sleepTimer === null || !isPlaying) return;

    const interval = setInterval(() => {
      setSleepTimer(prev => {
        if (prev === null || prev <= 0) {
          setIsPlaying(false);
          return null;
        }
        return prev - 1;
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [sleepTimer, isPlaying]);

  const playRadio = (streamUrl: string, info: Station) => {
    playerGlobalState.set({
      currentStream: streamUrl,
      stationInfo: info,
      isPlaying: true,
    });
    
    // Add to recently played
    setRecentlyPlayed(prev => {
      const filtered = prev.filter(s => s.id !== info.id);
      return [info, ...filtered].slice(0, 10);
    });
  };

  const togglePlay = () => {
    playerGlobalState.set({ isPlaying: !isPlaying });
  };

  const toggleExpand = () => setIsExpanded(!isExpanded);
  
  const closePlayer = () => {
    playerGlobalState.set({
      currentStream: null,
      stationInfo: null,
      isPlaying: false,
    });
    setIsExpanded(false);
    setSleepTimer(null);
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  return (
    <PlayerContext.Provider value={{
      currentStream,
      stationInfo,
      isPlaying,
      isExpanded,
      favorites,
      recentlyPlayed,
      sleepTimer,
      accentColor,
      volume,
      playRadio,
      togglePlay,
      toggleExpand,
      closePlayer,
      toggleFavorite,
      setSleepTimer,
      setAccentColor,
      setVolume
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

const PLAYER_DEFAULTS: PlayerContextType = {
  currentStream: null,
  stationInfo: null,
  isPlaying: false,
  isExpanded: false,
  favorites: [],
  recentlyPlayed: [],
  sleepTimer: null,
  accentColor: '#ff4e00',
  volume: 1,
  playRadio: () => {},
  togglePlay: () => {},
  toggleExpand: () => {},
  closePlayer: () => {},
  toggleFavorite: () => {},
  setSleepTimer: () => {},
  setAccentColor: () => {},
  setVolume: () => {},
};

export function usePlayer() {
  return useContext(PlayerContext) ?? PLAYER_DEFAULTS;
}
