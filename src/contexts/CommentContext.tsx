'use client';

import React, { createContext, useContext, useReducer, useCallback } from 'react';

import { mockComments, mockTrackLikes, currentUser } from '@/data/commentData';
import { Comment, CommentState, TrackLike } from '@/types/comment';

interface CommentContextType {
  state: CommentState;
  openComments: (trackId: string) => void;
  closeComments: () => void;
  addComment: (trackId: string, text: string) => void;
  likeComment: (commentId: string, trackId: string) => void;
  likeTrack: (trackId: string) => void;
  getTrackComments: (trackId: string) => Comment[];
  getTrackLike: (trackId: string) => TrackLike;
}

type CommentAction =
  | { type: 'OPEN_COMMENTS'; payload: { trackId: string } }
  | { type: 'CLOSE_COMMENTS' }
  | { type: 'ADD_COMMENT'; payload: { trackId: string; comment: Comment } }
  | { type: 'LIKE_COMMENT'; payload: { commentId: string; trackId: string } }
  | { type: 'LIKE_TRACK'; payload: { trackId: string } };

const initialState: CommentState = {
  comments: mockComments,
  trackLikes: mockTrackLikes,
  isCommentsOpen: false,
  currentTrackId: null,
};

const commentReducer = (state: CommentState, action: CommentAction): CommentState => {
  switch (action.type) {
    case 'OPEN_COMMENTS':
      return {
        ...state,
        isCommentsOpen: true,
        currentTrackId: action.payload.trackId,
      };

    case 'CLOSE_COMMENTS':
      return {
        ...state,
        isCommentsOpen: false,
        currentTrackId: null,
      };

    case 'ADD_COMMENT': {
      const { trackId, comment } = action.payload;
      return {
        ...state,
        comments: {
          ...state.comments,
          [trackId]: [comment, ...(state.comments[trackId] || [])],
        },
      };
    }

    case 'LIKE_COMMENT': {
      const { commentId, trackId } = action.payload;
      const trackComments = state.comments[trackId] || [];
      const updatedComments = trackComments.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              isLiked: !comment.isLiked,
              likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
            }
          : comment
      );

      return {
        ...state,
        comments: {
          ...state.comments,
          [trackId]: updatedComments,
        },
      };
    }

    case 'LIKE_TRACK': {
      const { trackId } = action.payload;
      const currentLike = state.trackLikes[trackId] || {
        trackId,
        isLiked: false,
        likeCount: 0,
      };

      return {
        ...state,
        trackLikes: {
          ...state.trackLikes,
          [trackId]: {
            ...currentLike,
            isLiked: !currentLike.isLiked,
            likeCount: currentLike.isLiked ? currentLike.likeCount - 1 : currentLike.likeCount + 1,
          },
        },
      };
    }

    default:
      return state;
  }
};

const CommentContext = createContext<CommentContextType | undefined>(undefined);

export const CommentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(commentReducer, initialState);

  const openComments = useCallback((trackId: string) => {
    dispatch({ type: 'OPEN_COMMENTS', payload: { trackId } });
  }, []);

  const closeComments = useCallback(() => {
    dispatch({ type: 'CLOSE_COMMENTS' });
  }, []);

  const addComment = useCallback((trackId: string, text: string) => {
    const newComment: Comment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      trackId,
      userId: currentUser.id,
      username: currentUser.username,
      userAvatar: currentUser.avatar,
      text: text.trim(),
      timestamp: Date.now(),
      likes: 0,
      isLiked: false,
    };

    dispatch({ type: 'ADD_COMMENT', payload: { trackId, comment: newComment } });
  }, []);

  const likeComment = useCallback((commentId: string, trackId: string) => {
    dispatch({ type: 'LIKE_COMMENT', payload: { commentId, trackId } });
  }, []);

  const likeTrack = useCallback((trackId: string) => {
    dispatch({ type: 'LIKE_TRACK', payload: { trackId } });
  }, []);

  const getTrackComments = useCallback(
    (trackId: string): Comment[] => {
      return state.comments[trackId] || [];
    },
    [state.comments]
  );

  const getTrackLike = useCallback(
    (trackId: string): TrackLike => {
      return (
        state.trackLikes[trackId] || {
          trackId,
          isLiked: false,
          likeCount: 0,
        }
      );
    },
    [state.trackLikes]
  );

  const value: CommentContextType = {
    state,
    openComments,
    closeComments,
    addComment,
    likeComment,
    likeTrack,
    getTrackComments,
    getTrackLike,
  };

  return <CommentContext.Provider value={value}>{children}</CommentContext.Provider>;
};

export const useComments = (): CommentContextType => {
  const context = useContext(CommentContext);
  if (!context) {
    throw new Error('useComments must be used within a CommentProvider');
  }
  return context;
};
