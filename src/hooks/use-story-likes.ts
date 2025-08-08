'use client';

import { useState, useCallback } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { useApi } from '@/hooks/use-api-query-hook';
import { storyApi } from '@/services/api';
import { AudioStory } from '@/types/audio-story';

interface StoryLikeState {
  [storyId: string]: {
    likeCount: number;
    isLiked: boolean;
    isUpdating: boolean;
  };
}

/**
 * Efficient story likes hook that minimizes API calls
 * Uses optimistic updates and caches state locally
 */
export const useStoryLikes = () => {
  const [likeStates, setLikeStates] = useState<StoryLikeState>({});
  const { user } = useAuth();
  const { useApiMutation } = useApi();

  // Initialize like states from story data (called when stories are loaded)
  const initializeLikes = useCallback((stories: AudioStory[]) => {
    const newStates: StoryLikeState = {};
    stories.forEach((story) => {
      newStates[story.id] = {
        likeCount: story.likeCount,
        isLiked: story.isLiked || false,
        isUpdating: false,
      };
    });
    setLikeStates(newStates);
  }, []);

  // Get like state for a specific story
  const getStoryLike = useCallback(
    (storyId: string) => {
      return (
        likeStates[storyId] || {
          likeCount: 0,
          isLiked: false,
          isUpdating: false,
        }
      );
    },
    [likeStates]
  );

  const likeStoryMutation = useApiMutation({
    mutationFn: (variables: unknown) => {
      const { storyId, userId } = variables as { storyId: string; userId: string };
      return storyApi.toggleStoryLike(storyId, userId);
    },
  });

  // Toggle like with optimistic update
  const toggleLike = useCallback(
    async (storyId: string) => {
      if (!user) return;

      const currentState = likeStates[storyId];
      if (!currentState || currentState.isUpdating) return;

      // Optimistic update
      setLikeStates((prev) => ({
        ...prev,
        [storyId]: {
          likeCount: currentState.isLiked
            ? Math.max(0, currentState.likeCount - 1)
            : currentState.likeCount + 1,
          isLiked: !currentState.isLiked,
          isUpdating: true,
        },
      }));

      try {
        const response = await likeStoryMutation.mutateAsync({ storyId, userId: user.uid });

        const responseData = response.data as {
          storyId: string;
          likeCount: number;
          isLiked: boolean;
        };

        // Update with server response
        setLikeStates((prev) => ({
          ...prev,
          [storyId]: {
            likeCount: responseData.likeCount,
            isLiked: responseData.isLiked,
            isUpdating: false,
          },
        }));
      } catch (error) {
        console.error('Failed to toggle story like:', error);
        // Revert optimistic update on error
        setLikeStates((prev) => ({
          ...prev,
          [storyId]: {
            ...currentState,
            isUpdating: false,
          },
        }));
      }
    },
    [user, likeStates, likeStoryMutation]
  );

  return {
    initializeLikes,
    getStoryLike,
    toggleLike,
  };
};
