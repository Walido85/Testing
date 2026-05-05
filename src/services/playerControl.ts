// Shared communication channel for the radio player
const PLAYER_CHANNEL = 'tuniwave_player_channel';

export interface PlayerCommand {
  type: 'PLAY_RADIO' | 'TOGGLE_PLAY' | 'CLOSE_PLAYER';
  streamUrl?: string;
  stationInfo?: any;
}

const channel = typeof window !== 'undefined' ? new BroadcastChannel(PLAYER_CHANNEL) : null;

export const playerControl = {
  playRadio(streamUrl: string, stationInfo: any) {
    channel?.postMessage({ type: 'PLAY_RADIO', streamUrl, stationInfo });
  },
  togglePlay() {
    channel?.postMessage({ type: 'TOGGLE_PLAY' });
  },
  closePlayer() {
    channel?.postMessage({ type: 'CLOSE_PLAYER' });
  },
  subscribe(callback: (command: PlayerCommand) => void) {
    if (!channel) return () => {};
    const handler = (event: MessageEvent) => callback(event.data);
    channel.addEventListener('message', handler);
    return () => channel.removeEventListener('message', handler);
  }
};
