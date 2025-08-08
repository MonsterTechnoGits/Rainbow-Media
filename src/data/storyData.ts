import { AudioStory } from '@/types/audio-story';

// Mock audio story data - in a real app, this would come from an API
export const mockAudioStories: AudioStory[] = [
  {
    id: '1',
    title: 'The Midnight Caller',
    creator: 'Sarah Mitchell',
    series: 'Dark Tales Collection',
    duration: 1200, // 20 minutes
    coverUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    audioUrl:
      'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3',
    genre: 'Suspense',
    paid: true,
    amount: 25,
    currency: 'INR',
    likeCount: 1250,
    commentCount: 85,
  },
  {
    id: '2',
    title: 'Shadows in the Attic',
    creator: 'Michael Thompson',
    series: 'Horror Chronicles',
    duration: 1680, // 28 minutes
    coverUrl: 'https://images.unsplash.com/photo-1518709414-a0fa83d1b5c7?w=400&h=400&fit=crop',
    audioUrl: 'https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg',
    genre: 'Horror',
    paid: false,
    amount: 30,
    currency: 'INR',
    likeCount: 2340,
    commentCount: 152,
  },
  {
    id: '3',
    title: "The Detective's Last Case",
    creator: 'Emma Rodriguez',
    series: 'Mystery Solvers',
    duration: 1800, // 30 minutes
    coverUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop',
    audioUrl:
      'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Sevish_-__nbsp_.mp3',
    genre: 'Mystery',
    paid: true,
    amount: 35,
    currency: 'INR',
    likeCount: 892,
    commentCount: 67,
  },
  {
    id: '4',
    title: 'Love in Digital Times',
    creator: 'James Park',
    series: 'Modern Romance',
    duration: 1440, // 24 minutes
    coverUrl: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=400&fit=crop',
    audioUrl: 'https://commondatastorage.googleapis.com/codeskulptor-demos/pang/paza-moduless.mp3',
    genre: 'Romance',
    paid: false,
    amount: 20,
    currency: 'INR',
    likeCount: 1876,
    commentCount: 203,
  },
  {
    id: '5',
    title: 'The Space Station Incident',
    creator: 'Dr. Alex Chen',
    series: 'Sci-Fi Adventures',
    duration: 2100, // 35 minutes
    coverUrl: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=400&fit=crop',
    audioUrl:
      'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3',
    genre: 'Sci-Fi',
    paid: true,
    amount: 40,
    currency: 'INR',
    likeCount: 3456,
    commentCount: 278,
  },
  {
    id: '6',
    title: 'The Haunted Lighthouse',
    creator: 'Rebecca Stone',
    series: 'Coastal Mysteries',
    duration: 1560, // 26 minutes
    coverUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=400&fit=crop',
    audioUrl:
      'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3',
    genre: 'Thriller',
    paid: false,
    amount: 25,
    currency: 'INR',
    likeCount: 1432,
    commentCount: 98,
  },
  {
    id: '7',
    title: 'Corporate Espionage',
    creator: 'David Kumar',
    series: 'Business Thrillers',
    duration: 1920, // 32 minutes
    coverUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=400&fit=crop',
    audioUrl: 'https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg',
    genre: 'Thriller',
    paid: true,
    amount: 45,
    currency: 'INR',
    likeCount: 1567,
    commentCount: 134,
  },
  {
    id: '8',
    title: "The Time Traveler's Dilemma",
    creator: 'Lisa Wang',
    series: 'Time Paradox Stories',
    duration: 1740, // 29 minutes
    coverUrl: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=400&fit=crop',
    audioUrl:
      'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Sevish_-__nbsp_.mp3',
    genre: 'Sci-Fi',
    paid: false,
    amount: 30,
    currency: 'INR',
    likeCount: 2109,
    commentCount: 189,
  },
];

export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};
