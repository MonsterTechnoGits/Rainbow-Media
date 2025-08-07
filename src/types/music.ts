export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  coverUrl: string;
  audioUrl: string;
  genre: string;
  paid: boolean; // true if the track is paid
  amount?: number; // price in the specified currency
  currency?: string; // currency code, e.g., 'INR'
  // Performance optimization: include counts directly in track data
  likeCount: number;
  commentCount: number;
  isLiked?: boolean; // Only set when user is authenticated
}

export interface PlayerState {
  currentTrack: MusicTrack | null;
  isPlaying: boolean;
  isLoading: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isShuffled: boolean;
  isRepeated: boolean;
  queue: MusicTrack[];
  currentIndex: number;
}

export type PlayerDrawerState = 'closed' | 'mini' | 'expanded';

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  purchases: string[]; // Array of purchased track IDs
  isAdmin?: boolean; // Admin flag
}

export interface PurchaseDetails {
  trackId: string;
  amount: number;
  currency: string;
  paymentId: string;
  orderId: string;
  timestamp: number;
}
