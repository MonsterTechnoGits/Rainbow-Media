'use client';

import React, { createContext, useContext } from 'react';

import { useTrackLikes } from '@/hooks/useTrackLikes';
import { MusicTrack } from '@/types/music';

interface TrackLikesContextType {
  initializeLikes: (tracks: MusicTrack[]) => void;
  getTrackLike: (trackId: string) => {
    likeCount: number;
    isLiked: boolean;
    isUpdating: boolean;
  };
  toggleLike: (trackId: string) => Promise<void>;
}

const TrackLikesContext = createContext<TrackLikesContextType | undefined>(undefined);

export const TrackLikesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const trackLikes = useTrackLikes();

  return <TrackLikesContext.Provider value={trackLikes}>{children}</TrackLikesContext.Provider>;
};

export const useTrackLikesContext = (): TrackLikesContextType => {
  const context = useContext(TrackLikesContext);
  if (!context) {
    throw new Error('useTrackLikesContext must be used within a TrackLikesProvider');
  }
  return context;
};
