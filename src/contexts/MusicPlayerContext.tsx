'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, {
  createContext,
  useContext,
  useReducer,
  useRef,
  useEffect,
  useCallback,
} from 'react';

import { trackApi } from '@/services/api';
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
  // URL-based track playing
  playTrackById: (
    trackId: string,
    updateUrl?: boolean,
    authContext?: { user: unknown; hasPurchased: (id: string) => boolean }
  ) => Promise<void>;
  updateUrlWithTrack: (trackId: string) => void;
  removeTrackFromUrl: () => void;
  cancelAndCloseAll: () => void;
  // Payment and auth related
  showAuthDrawer: boolean;
  setShowAuthDrawer: (show: boolean) => void;
  showPaymentDrawer: boolean;
  setShowPaymentDrawer: (show: boolean) => void;
  pendingTrack: MusicTrack | null;
  setPendingTrack: (track: MusicTrack | null) => void;
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
  queue: [],
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
  const [drawerState, setDrawerStateInternal] = React.useState<PlayerDrawerState>('closed');
  const [showAuthDrawer, setShowAuthDrawer] = React.useState(false);
  const [showPaymentDrawer, setShowPaymentDrawer] = React.useState(false);
  const [pendingTrack, setPendingTrack] = React.useState<MusicTrack | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const playTrack = (track: MusicTrack, trackList?: MusicTrack[]) => {
    // If no trackList provided, use current queue or fetch from API
    const queue = trackList || state.queue;
    const index = queue.findIndex((t) => t.id === track.id);
    dispatch({ type: 'SET_CURRENT_TRACK', payload: { track, queue, index } });
    dispatch({ type: 'SET_LOADING', payload: true });
    // Don't set playing state yet, let the audio events handle it
    setDrawerState('mini');
    // URL will be updated only when drawer state changes to 'expanded'
  };

  const updateUrlWithTrack = useCallback(
    (trackId: string) => {
      // Only update URL with track ID when expanded player is open
      if (drawerState === 'expanded') {
        const params = new URLSearchParams(searchParams.toString());
        params.set('track', trackId);
        router.push(`/?${params.toString()}`, { scroll: false });
      }
    },
    [drawerState, searchParams, router]
  );

  const removeTrackFromUrl = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('track');
    const newUrl = params.toString() ? `/?${params.toString()}` : '/';
    router.push(newUrl, { scroll: false });
  };

  const cancelAndCloseAll = () => {
    // Close all drawers and clear URL
    setShowAuthDrawer(false);
    setShowPaymentDrawer(false);
    setPendingTrack(null);
    setDrawerStateInternal('mini');
    removeTrackFromUrl();
  };

  const setDrawerState = (newState: PlayerDrawerState) => {
    const previousState = drawerState;
    setDrawerStateInternal(newState);

    // Handle URL updates based on state changes
    if (newState === 'expanded' && state.currentTrack) {
      // Add track ID to URL when expanding to full screen
      const params = new URLSearchParams(searchParams.toString());
      params.set('track', state.currentTrack.id);
      router.push(`/?${params.toString()}`, { scroll: false });
    } else if (previousState === 'expanded' && newState !== 'expanded') {
      // Remove track ID from URL when closing expanded player
      removeTrackFromUrl();
    }
  };

  const playTrackById = async (
    trackId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _updateUrl: boolean = true,
    authContext?: { user: unknown; hasPurchased: (id: string) => boolean }
  ) => {
    try {
      // First try to find in current queue
      let track = state.queue.find((t) => t.id === trackId);

      if (!track) {
        // If not found in queue, fetch from API
        const response = await trackApi.getTrack(trackId);
        track = response;
      }

      if (track) {
        // Add validation logic similar to handleTrackClick in MusicList
        if (track.paid && authContext) {
          // Check if user is authenticated
          if (!authContext.user) {
            setPendingTrack(track);
            setShowAuthDrawer(true);
            return;
          }

          // Check if user has already purchased the track
          if (!authContext.hasPurchased(track.id)) {
            setPendingTrack(track);
            setShowPaymentDrawer(true);
            return;
          }
        }

        // Play the track if it's free or user has purchased it
        // If we don't have a full queue, fetch tracks from API
        let queue = state.queue;
        if (queue.length === 0) {
          try {
            const tracksResponse = await trackApi.getTracks();
            queue = tracksResponse.tracks;
          } catch (error) {
            console.error('Failed to fetch tracks for queue:', error);
            queue = [track]; // Use single track as queue
          }
        }

        const index = queue.findIndex((t) => t.id === track!.id);
        dispatch({ type: 'SET_CURRENT_TRACK', payload: { track, queue, index } });
        dispatch({ type: 'SET_LOADING', payload: true });
        setDrawerState('expanded'); // Open expanded player directly for URL-based loading
        // URL will be updated automatically by setDrawerState
      } else {
        console.error('Track not found:', trackId);
      }
    } catch (error) {
      console.error('Error loading track:', error);
    }
  };

  const pauseTrack = () => {
    dispatch({ type: 'SET_PLAYING', payload: false });
  };

  const resumeTrack = () => {
    dispatch({ type: 'SET_PLAYING', payload: true });
  };

  // These functions are replaced by nextTrackWithUrl and previousTrackWithUrl

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

  // Update next/previous track functions to update URL
  const nextTrackWithUrl = useCallback(() => {
    if (state.queue.length > 0) {
      dispatch({ type: 'NEXT_TRACK' });
      const nextIndex = state.currentIndex < state.queue.length - 1 ? state.currentIndex + 1 : 0;
      const nextTrack = state.queue[nextIndex];
      if (nextTrack) {
        updateUrlWithTrack(nextTrack.id);
      }
    }
  }, [state.currentIndex, state.queue, updateUrlWithTrack]);

  const previousTrackWithUrl = useCallback(() => {
    if (state.queue.length > 0) {
      dispatch({ type: 'PREVIOUS_TRACK' });
      const prevIndex = state.currentIndex > 0 ? state.currentIndex - 1 : state.queue.length - 1;
      const prevTrack = state.queue[prevIndex];
      if (prevTrack) {
        updateUrlWithTrack(prevTrack.id);
      }
    }
  }, [state.currentIndex, state.queue, updateUrlWithTrack]);

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
        nextTrackWithUrl();
      }
    };

    const handleError = (event: Event) => {
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_BUFFERING', payload: false });
      dispatch({ type: 'SET_PLAYING', payload: false });
      console.error('Audio loading failed for track:', state.currentTrack?.title, event);
      // You could add toast notification here for user feedback
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
  }, [state.isRepeated, state.currentTrack, nextTrackWithUrl]);

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

    // Validate audio URL before setting
    const audioUrl = state.currentTrack.audioUrl;
    if (!audioUrl || typeof audioUrl !== 'string') {
      console.warn('Invalid audio URL for track:', state.currentTrack.title);
      return;
    }

    audio.src = audioUrl;
    audio.preload = 'auto'; // Enable preloading
    audio.load(); // Start loading the audio
  }, [state.currentTrack]);

  // URL-based track loading is now handled by useUrlTrackLoader hook

  const value: MusicPlayerContextType = {
    state,
    drawerState,
    setDrawerState,
    playTrack,
    pauseTrack,
    resumeTrack,
    nextTrack: nextTrackWithUrl,
    previousTrack: previousTrackWithUrl,
    seekTo,
    setVolume,
    toggleShuffle,
    toggleRepeat,
    audioRef,
    playTrackById,
    updateUrlWithTrack,
    removeTrackFromUrl,
    cancelAndCloseAll,
    showAuthDrawer,
    setShowAuthDrawer,
    showPaymentDrawer,
    setShowPaymentDrawer,
    pendingTrack,
    setPendingTrack,
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
