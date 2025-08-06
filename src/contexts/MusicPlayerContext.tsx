'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useRef,
  useEffect,
  useCallback,
} from 'react';

import { mockMusicTracks } from '@/data/musicData';
import { MusicTrack, PlayerState, PlayerDrawerState } from '@/types/music';

interface MusicPlayerContextType {
  state: PlayerState;
  drawerState: PlayerDrawerState;
  setDrawerState: (state: PlayerDrawerState) => void;
  playTrack: (track: MusicTrack, trackList?: MusicTrack[]) => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

type PlayerAction =
  | {
      type: 'SET_CURRENT_TRACK';
      payload: { track: MusicTrack; queue: MusicTrack[]; index: number };
    }
  | { type: 'SET_PLAYING'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_BUFFERING'; payload: boolean }
  | { type: 'SET_CURRENT_TIME'; payload: number }
  | { type: 'SET_DURATION'; payload: number }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'TOGGLE_SHUFFLE' }
  | { type: 'TOGGLE_REPEAT' }
  | { type: 'NEXT_TRACK' }
  | { type: 'PREVIOUS_TRACK' };

const initialState: PlayerState = {
  currentTrack: null,
  isPlaying: false,
  isLoading: false,
  isBuffering: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  isShuffled: false,
  isRepeated: false,
  queue: mockMusicTracks,
  currentIndex: -1,
};

const playerReducer = (state: PlayerState, action: PlayerAction): PlayerState => {
  switch (action.type) {
    case 'SET_CURRENT_TRACK':
      return {
        ...state,
        currentTrack: action.payload.track,
        queue: action.payload.queue,
        currentIndex: action.payload.index,
        currentTime: 0,
        isPlaying: false, // Will be set to true when audio starts playing
      };
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_BUFFERING':
      return { ...state, isBuffering: action.payload };
    case 'SET_CURRENT_TIME':
      return { ...state, currentTime: action.payload };
    case 'SET_DURATION':
      return { ...state, duration: action.payload };
    case 'SET_VOLUME':
      return { ...state, volume: action.payload };
    case 'TOGGLE_SHUFFLE':
      return { ...state, isShuffled: !state.isShuffled };
    case 'TOGGLE_REPEAT':
      return { ...state, isRepeated: !state.isRepeated };
    case 'NEXT_TRACK': {
      const nextIndex = state.currentIndex < state.queue.length - 1 ? state.currentIndex + 1 : 0;
      return {
        ...state,
        currentIndex: nextIndex,
        currentTrack: state.queue[nextIndex],
        currentTime: 0,
      };
    }
    case 'PREVIOUS_TRACK': {
      const prevIndex = state.currentIndex > 0 ? state.currentIndex - 1 : state.queue.length - 1;
      return {
        ...state,
        currentIndex: prevIndex,
        currentTrack: state.queue[prevIndex],
        currentTime: 0,
      };
    }
    default:
      return state;
  }
};

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export const MusicPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(playerReducer, initialState);
  const [drawerState, setDrawerState] = React.useState<PlayerDrawerState>('closed');
  const audioRef = useRef<HTMLAudioElement>(null);

  const playTrack = (track: MusicTrack, trackList?: MusicTrack[]) => {
    const queue = trackList || mockMusicTracks;
    const index = queue.findIndex((t) => t.id === track.id);
    dispatch({ type: 'SET_CURRENT_TRACK', payload: { track, queue, index } });
    dispatch({ type: 'SET_LOADING', payload: true });
    // Don't set playing state yet, let the audio events handle it
    setDrawerState('mini');
  };

  const pauseTrack = () => {
    dispatch({ type: 'SET_PLAYING', payload: false });
  };

  const resumeTrack = () => {
    dispatch({ type: 'SET_PLAYING', payload: true });
  };

  const nextTrack = useCallback(() => {
    if (state.queue.length > 0) {
      dispatch({ type: 'NEXT_TRACK' });
    }
  }, [state.queue.length]);

  const previousTrack = useCallback(() => {
    if (state.queue.length > 0) {
      dispatch({ type: 'PREVIOUS_TRACK' });
    }
  }, [state.queue.length]);

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      dispatch({ type: 'SET_CURRENT_TIME', payload: time });
    }
  };

  const setVolume = (volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      dispatch({ type: 'SET_VOLUME', payload: volume });
    }
  };

  const toggleShuffle = () => {
    dispatch({ type: 'TOGGLE_SHUFFLE' });
  };

  const toggleRepeat = () => {
    dispatch({ type: 'TOGGLE_REPEAT' });
  };

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      dispatch({ type: 'SET_CURRENT_TIME', payload: audio.currentTime });
    };

    const handleDurationChange = () => {
      dispatch({ type: 'SET_DURATION', payload: audio.duration || 0 });
    };

    const handleLoadStart = () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_BUFFERING', payload: false });
    };

    const handleCanPlay = () => {
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_BUFFERING', payload: false });
      // Auto-play when audio is ready
      if (state.currentTrack) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              dispatch({ type: 'SET_PLAYING', payload: true });
            })
            .catch((error) => {
              // If autoplay fails due to browser policy, that's okay
              // User can manually click play
              console.warn('Autoplay prevented by browser:', error);
              dispatch({ type: 'SET_PLAYING', payload: false });
            });
        }
      }
    };

    const handleWaiting = () => {
      dispatch({ type: 'SET_BUFFERING', payload: true });
    };

    const handlePlaying = () => {
      dispatch({ type: 'SET_BUFFERING', payload: false });
      dispatch({ type: 'SET_LOADING', payload: false });
    };

    const handleEnded = () => {
      if (state.isRepeated) {
        audio.currentTime = 0;
        audio.play();
      } else {
        nextTrack();
      }
    };

    const handleError = () => {
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_BUFFERING', payload: false });
      dispatch({ type: 'SET_PLAYING', payload: false });
      console.error('Audio loading failed');
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [state.isRepeated, state.currentTrack, nextTrack]);

  // Control audio playback based on state (for manual play/pause)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !state.currentTrack || state.isLoading) return;

    if (state.isPlaying && audio.paused) {
      audio.play().catch(console.error);
    } else if (!state.isPlaying && !audio.paused) {
      audio.pause();
    }
  }, [state.isPlaying, state.currentTrack, state.isLoading]);

  // Update audio source when track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !state.currentTrack) return;

    audio.src = state.currentTrack.audioUrl;
    audio.preload = 'auto'; // Enable preloading
    audio.load(); // Start loading the audio
  }, [state.currentTrack]);

  const value: MusicPlayerContextType = {
    state,
    drawerState,
    setDrawerState,
    playTrack,
    pauseTrack,
    resumeTrack,
    nextTrack,
    previousTrack,
    seekTo,
    setVolume,
    toggleShuffle,
    toggleRepeat,
    audioRef,
  };

  return (
    <MusicPlayerContext.Provider value={value}>
      {children}
      <audio ref={audioRef} preload="auto" crossOrigin="anonymous" />
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = (): MusicPlayerContextType => {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
};
