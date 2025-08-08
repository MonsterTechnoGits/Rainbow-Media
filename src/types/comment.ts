export interface Comment {
  id: string;
  storyId: string;
  userId: string;
  username: string;
  userAvatar?: string;
  text: string;
  timestamp: number; // Unix timestamp
  likes: number;
  isLiked: boolean; // Whether current user liked this comment
}

export interface StoryLike {
  storyId: string;
  isLiked: boolean;
  likeCount: number;
}

export interface CommentState {
  comments: { [storyId: string]: Comment[] };
  storyLikes: { [storyId: string]: StoryLike };
  isCommentsOpen: boolean;
  currentStoryId: string | null;
}

export interface User {
  id: string;
  username: string;
  avatar?: string;
}
