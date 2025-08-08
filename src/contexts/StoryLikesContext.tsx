'use client';

import React, { createContext, useContext } from 'react';

import { useStoryLikes } from '@/hooks/use-story-likes';
import { AudioStory } from '@/types/audio-story';

interface StoryLikesContextType {
  initializeLikes: (stories: AudioStory[]) => void;
  getStoryLike: (storyId: string) => {
    likeCount: number;
    isLiked: boolean;
    isUpdating: boolean;
  };
  toggleLike: (storyId: string) => Promise<void>;
}

const StoryLikesContext = createContext<StoryLikesContextType | undefined>(undefined);

export const StoryLikesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const storyLikes = useStoryLikes();

  return <StoryLikesContext.Provider value={storyLikes}>{children}</StoryLikesContext.Provider>;
};

export const useStoryLikesContext = (): StoryLikesContextType => {
  const context = useContext(StoryLikesContext);
  if (!context) {
    throw new Error('useStoryLikesContext must be used within a StoryLikesProvider');
  }
  return context;
};
