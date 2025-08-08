'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useOptimistic,
  useTransition,
} from 'react';

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
  isPending: boolean; // Add pending state for transitions
}

type CommentAction =
  | { type: 'OPEN_COMMENTS'; payload: { storyId: string } }
  | { type: 'CLOSE_COMMENTS' }
  | { type: 'SET_COMMENTS'; payload: { storyId: string; comments: Comment[] } }
  | { type: 'ADD_COMMENT'; payload: { storyId: string; comment: Comment } }
  | { type: 'LIKE_COMMENT'; payload: { commentId: string; storyId: string } }
  | { type: 'SET_STORY_LIKE'; payload: { storyId: string; like: StoryLike } }
  | { type: 'LIKE_STORY'; payload: { storyId: string } };

type OptimisticCommentAction =
  | { type: 'ADD_COMMENT'; storyId: string; comment: Comment }
  | { type: 'LIKE_STORY'; storyId: string };

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

const optimisticReducer = (state: CommentState, action: OptimisticCommentAction): CommentState => {
  switch (action.type) {
    case 'ADD_COMMENT': {
      const existingComments = state.comments[action.storyId] || [];
      return {
        ...state,
        comments: {
          ...state.comments,
          [action.storyId]: [action.comment, ...existingComments],
        },
      };
    }
    case 'LIKE_STORY': {
      const currentLike = state.storyLikes[action.storyId] || {
        storyId: action.storyId,
        likeCount: 0,
        isLiked: false,
      };
      return {
        ...state,
        storyLikes: {
          ...state.storyLikes,
          [action.storyId]: {
            storyId: action.storyId,
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

export const CommentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(commentReducer, initialState);
  const [optimisticState, updateOptimisticState] = useOptimistic(state, optimisticReducer);
  const [isPending, startTransition] = useTransition();
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
        } else if (user?.uid) {
          // Get like status from API
          try {
            const likeResponse = await storyApi.getStoryLikes(storyId, user.uid);
            const storyLike: StoryLike = {
              storyId,
              likeCount: likeResponse.data.likeCount,
              isLiked: likeResponse.data.isLiked,
            };
            dispatch({ type: 'SET_STORY_LIKE', payload: { storyId, like: storyLike } });
          } catch (error) {
            console.error('Failed to load story likes:', error);
            const storyLike: StoryLike = {
              storyId,
              likeCount: 0,
              isLiked: false,
            };
            dispatch({ type: 'SET_STORY_LIKE', payload: { storyId, like: storyLike } });
          }
        } else {
          // No user, set default like data
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

      // Create optimistic comment
      const optimisticComment: Comment = {
        id: `temp-${Date.now()}`,
        storyId,
        userId: user.uid,
        username: user.displayName || user.email?.split('@')[0] || 'Anonymous',
        userAvatar: user.photoURL || '',
        text,
        timestamp: Date.now(),
        likes: 0,
        isLiked: false,
      };

      startTransition(async () => {
        // Apply optimistic update immediately
        updateOptimisticState({ type: 'ADD_COMMENT', storyId, comment: optimisticComment });

        try {
          const commentData = {
            userId: user.uid,
            userName: optimisticComment.username,
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

          const serverComment: Comment = {
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

          // Update actual state with server response
          dispatch({ type: 'ADD_COMMENT', payload: { storyId, comment: serverComment } });
        } catch (error) {
          console.error('Failed to add comment:', error);
          // React will automatically revert the optimistic update on error
        }
      });
    },
    [user, addCommentMutation, updateOptimisticState, startTransition]
  );

  const likeComment = useCallback((commentId: string, storyId: string) => {
    dispatch({ type: 'LIKE_COMMENT', payload: { commentId, storyId } });
  }, []);

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

  const likeStory = useCallback(
    async (storyId: string) => {
      if (!user) return;

      startTransition(async () => {
        // Apply optimistic update immediately
        updateOptimisticState({ type: 'LIKE_STORY', storyId });

        try {
          const response = await likeStoryMutation.mutateAsync({
            storyId,
            userId: user.uid,
            userName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
          });

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

          // Update actual state with server response
          dispatch({ type: 'SET_STORY_LIKE', payload: { storyId, like: storyLike } });
        } catch (error) {
          console.error('Failed to toggle story like:', error);
          // React will automatically revert the optimistic update on error
        }
      });
    },
    [user, likeStoryMutation, updateOptimisticState, startTransition]
  );

  const getStoryComments = useCallback(
    (storyId: string): Comment[] => {
      return optimisticState.comments[storyId] || [];
    },
    [optimisticState.comments]
  );

  const getStoryLike = useCallback(
    (storyId: string): StoryLike => {
      return (
        optimisticState.storyLikes[storyId] || {
          storyId,
          likeCount: 0,
          isLiked: false,
        }
      );
    },
    [optimisticState.storyLikes]
  );

  const value: CommentContextType = {
    state: optimisticState, // Use optimistic state for UI
    openComments,
    closeComments,
    addComment,
    likeComment,
    likeStory,
    getStoryComments,
    getStoryLike,
    loadStoryData,
    isPending,
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
