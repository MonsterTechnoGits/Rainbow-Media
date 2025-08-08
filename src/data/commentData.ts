import { Comment, StoryLike, User } from '@/types/comment';

// Mock current user
export const currentUser: User = {
  id: 'user_1',
  username: 'You',
  avatar: undefined, // Will use default avatar
};

// Mock users for comments
export const mockUsers: User[] = [
  {
    id: 'user_2',
    username: 'StoryLover2024',
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
  {
    id: 'user_3',
    username: 'ThrillSeeker',
    avatar: 'https://i.pravatar.cc/150?img=2',
  },
  {
    id: 'user_4',
    username: 'MysteryFan',
    avatar: 'https://i.pravatar.cc/150?img=3',
  },
  {
    id: 'user_5',
    username: 'AudioDrama',
    avatar: 'https://i.pravatar.cc/150?img=4',
  },
  {
    id: 'user_6',
    username: 'NarrativeExplorer',
    avatar: 'https://i.pravatar.cc/150?img=5',
  },
];

// Mock comments for different stories
export const mockComments: { [storyId: string]: Comment[] } = {
  '1': [
    {
      id: 'comment_1',
      storyId: '1',
      userId: 'user_2',
      username: 'StoryLover2024',
      userAvatar: 'https://i.pravatar.cc/150?img=1',
      text: '🔥 This story had me on the edge of my seat! The suspense was incredible',
      timestamp: Date.now() - 3600000, // 1 hour ago
      likes: 12,
      isLiked: false,
    },
    {
      id: 'comment_2',
      storyId: '1',
      userId: 'user_3',
      username: 'ThrillSeeker',
      userAvatar: 'https://i.pravatar.cc/150?img=2',
      text: 'The narration quality is amazing! What a masterpiece of audio storytelling 🎭',
      timestamp: Date.now() - 7200000, // 2 hours ago
      likes: 8,
      isLiked: true,
    },
    {
      id: 'comment_3',
      storyId: '1',
      userId: 'user_4',
      username: 'MysteryFan',
      userAvatar: 'https://i.pravatar.cc/150?img=3',
      text: 'Perfect for my evening listening! The atmosphere is so immersive 🌙',
      timestamp: Date.now() - 10800000, // 3 hours ago
      likes: 5,
      isLiked: false,
    },
  ],
  '2': [
    {
      id: 'comment_4',
      storyId: '2',
      userId: 'user_5',
      username: 'AudioDrama',
      userAvatar: 'https://i.pravatar.cc/150?img=4',
      text: 'Michael Thompson never disappoints! This horror story is pure gold ✨',
      timestamp: Date.now() - 1800000, // 30 minutes ago
      likes: 15,
      isLiked: true,
    },
    {
      id: 'comment_5',
      storyId: '2',
      userId: 'user_6',
      username: 'NarrativeExplorer',
      userAvatar: 'https://i.pravatar.cc/150?img=5',
      text: 'Such beautiful storytelling, gives me chills every time 😢❤️',
      timestamp: Date.now() - 5400000, // 1.5 hours ago
      likes: 9,
      isLiked: false,
    },
  ],
  '3': [
    {
      id: 'comment_6',
      storyId: '3',
      userId: 'user_2',
      username: 'StoryLover2024',
      userAvatar: 'https://i.pravatar.cc/150?img=1',
      text: 'Emma Rodriguez absolutely killed it with this mystery! So engaging 🕵️',
      timestamp: Date.now() - 900000, // 15 minutes ago
      likes: 20,
      isLiked: false,
    },
    {
      id: 'comment_7',
      storyId: '3',
      userId: 'user_3',
      username: 'ThrillSeeker',
      userAvatar: 'https://i.pravatar.cc/150?img=2',
      text: 'Mind-bending mystery! This keeps you guessing until the end 🤔🔍',
      timestamp: Date.now() - 2700000, // 45 minutes ago
      likes: 11,
      isLiked: true,
    },
  ],
};

// Mock story likes
export const mockStoryLikes: { [storyId: string]: StoryLike } = {
  '1': { storyId: '1', isLiked: true, likeCount: 1234 },
  '2': { storyId: '2', isLiked: false, likeCount: 987 },
  '3': { storyId: '3', isLiked: true, likeCount: 1567 },
  '4': { storyId: '4', isLiked: false, likeCount: 543 },
  '5': { storyId: '5', isLiked: false, likeCount: 876 },
  '6': { storyId: '6', isLiked: true, likeCount: 432 },
  '7': { storyId: '7', isLiked: false, likeCount: 654 },
  '8': { storyId: '8', isLiked: false, likeCount: 789 },
};

// Helper function to format timestamp
export const formatTimeAgo = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return `${seconds}s ago`;
};
