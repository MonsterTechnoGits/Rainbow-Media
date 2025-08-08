'use client';

import React, { createContext, useContext, useReducer, useCallback } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { useApi } from '@/hooks/use-api-query-hook';
import { storyApi } from '@/services/api';
import { Comment, CommentState, StoryLike } from '@/types/comment';

interface CommentContextType {
  state: CommentState;
  openComments: (storyId: string, storyData?: { likeCount: number; isLiked?: boolean }) => void;
  closeComments: () => void;
  addComment: (storyId: string, text: string) => Promise<void>;
  likeComment: (commentId: string, storyId: string) => void;
  likeStory: (storyId: string) => Promise<void>;
  getStoryComments: (storyId: string) => Comment[];
  getStoryLike: (storyId: string) => StoryLike;
  loadStoryData: (
    storyId: string,
    storyData?: { likeCount: number; isLiked?: boolean }
  ) => Promise<void>;
}

type CommentAction =
  | { type: 'OPEN_COMMENTS'; payload: { storyId: string } }
  | { type: 'CLOSE_COMMENTS' }
  | { type: 'SET_COMMENTS'; payload: { storyId: string; comments: Comment[] } }
  | { type: 'ADD_COMMENT'; payload: { storyId: string; comment: Comment } }
  | { type: 'LIKE_COMMENT'; payload: { commentId: string; storyId: string } }
  | { type: 'SET_STORY_LIKE'; payload: { storyId: string; like: StoryLike } }
  | { type: 'LIKE_STORY'; payload: { storyId: string } };

const initialState: CommentState = {
  comments: {},
  storyLikes: {},
  isCommentsOpen: false,
  currentStoryId: null,
};

const commentReducer = (state: CommentState, action: CommentAction): CommentState => {
  switch (action.type) {
    case 'OPEN_COMMENTS':
      return {
        ...state,
        isCommentsOpen: true,
        currentStoryId: action.payload.storyId,
      };

    case 'CLOSE_COMMENTS':
      return {
        ...state,
        isCommentsOpen: false,
        currentStoryId: null,
      };

    case 'SET_COMMENTS':
      return {
        ...state,
        comments: {
          ...state.comments,
          [action.payload.storyId]: action.payload.comments,
        },
      };

    case 'SET_STORY_LIKE':
      return {
        ...state,
        storyLikes: {
          ...state.storyLikes,
          [action.payload.storyId]: action.payload.like,
        },
      };

    case 'ADD_COMMENT': {
      const { storyId, comment } = action.payload;
      const existingComments = state.comments[storyId] || [];

      return {
        ...state,
        comments: {
          ...state.comments,
          [storyId]: [comment, ...existingComments],
        },
      };
    }

    case 'LIKE_COMMENT': {
      const { commentId, storyId } = action.payload;
      const storyComments = state.comments[storyId] || [];

      return {
        ...state,
        comments: {
          ...state.comments,
          [storyId]: storyComments.map((comment) =>
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

    case 'LIKE_STORY': {
      const { storyId } = action.payload;
      const currentLike = state.storyLikes[storyId] || { storyId, likeCount: 0, isLiked: false };

      return {
        ...state,
        storyLikes: {
          ...state.storyLikes,
          [storyId]: {
            storyId,
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

  const loadStoryData = useCallback(
    async (storyId: string, storyData?: { likeCount: number; isLiked?: boolean }) => {
      try {
        // Load comments from Firestore API
        let comments: Comment[] = [];
        try {
          const commentsResponse = await storyApi.getStoryComments(storyId);
          comments = commentsResponse.data.comments.map((apiComment) => ({
            id: apiComment.id,
            storyId,
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

        dispatch({ type: 'SET_COMMENTS', payload: { storyId, comments } });

        // Use provided story data for likes if available, otherwise fetch from API
        if (storyData) {
          const storyLike: StoryLike = {
            storyId,
            likeCount: storyData.likeCount,
            isLiked: storyData.isLiked || false,
          };
          dispatch({ type: 'SET_STORY_LIKE', payload: { storyId, like: storyLike } });
        } else {
          // For now, set default like data to avoid API calls
          const storyLike: StoryLike = {
            storyId,
            likeCount: 0,
            isLiked: false,
          };
          dispatch({ type: 'SET_STORY_LIKE', payload: { storyId, like: storyLike } });
        }
      } catch (error) {
        console.error('Failed to load story data:', error);
        // Set empty defaults on error
        dispatch({ type: 'SET_COMMENTS', payload: { storyId, comments: [] } });
        dispatch({
          type: 'SET_STORY_LIKE',
          payload: {
            storyId,
            like: {
              storyId,
              likeCount: storyData?.likeCount || 0,
              isLiked: storyData?.isLiked || false,
            },
          },
        });
      }
    },
    [user?.uid]
  );

  const openComments = useCallback(
    (storyId: string, storyData?: { likeCount: number; isLiked?: boolean }) => {
      dispatch({ type: 'OPEN_COMMENTS', payload: { storyId } });
      // Only load comments, use provided story data for likes if available
      loadStoryData(storyId, storyData);
    },
    [loadStoryData]
  );

  const closeComments = useCallback(() => {
    dispatch({ type: 'CLOSE_COMMENTS' });
  }, []);

  const addCommentMutation = useApiMutation({
    mutationFn: (variables: unknown) => {
      const { storyId, comment } = variables as {
        storyId: string;
        comment: {
          userId: string;
          userName: string;
          userAvatar?: string;
          content: string;
        };
      };
      return storyApi.addStoryComment(storyId, comment);
    },
  });

  const addComment = useCallback(
    async (storyId: string, text: string) => {
      if (!user) return;

      try {
        const commentData = {
          userId: user.uid,
          userName: user.displayName || 'Anonymous User',
          userAvatar: user.photoURL,
          content: text,
        };

        const response = await addCommentMutation.mutateAsync({ storyId, comment: commentData });

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
          storyId,
          userId: responseData.comment.userId,
          username: responseData.comment.userName,
          userAvatar: responseData.comment.userAvatar,
          text: responseData.comment.content,
          timestamp: responseData.comment.timestamp,
          likes: responseData.comment.likes,
          isLiked: false,
        };

        dispatch({ type: 'ADD_COMMENT', payload: { storyId, comment: newComment } });
      } catch (error) {
        console.error('Failed to add comment:', error);
      }
    },
    [user, addCommentMutation]
  );

  const likeComment = useCallback((commentId: string, storyId: string) => {
    dispatch({ type: 'LIKE_COMMENT', payload: { commentId, storyId } });
  }, []);

  const likeStoryMutation = useApiMutation({
    mutationFn: (variables: unknown) => {
      const { storyId, userId } = variables as { storyId: string; userId: string };
      return storyApi.toggleStoryLike(storyId, userId);
    },
  });

  const likeStory = useCallback(
    async (storyId: string) => {
      if (!user) return;

      try {
        const response = await likeStoryMutation.mutateAsync({ storyId, userId: user.uid });

        const responseData = response.data as {
          storyId: string;
          likeCount: number;
          isLiked: boolean;
        };

        const storyLike: StoryLike = {
          storyId,
          likeCount: responseData.likeCount,
          isLiked: responseData.isLiked,
        };

        dispatch({ type: 'SET_STORY_LIKE', payload: { storyId, like: storyLike } });
      } catch (error) {
        console.error('Failed to toggle story like:', error);
        // Fallback to optimistic update
        dispatch({ type: 'LIKE_STORY', payload: { storyId } });
      }
    },
    [user, likeStoryMutation]
  );

  const getStoryComments = useCallback(
    (storyId: string): Comment[] => {
      return state.comments[storyId] || [];
    },
    [state.comments]
  );

  const getStoryLike = useCallback(
    (storyId: string): StoryLike => {
      return (
        state.storyLikes[storyId] || {
          storyId,
          likeCount: 0,
          isLiked: false,
        }
      );
    },
    [state.storyLikes]
  );

  const value: CommentContextType = {
    state,
    openComments,
    closeComments,
    addComment,
    likeComment,
    likeStory,
    getStoryComments,
    getStoryLike,
    loadStoryData,
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
