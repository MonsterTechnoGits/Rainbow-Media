export interface Comment {
  id: string;
  trackId: string;
  userId: string;
  username: string;
  userAvatar?: string;
  text: string;
  timestamp: number; // Unix timestamp
  likes: number;
  isLiked: boolean; // Whether current user liked this comment
}

export interface TrackLike {
  trackId: string;
  isLiked: boolean;
  likeCount: number;
}

export interface CommentState {
  comments: { [trackId: string]: Comment[] };
  trackLikes: { [trackId: string]: TrackLike };
  isCommentsOpen: boolean;
  currentTrackId: string | null;
}

export interface User {
  id: string;
  username: string;
  avatar?: string;
}
