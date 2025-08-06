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
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Free sample
    genre: 'Pop',
  },
  {
    id: '2',
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    album: '÷ (Divide)',
    duration: 233,
    coverUrl: 'https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6f96',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    genre: 'Pop',
  },
  {
    id: '3',
    title: 'Levitating',
    artist: 'Dua Lipa',
    album: 'Future Nostalgia',
    duration: 203,
    coverUrl: 'https://i.scdn.co/image/ab67616d0000b273ef5d0edc0e22620a2f2c7b2f',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    genre: 'Pop',
  },
  {
    id: '4',
    title: 'Good 4 U',
    artist: 'Olivia Rodrigo',
    album: 'SOUR',
    duration: 178,
    coverUrl: 'https://i.scdn.co/image/ab67616d0000b273ef5d0edc0e22620a2f2c7b2f',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    genre: 'Pop Rock',
  },
  {
    id: '5',
    title: 'Stay',
    artist: 'The Kid LAROI, Justin Bieber',
    album: 'F*CK LOVE 3: OVER YOU',
    duration: 141,
    coverUrl: 'https://i.scdn.co/image/ab67616d0000b273ef5d0edc0e22620a2f2c7b2f',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    genre: 'Hip Hop',
  },
  {
    id: '6',
    title: 'Bad Habits',
    artist: 'Ed Sheeran',
    album: '= (Equals)',
    duration: 230,
    coverUrl: 'https://i.scdn.co/image/ab67616d0000b273ef5d0edc0e22620a2f2c7b2f',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    genre: 'Pop',
  },
  {
    id: '7',
    title: 'Positions',
    artist: 'Ariana Grande',
    album: 'Positions',
    duration: 172,
    coverUrl: 'https://i.scdn.co/image/ab67616d0000b273ef5d0edc0e22620a2f2c7b2f',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    genre: 'R&B',
  },
  {
    id: '8',
    title: 'Watermelon Sugar',
    artist: 'Harry Styles',
    album: 'Fine Line',
    duration: 174,
    coverUrl: 'https://i.scdn.co/image/ab67616d0000b273ef5d0edc0e22620a2f2c7b2f',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    genre: 'Pop Rock',
  },
];

export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};
