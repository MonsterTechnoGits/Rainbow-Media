'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { useAuth } from '@/contexts/AuthContext';

export const useUrlStoryLoader = () => {
  const searchParams = useSearchParams();
  const { playStoryById, state } = useAudioPlayer();
  const authContext = useAuth();
  const lastProcessedStoryId = useRef<string | null>(null);

  useEffect(() => {
    // Don't process URL story loading while auth is still loading
    if (authContext.loading) {
      return;
    }

    const storyId = searchParams.get('story');

    // If there's no story ID in URL, reset the last processed ID and return
    if (!storyId) {
      lastProcessedStoryId.current = null;
      return;
    }

    // Only process if we haven't already processed this story ID
    // and either there's no current story or it's different
    if (
      storyId !== lastProcessedStoryId.current &&
      (!state.currentStory || state.currentStory.id !== storyId)
    ) {
      lastProcessedStoryId.current = storyId;

      // Pass auth context for validation
      playStoryById(storyId, false, {
        user: authContext.user,
        hasPurchased: authContext.hasPurchased,
      });
    }
  }, [
    searchParams,
    playStoryById,
    state.currentStory,
    authContext.user,
    authContext.hasPurchased,
    authContext.loading,
  ]);
};
