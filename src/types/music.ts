export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  coverUrl: string;
  audioUrl: string;
  genre: string;
}

export interface PlayerState {
  currentTrack: MusicTrack | null;
  isPlaying: boolean;
  isLoading: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isShuffled: boolean;
  isRepeated: boolean;
  queue: MusicTrack[];
  currentIndex: number;
}

export type PlayerDrawerState = 'closed' | 'mini' | 'expanded';
