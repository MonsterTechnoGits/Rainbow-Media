import { MusicTrack } from '@/types/music';

// Mock music data - in a real app, this would come from an API
export const mockMusicTracks: MusicTrack[] = [
  {
    id: '1',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration: 200,
    coverUrl: 'https://i.scdn.co/image/ab67616d0000b273ef5d0edc0e22620a2f2c7b2f',
    audioUrl:
      'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3',
    genre: 'Pop',
    paid: true,
    amount: 5,
    currency: 'INR',
  },
  {
    id: '2',
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    album: '÷ (Divide)',
    duration: 233,
    coverUrl: 'https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6f96',
    audioUrl: 'https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg',
    genre: 'Pop',
    paid: false,
    amount: 5,
    currency: 'INR',
  },
  {
    id: '3',
    title: 'Levitating',
    artist: 'Dua Lipa',
    album: 'Future Nostalgia',
    duration: 203,
    coverUrl: 'https://i.scdn.co/image/ab67616d0000b273ef5d0edc0e22620a2f2c7b2f',
    audioUrl:
      'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Sevish_-__nbsp_.mp3',
    genre: 'Pop',
    paid: true,
    amount: 5,
    currency: 'INR',
  },
  {
    id: '4',
    title: 'Good 4 U',
    artist: 'Olivia Rodrigo',
    album: 'SOUR',
    duration: 178,
    coverUrl: 'https://i.scdn.co/image/ab67616d0000b273ef5d0edc0e22620a2f2c7b2f',
    audioUrl: 'https://commondatastorage.googleapis.com/codeskulptor-demos/pang/paza-moduless.mp3',
    genre: 'Pop Rock',
    paid: false,
    amount: 5,
    currency: 'INR',
  },
  {
    id: '5',
    title: 'Stay',
    artist: 'The Kid LAROI, Justin Bieber',
    album: 'F*CK LOVE 3: OVER YOU',
    duration: 141,
    coverUrl: 'https://i.scdn.co/image/ab67616d0000b273ef5d0edc0e22620a2f2c7b2f',
    audioUrl:
      'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3',
    genre: 'Hip Hop',
    paid: true,
    amount: 5,
    currency: 'INR',
  },
  {
    id: '6',
    title: 'Bad Habits',
    artist: 'Ed Sheeran',
    album: '= (Equals)',
    duration: 230,
    coverUrl: 'https://i.scdn.co/image/ab67616d0000b273ef5d0edc0e22620a2f2c7b2f',
    audioUrl:
      'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3',
    genre: 'Pop',
    paid: false,
    amount: 5,
    currency: 'INR',
  },
  {
    id: '7',
    title: 'Positions',
    artist: 'Ariana Grande',
    album: 'Positions',
    duration: 172,
    coverUrl: 'https://i.scdn.co/image/ab67616d0000b273ef5d0edc0e22620a2f2c7b2f',
    audioUrl: 'https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg',
    genre: 'R&B',
    paid: true,
    amount: 5,
    currency: 'INR',
  },
  {
    id: '8',
    title: 'Watermelon Sugar',
    artist: 'Harry Styles',
    album: 'Fine Line',
    duration: 174,
    coverUrl: 'https://i.scdn.co/image/ab67616d0000b273ef5d0edc0e22620a2f2c7b2f',
    audioUrl:
      'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Sevish_-__nbsp_.mp3',
    genre: 'Pop Rock',
    paid: false,
    amount: 5,
    currency: 'INR',
  },
];

export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};
