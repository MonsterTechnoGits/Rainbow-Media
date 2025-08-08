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

import { storyApi } from '@/services/api';
import { AudioStory, PlayerState, PlayerDrawerState } from '@/types/audio-story';

interface AudioPlayerContextType {
  state: PlayerState;
  drawerState: PlayerDrawerState;
  setDrawerState: (state: PlayerDrawerState) => void;
  playStory: (story: AudioStory, storyList?: AudioStory[]) => void;
  pauseStory: () => void;
  resumeStory: () => void;
  nextStory: () => void;
  previousStory: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  // URL-based story playing
  playStoryById: (
    storyId: string,
    updateUrl?: boolean,
    authContext?: { user: unknown; hasPurchased: (id: string) => boolean }
  ) => Promise<void>;
  updateUrlWithStory: (storyId: string) => void;
  removeStoryFromUrl: () => void;
  cancelAndCloseAll: () => void;
  // Payment and auth related
  showAuthDrawer: boolean;
  setShowAuthDrawer: (show: boolean) => void;
  showPaymentDrawer: boolean;
  setShowPaymentDrawer: (show: boolean) => void;
  pendingStory: AudioStory | null;
  setPendingStory: (story: AudioStory | null) => void;
}

type PlayerAction =
  | {
      type: 'SET_CURRENT_STORY';
      payload: { story: AudioStory; queue: AudioStory[]; index: number };
    }
  | { type: 'SET_PLAYING'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_BUFFERING'; payload: boolean }
  | { type: 'SET_CURRENT_TIME'; payload: number }
  | { type: 'SET_DURATION'; payload: number }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'TOGGLE_SHUFFLE' }
  | { type: 'TOGGLE_REPEAT' }
  | { type: 'NEXT_STORY' }
  | { type: 'PREVIOUS_STORY' };

const initialState: PlayerState = {
  currentStory: null,
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
    case 'SET_CURRENT_STORY':
      return {
        ...state,
        currentStory: action.payload.story,
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
    case 'NEXT_STORY': {
      const nextIndex = state.currentIndex < state.queue.length - 1 ? state.currentIndex + 1 : 0;
      return {
        ...state,
        currentIndex: nextIndex,
        currentStory: state.queue[nextIndex],
        currentTime: 0,
      };
    }
    case 'PREVIOUS_STORY': {
      const prevIndex = state.currentIndex > 0 ? state.currentIndex - 1 : state.queue.length - 1;
      return {
        ...state,
        currentIndex: prevIndex,
        currentStory: state.queue[prevIndex],
        currentTime: 0,
      };
    }
    default:
      return state;
  }
};

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(playerReducer, initialState);
  const [drawerState, setDrawerStateInternal] = React.useState<PlayerDrawerState>('closed');
  const [showAuthDrawer, setShowAuthDrawer] = React.useState(false);
  const [showPaymentDrawer, setShowPaymentDrawer] = React.useState(false);
  const [pendingStory, setPendingStory] = React.useState<AudioStory | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const playStory = (story: AudioStory, storyList?: AudioStory[]) => {
    // If no storyList provided, use current queue or fetch from API
    const queue = storyList || state.queue;
    const index = queue.findIndex((s) => s.id === story.id);
    dispatch({ type: 'SET_CURRENT_STORY', payload: { story, queue, index } });
    dispatch({ type: 'SET_LOADING', payload: true });
    // Don't set playing state yet, let the audio events handle it
    setDrawerState('mini');
    // URL will be updated only when drawer state changes to 'expanded'
  };

  const updateUrlWithStory = useCallback(
    (storyId: string) => {
      // Only update URL with story ID when expanded player is open
      if (drawerState === 'expanded') {
        const params = new URLSearchParams(searchParams.toString());
        params.set('story', storyId);
        router.push(`/?${params.toString()}`, { scroll: false });
      }
    },
    [drawerState, searchParams, router]
  );

  const removeStoryFromUrl = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('story');
    const newUrl = params.toString() ? `/?${params.toString()}` : '/';
    router.push(newUrl, { scroll: false });
  };

  const cancelAndCloseAll = () => {
    // Close all drawers and clear URL
    setShowAuthDrawer(false);
    setShowPaymentDrawer(false);
    setPendingStory(null);
    setDrawerStateInternal('mini');
    removeStoryFromUrl();
  };

  const setDrawerState = (newState: PlayerDrawerState) => {
    const previousState = drawerState;
    setDrawerStateInternal(newState);

    // Handle URL updates based on state changes
    if (newState === 'expanded' && state.currentStory) {
      // Add story ID to URL when expanding to full screen
      const params = new URLSearchParams(searchParams.toString());
      params.set('story', state.currentStory.id);
      router.push(`/?${params.toString()}`, { scroll: false });
    } else if (previousState === 'expanded' && newState !== 'expanded') {
      // Remove story ID from URL when closing expanded player
      removeStoryFromUrl();
    }
  };

  // Helper function to load story data
  const loadStoryData = useCallback(async (storyId: string) => {
    try {
      const response = await storyApi.getStory(storyId);
      return response.data;
    } catch (error) {
      console.error('Error loading story:', error);
      return null;
    }
  }, []);

  // Helper function to load stories queue
  const loadStoriesQueue = useCallback(async () => {
    try {
      const storiesResponse = await storyApi.getStories();
      return storiesResponse.data.stories;
    } catch (error) {
      console.error('Failed to fetch stories for queue:', error);
      return [];
    }
  }, []);

  const playStoryById = async (
    storyId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _updateUrl: boolean = true,
    authContext?: { user: unknown; hasPurchased: (id: string) => boolean }
  ) => {
    try {
      // First try to find in current queue
      let story = state.queue.find((s) => s.id === storyId);

      if (!story) {
        // If not found in queue, fetch from API
        const fetchedStory = await loadStoryData(storyId);
        story = fetchedStory as AudioStory | undefined;
      }

      if (story) {
        // Add validation logic similar to handleStoryClick in StoryList
        if (story.paid && authContext) {
          // Check if user is authenticated
          if (!authContext.user) {
            setPendingStory(story);
            setShowAuthDrawer(true);
            return;
          }

          // Check if user has already purchased the story
          if (!authContext.hasPurchased(story.id)) {
            setPendingStory(story);
            setShowPaymentDrawer(true);
            return;
          }
        }

        // Play the story if it's free or user has purchased it
        // If we don't have a full queue, fetch stories from API
        let queue = state.queue;
        if (queue.length === 0) {
          queue = await loadStoriesQueue();
          if (queue.length === 0) {
            queue = [story]; // Use single story as queue
          }
        }

        const index = queue.findIndex((s) => s.id === story!.id);
        dispatch({ type: 'SET_CURRENT_STORY', payload: { story, queue, index } });
        dispatch({ type: 'SET_LOADING', payload: true });
        setDrawerState('expanded'); // Open expanded player directly for URL-based loading
        // URL will be updated automatically by setDrawerState
      } else {
        console.error('Story not found:', storyId);
      }
    } catch (error) {
      console.error('Error loading story:', error);
    }
  };

  const pauseStory = () => {
    dispatch({ type: 'SET_PLAYING', payload: false });
  };

  const resumeStory = () => {
    dispatch({ type: 'SET_PLAYING', payload: true });
  };

  // These functions are replaced by nextStoryWithUrl and previousStoryWithUrl

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

  // Update next/previous story functions to update URL
  const nextStoryWithUrl = useCallback(() => {
    if (state.queue.length > 0) {
      dispatch({ type: 'NEXT_STORY' });
      const nextIndex = state.currentIndex < state.queue.length - 1 ? state.currentIndex + 1 : 0;
      const nextStory = state.queue[nextIndex];
      if (nextStory) {
        updateUrlWithStory(nextStory.id);
      }
    }
  }, [state.currentIndex, state.queue, updateUrlWithStory]);

  const previousStoryWithUrl = useCallback(() => {
    if (state.queue.length > 0) {
      dispatch({ type: 'PREVIOUS_STORY' });
      const prevIndex = state.currentIndex > 0 ? state.currentIndex - 1 : state.queue.length - 1;
      const prevStory = state.queue[prevIndex];
      if (prevStory) {
        updateUrlWithStory(prevStory.id);
      }
    }
  }, [state.currentIndex, state.queue, updateUrlWithStory]);

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
      if (state.currentStory) {
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
        nextStoryWithUrl();
      }
    };

    const handleError = (event: Event) => {
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_BUFFERING', payload: false });
      dispatch({ type: 'SET_PLAYING', payload: false });
      console.error('Audio loading failed for story:', state.currentStory?.title, event);
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
  }, [state.isRepeated, state.currentStory, nextStoryWithUrl]);

  // Control audio playback based on state (for manual play/pause)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !state.currentStory || state.isLoading) return;

    if (state.isPlaying && audio.paused) {
      audio.play().catch(console.error);
    } else if (!state.isPlaying && !audio.paused) {
      audio.pause();
    }
  }, [state.isPlaying, state.currentStory, state.isLoading]);

  // Update audio source when story changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !state.currentStory) return;

    // Validate audio URL before setting
    const audioUrl = state.currentStory.audioUrl;
    if (!audioUrl || typeof audioUrl !== 'string') {
      console.warn('Invalid audio URL for story:', state.currentStory.title);
      return;
    }

    audio.src = audioUrl;
    audio.preload = 'auto'; // Enable preloading
    audio.load(); // Start loading the audio
  }, [state.currentStory]);

  // URL-based story loading is now handled by useUrlStoryLoader hook

  const value: AudioPlayerContextType = {
    state,
    drawerState,
    setDrawerState,
    playStory,
    pauseStory,
    resumeStory,
    nextStory: nextStoryWithUrl,
    previousStory: previousStoryWithUrl,
    seekTo,
    setVolume,
    toggleShuffle,
    toggleRepeat,
    audioRef,
    playStoryById,
    updateUrlWithStory,
    removeStoryFromUrl,
    cancelAndCloseAll,
    showAuthDrawer,
    setShowAuthDrawer,
    showPaymentDrawer,
    setShowPaymentDrawer,
    pendingStory,
    setPendingStory,
  };

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
      <audio ref={audioRef} preload="auto" crossOrigin="anonymous" />
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayer = (): AudioPlayerContextType => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
  }
  return context;
};
