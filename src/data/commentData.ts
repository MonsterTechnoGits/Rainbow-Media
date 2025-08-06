import { Comment, TrackLike, User } from '@/types/comment';

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
    username: 'MusicLover2024',
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
  {
    id: 'user_3',
    username: 'BeatDropper',
    avatar: 'https://i.pravatar.cc/150?img=2',
  },
  {
    id: 'user_4',
    username: 'SoundWave',
    avatar: 'https://i.pravatar.cc/150?img=3',
  },
  {
    id: 'user_5',
    username: 'RhythmMaster',
    avatar: 'https://i.pravatar.cc/150?img=4',
  },
  {
    id: 'user_6',
    username: 'VibeSeeker',
    avatar: 'https://i.pravatar.cc/150?img=5',
  },
];

// Mock comments for different tracks
export const mockComments: { [trackId: string]: Comment[] } = {
  '1': [
    {
      id: 'comment_1',
      trackId: '1',
      userId: 'user_2',
      username: 'MusicLover2024',
      userAvatar: 'https://i.pravatar.cc/150?img=1',
      text: '🔥 This beat drops so hard! Been on repeat for hours',
      timestamp: Date.now() - 3600000, // 1 hour ago
      likes: 12,
      isLiked: false,
    },
    {
      id: 'comment_2',
      trackId: '1',
      userId: 'user_3',
      username: 'BeatDropper',
      userAvatar: 'https://i.pravatar.cc/150?img=2',
      text: 'The production quality on this is insane! What a masterpiece 🎵',
      timestamp: Date.now() - 7200000, // 2 hours ago
      likes: 8,
      isLiked: true,
    },
    {
      id: 'comment_3',
      trackId: '1',
      userId: 'user_4',
      username: 'SoundWave',
      userAvatar: 'https://i.pravatar.cc/150?img=3',
      text: 'Perfect for my workout playlist! Gets me so pumped 💪',
      timestamp: Date.now() - 10800000, // 3 hours ago
      likes: 5,
      isLiked: false,
    },
  ],
  '2': [
    {
      id: 'comment_4',
      trackId: '2',
      userId: 'user_5',
      username: 'RhythmMaster',
      userAvatar: 'https://i.pravatar.cc/150?img=4',
      text: 'Ed Sheeran never disappoints! This melody is pure gold ✨',
      timestamp: Date.now() - 1800000, // 30 minutes ago
      likes: 15,
      isLiked: true,
    },
    {
      id: 'comment_5',
      trackId: '2',
      userId: 'user_6',
      username: 'VibeSeeker',
      userAvatar: 'https://i.pravatar.cc/150?img=5',
      text: 'Such beautiful lyrics, makes me emotional every time 😢❤️',
      timestamp: Date.now() - 5400000, // 1.5 hours ago
      likes: 9,
      isLiked: false,
    },
  ],
  '3': [
    {
      id: 'comment_6',
      trackId: '3',
      userId: 'user_2',
      username: 'MusicLover2024',
      userAvatar: 'https://i.pravatar.cc/150?img=1',
      text: 'Dua Lipa absolutely killed it with this track! So catchy 🎶',
      timestamp: Date.now() - 900000, // 15 minutes ago
      likes: 20,
      isLiked: false,
    },
    {
      id: 'comment_7',
      trackId: '3',
      userId: 'user_3',
      username: 'BeatDropper',
      userAvatar: 'https://i.pravatar.cc/150?img=2',
      text: 'Dance floor anthem! This gets everyone moving 💃🕺',
      timestamp: Date.now() - 2700000, // 45 minutes ago
      likes: 11,
      isLiked: true,
    },
  ],
};

// Mock track likes
export const mockTrackLikes: { [trackId: string]: TrackLike } = {
  '1': { trackId: '1', isLiked: true, likeCount: 1234 },
  '2': { trackId: '2', isLiked: false, likeCount: 987 },
  '3': { trackId: '3', isLiked: true, likeCount: 1567 },
  '4': { trackId: '4', isLiked: false, likeCount: 543 },
  '5': { trackId: '5', isLiked: false, likeCount: 876 },
  '6': { trackId: '6', isLiked: true, likeCount: 432 },
  '7': { trackId: '7', isLiked: false, likeCount: 654 },
  '8': { trackId: '8', isLiked: false, likeCount: 789 },
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
