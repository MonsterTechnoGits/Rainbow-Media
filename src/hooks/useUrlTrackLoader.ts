'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';

export const useUrlTrackLoader = () => {
  const searchParams = useSearchParams();
  const { playTrackById, state } = useMusicPlayer();
  const authContext = useAuth();
  const lastProcessedTrackId = useRef<string | null>(null);

  useEffect(() => {
    // Don't process URL track loading while auth is still loading
    if (authContext.loading) {
      return;
    }

    const trackId = searchParams.get('track');

    // If there's no track ID in URL, reset the last processed ID and return
    if (!trackId) {
      lastProcessedTrackId.current = null;
      return;
    }

    // Only process if we haven't already processed this track ID
    // and either there's no current track or it's different
    if (
      trackId !== lastProcessedTrackId.current &&
      (!state.currentTrack || state.currentTrack.id !== trackId)
    ) {
      lastProcessedTrackId.current = trackId;

      // Pass auth context for validation
      playTrackById(trackId, false, {
        user: authContext.user,
        hasPurchased: authContext.hasPurchased,
      });
    }
  }, [
    searchParams,
    playTrackById,
    state.currentTrack,
    authContext.user,
    authContext.hasPurchased,
    authContext.loading,
  ]);
};
