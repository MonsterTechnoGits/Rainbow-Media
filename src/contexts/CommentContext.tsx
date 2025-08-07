'use client';

import React, { createContext, useContext, useReducer, useCallback } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { useApi } from '@/hooks/use-api-query-hook';
import { trackApi } from '@/services/api';
import { Comment, CommentState, TrackLike } from '@/types/comment';

interface CommentContextType {
  state: CommentState;
  openComments: (trackId: string, trackData?: { likeCount: number; isLiked?: boolean }) => void;
  closeComments: () => void;
  addComment: (trackId: string, text: string) => Promise<void>;
  likeComment: (commentId: string, trackId: string) => void;
  likeTrack: (trackId: string) => Promise<void>;
  getTrackComments: (trackId: string) => Comment[];
  getTrackLike: (trackId: string) => TrackLike;
  loadTrackData: (
    trackId: string,
    trackData?: { likeCount: number; isLiked?: boolean }
  ) => Promise<void>;
}

type CommentAction =
  | { type: 'OPEN_COMMENTS'; payload: { trackId: string } }
  | { type: 'CLOSE_COMMENTS' }
  | { type: 'SET_COMMENTS'; payload: { trackId: string; comments: Comment[] } }
  | { type: 'ADD_COMMENT'; payload: { trackId: string; comment: Comment } }
  | { type: 'LIKE_COMMENT'; payload: { commentId: string; trackId: string } }
  | { type: 'SET_TRACK_LIKE'; payload: { trackId: string; like: TrackLike } }
  | { type: 'LIKE_TRACK'; payload: { trackId: string } };

const initialState: CommentState = {
  comments: {},
  trackLikes: {},
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

    case 'SET_COMMENTS':
      return {
        ...state,
        comments: {
          ...state.comments,
          [action.payload.trackId]: action.payload.comments,
        },
      };

    case 'SET_TRACK_LIKE':
      return {
        ...state,
        trackLikes: {
          ...state.trackLikes,
          [action.payload.trackId]: action.payload.like,
        },
      };

    case 'ADD_COMMENT': {
      const { trackId, comment } = action.payload;
      const existingComments = state.comments[trackId] || [];

      return {
        ...state,
        comments: {
          ...state.comments,
          [trackId]: [comment, ...existingComments],
        },
      };
    }

    case 'LIKE_COMMENT': {
      const { commentId, trackId } = action.payload;
      const trackComments = state.comments[trackId] || [];

      return {
        ...state,
        comments: {
          ...state.comments,
          [trackId]: trackComments.map((comment) =>
            comment.id === commentId
              ? {
                  ...comment,
                  isLiked: !comment.isLiked,
                  likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
                }
              : comment
          ),
        },
      };
    }

    case 'LIKE_TRACK': {
      const { trackId } = action.payload;
      const currentLike = state.trackLikes[trackId] || { trackId, likeCount: 0, isLiked: false };

      return {
        ...state,
        trackLikes: {
          ...state.trackLikes,
          [trackId]: {
            trackId,
            likeCount: currentLike.isLiked
              ? Math.max(0, currentLike.likeCount - 1)
              : currentLike.likeCount + 1,
            isLiked: !currentLike.isLiked,
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
  const { user } = useAuth();
  const { useApiMutation } = useApi();

  const loadTrackData = useCallback(
    async (trackId: string, trackData?: { likeCount: number; isLiked?: boolean }) => {
      try {
        // Load comments from Firestore API
        let comments: Comment[] = [];
        try {
          const commentsResponse = await trackApi.getTrackComments(trackId);
          comments = commentsResponse.data.comments.map((apiComment) => ({
            id: apiComment.id,
            trackId,
            userId: apiComment.userId,
            username: apiComment.userName,
            userAvatar: apiComment.userAvatar,
            text: apiComment.content,
            timestamp: apiComment.timestamp,
            likes: apiComment.likes,
            isLiked: false, // We don't track individual comment likes for now
          }));
        } catch (error) {
          console.error('Failed to load comments:', error);
          comments = []; // Fallback to empty comments
        }

        dispatch({ type: 'SET_COMMENTS', payload: { trackId, comments } });

        // Use provided track data for likes if available, otherwise fetch from API
        if (trackData) {
          const trackLike: TrackLike = {
            trackId,
            likeCount: trackData.likeCount,
            isLiked: trackData.isLiked || false,
          };
          dispatch({ type: 'SET_TRACK_LIKE', payload: { trackId, like: trackLike } });
        } else {
          // For now, set default like data to avoid API calls
          const trackLike: TrackLike = {
            trackId,
            likeCount: 0,
            isLiked: false,
          };
          dispatch({ type: 'SET_TRACK_LIKE', payload: { trackId, like: trackLike } });
        }
      } catch (error) {
        console.error('Failed to load track data:', error);
        // Set empty defaults on error
        dispatch({ type: 'SET_COMMENTS', payload: { trackId, comments: [] } });
        dispatch({
          type: 'SET_TRACK_LIKE',
          payload: {
            trackId,
            like: {
              trackId,
              likeCount: trackData?.likeCount || 0,
              isLiked: trackData?.isLiked || false,
            },
          },
        });
      }
    },
    [user?.uid]
  );

  const openComments = useCallback(
    (trackId: string, trackData?: { likeCount: number; isLiked?: boolean }) => {
      dispatch({ type: 'OPEN_COMMENTS', payload: { trackId } });
      // Only load comments, use provided track data for likes if available
      loadTrackData(trackId, trackData);
    },
    [loadTrackData]
  );

  const closeComments = useCallback(() => {
    dispatch({ type: 'CLOSE_COMMENTS' });
  }, []);

  const addCommentMutation = useApiMutation({
    mutationFn: (variables: unknown) => {
      const { trackId, comment } = variables as {
        trackId: string;
        comment: {
          userId: string;
          userName: string;
          userAvatar?: string;
          content: string;
        };
      };
      return trackApi.addTrackComment(trackId, comment);
    },
  });

  const addComment = useCallback(
    async (trackId: string, text: string) => {
      if (!user) return;

      try {
        const commentData = {
          userId: user.uid,
          userName: user.displayName || 'Anonymous User',
          userAvatar: user.photoURL,
          content: text,
        };

        const response = await addCommentMutation.mutateAsync({ trackId, comment: commentData });

        // Transform API comment to our format
        const responseData = response.data as {
          success: boolean;
          comment: {
            id: string;
            userId: string;
            userName: string;
            userAvatar: string;
            content: string;
            timestamp: number;
            likes: number;
            replies: unknown[];
          };
          totalComments: number;
        };

        const newComment: Comment = {
          id: responseData.comment.id,
          trackId,
          userId: responseData.comment.userId,
          username: responseData.comment.userName,
          userAvatar: responseData.comment.userAvatar,
          text: responseData.comment.content,
          timestamp: responseData.comment.timestamp,
          likes: responseData.comment.likes,
          isLiked: false,
        };

        dispatch({ type: 'ADD_COMMENT', payload: { trackId, comment: newComment } });
      } catch (error) {
        console.error('Failed to add comment:', error);
      }
    },
    [user, addCommentMutation]
  );

  const likeComment = useCallback((commentId: string, trackId: string) => {
    dispatch({ type: 'LIKE_COMMENT', payload: { commentId, trackId } });
  }, []);

  const likeTrackMutation = useApiMutation({
    mutationFn: (variables: unknown) => {
      const { trackId, userId } = variables as { trackId: string; userId: string };
      return trackApi.toggleTrackLike(trackId, userId);
    },
  });

  const likeTrack = useCallback(
    async (trackId: string) => {
      if (!user) return;

      try {
        const response = await likeTrackMutation.mutateAsync({ trackId, userId: user.uid });

        const responseData = response.data as {
          trackId: string;
          likeCount: number;
          isLiked: boolean;
        };

        const trackLike: TrackLike = {
          trackId,
          likeCount: responseData.likeCount,
          isLiked: responseData.isLiked,
        };

        dispatch({ type: 'SET_TRACK_LIKE', payload: { trackId, like: trackLike } });
      } catch (error) {
        console.error('Failed to toggle track like:', error);
        // Fallback to optimistic update
        dispatch({ type: 'LIKE_TRACK', payload: { trackId } });
      }
    },
    [user, likeTrackMutation]
  );

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
          likeCount: 0,
          isLiked: false,
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
    loadTrackData,
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
