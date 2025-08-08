'use client';

import { useState, useCallback, useOptimistic, useTransition } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { useApi } from '@/hooks/use-api-query-hook';
import { storyApi } from '@/services/api';
import { AudioStory } from '@/types/audio-story';

interface StoryLikeState {
  [storyId: string]: {
    likeCount: number;
    isLiked: boolean;
  };
}

type OptimisticAction = {
  type: 'toggle';
  storyId: string;
};

/**
 * Efficient story likes hook that minimizes API calls
 * Uses React 19 optimistic updates for instant UI feedback
 */
export const useStoryLikes = () => {
  const [likeStates, setLikeStates] = useState<StoryLikeState>({});
  const [optimisticLikes, updateOptimisticLikes] = useOptimistic(
    likeStates,
    (state: StoryLikeState, action: OptimisticAction) => {
      if (action.type === 'toggle') {
        const current = state[action.storyId];
        if (!current) return state;

        return {
          ...state,
          [action.storyId]: {
            likeCount: current.isLiked ? Math.max(0, current.likeCount - 1) : current.likeCount + 1,
            isLiked: !current.isLiked,
          },
        };
      }
      return state;
    }
  );
  const [isPending, startTransition] = useTransition();
  const { user } = useAuth();
  const { useApiMutation } = useApi();

  // Initialize like states from story data (called when stories are loaded)
  const initializeLikes = useCallback((stories: AudioStory[]) => {
    const newStates: StoryLikeState = {};
    stories.forEach((story) => {
      newStates[story.id] = {
        likeCount: story.likeCount,
        isLiked: story.isLiked || false,
      };
    });
    setLikeStates(newStates);
  }, []);

  // Get like state for a specific story (uses optimistic state)
  const getStoryLike = useCallback(
    (storyId: string) => {
      return (
        optimisticLikes[storyId] || {
          likeCount: 0,
          isLiked: false,
        }
      );
    },
    [optimisticLikes]
  );

  const likeStoryMutation = useApiMutation({
    mutationFn: (variables: unknown) => {
      const { storyId, userId, userName } = variables as {
        storyId: string;
        userId: string;
        userName: string;
      };
      return storyApi.toggleStoryLike(storyId, userId, userName);
    },
  });

  // Toggle like with React 19 optimistic updates
  const toggleLike = useCallback(
    async (storyId: string) => {
      if (!user) return;

      const currentState = optimisticLikes[storyId];
      if (!currentState) return;

      startTransition(async () => {
        // Apply optimistic update immediately
        updateOptimisticLikes({ type: 'toggle', storyId });

        try {
          const response = await likeStoryMutation.mutateAsync({
            storyId,
            userId: user.uid,
            userName: user.displayName || 'Anonymous',
          });

          const responseData = response.data as {
            storyId: string;
            likeCount: number;
            isLiked: boolean;
          };

          // Update actual state with server response
          setLikeStates((prev) => ({
            ...prev,
            [storyId]: {
              likeCount: responseData.likeCount,
              isLiked: responseData.isLiked,
            },
          }));
        } catch (error) {
          console.error('Failed to toggle story like:', error);
          // React will automatically revert the optimistic update on error
          // but we should also reset our base state
          setLikeStates((prev) => ({
            ...prev,
            [storyId]: currentState,
          }));
        }
      });
    },
    [user, optimisticLikes, updateOptimisticLikes, startTransition, likeStoryMutation]
  );

  return {
    initializeLikes,
    getStoryLike,
    toggleLike,
    isPending, // Expose pending state for UI feedback
  };
};
