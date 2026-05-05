// Global singleton to share player state across different Astro islands
import { Station } from '../types';

interface PlayerState {
  currentStream: string | null;
  stationInfo: Station | null;
  isPlaying: boolean;
  listeners: ((state: PlayerState) => void)[];
}

const state: PlayerState = {
  currentStream: null,
  stationInfo: null,
  isPlaying: false,
  listeners: [],
};

export const playerGlobalState = {
  get() {
    return { ...state };
  },
  
  set(newState: Partial<Omit<PlayerState, 'listeners'>>) {
    Object.assign(state, newState);
    state.listeners.forEach(cb => cb({ ...state }));
  },
  
  subscribe(callback: (state: PlayerState) => void) {
    state.listeners.push(callback);
    // Call immediately with current state
    callback({ ...state });
    return () => {
      state.listeners = state.listeners.filter(cb => cb !== callback);
    };
  }
};
