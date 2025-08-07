'use client';

import { useState, useCallback } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { useApi } from '@/hooks/use-api-query-hook';
import { trackApi } from '@/services/api';
import { MusicTrack } from '@/types/music';

interface TrackLikeState {
  [trackId: string]: {
    likeCount: number;
    isLiked: boolean;
    isUpdating: boolean;
  };
}

/**
 * Efficient track likes hook that minimizes API calls
 * Uses optimistic updates and caches state locally
 */
export const useTrackLikes = () => {
  const [likeStates, setLikeStates] = useState<TrackLikeState>({});
  const { user } = useAuth();
  const { useApiMutation } = useApi();

  // Initialize like states from track data (called when tracks are loaded)
  const initializeLikes = useCallback((tracks: MusicTrack[]) => {
    const newStates: TrackLikeState = {};
    tracks.forEach((track) => {
      newStates[track.id] = {
        likeCount: track.likeCount,
        isLiked: track.isLiked || false,
        isUpdating: false,
      };
    });
    setLikeStates(newStates);
  }, []);

  // Get like state for a specific track
  const getTrackLike = useCallback(
    (trackId: string) => {
      return (
        likeStates[trackId] || {
          likeCount: 0,
          isLiked: false,
          isUpdating: false,
        }
      );
    },
    [likeStates]
  );

  const likeTrackMutation = useApiMutation({
    mutationFn: (variables: unknown) => {
      const { trackId, userId } = variables as { trackId: string; userId: string };
      return trackApi.toggleTrackLike(trackId, userId);
    },
  });

  // Toggle like with optimistic update
  const toggleLike = useCallback(
    async (trackId: string) => {
      if (!user) return;

      const currentState = likeStates[trackId];
      if (!currentState || currentState.isUpdating) return;

      // Optimistic update
      setLikeStates((prev) => ({
        ...prev,
        [trackId]: {
          likeCount: currentState.isLiked
            ? Math.max(0, currentState.likeCount - 1)
            : currentState.likeCount + 1,
          isLiked: !currentState.isLiked,
          isUpdating: true,
        },
      }));

      try {
        const response = await likeTrackMutation.mutateAsync({ trackId, userId: user.uid });

        const responseData = response.data as {
          trackId: string;
          likeCount: number;
          isLiked: boolean;
        };

        // Update with server response
        setLikeStates((prev) => ({
          ...prev,
          [trackId]: {
            likeCount: responseData.likeCount,
            isLiked: responseData.isLiked,
            isUpdating: false,
          },
        }));
      } catch (error) {
        console.error('Failed to toggle track like:', error);
        // Revert optimistic update on error
        setLikeStates((prev) => ({
          ...prev,
          [trackId]: {
            ...currentState,
            isUpdating: false,
          },
        }));
      }
    },
    [user, likeStates, likeTrackMutation]
  );

  return {
    initializeLikes,
    getTrackLike,
    toggleLike,
  };
};
