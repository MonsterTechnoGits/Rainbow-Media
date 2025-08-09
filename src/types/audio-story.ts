export interface AudioStory {
  id: string;
  title: string;
  creator: string;
  series: string;
  duration: number; // in seconds
  coverUrl: string;
  audioUrl: string;
  genre: string;
  paid: boolean; // true if the story is paid
  amount?: number; // price in the specified currency
  currency?: string; // currency code, e.g., 'INR'
  // Performance optimization: include counts directly in story data
  likeCount: number;
  commentCount: number;
  isLiked?: boolean; // Only set when user is authenticated
}

export interface PlayerState {
  currentStory: AudioStory | null;
  isPlaying: boolean;
  isLoading: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isShuffled: boolean;
  isRepeated: boolean;
  queue: AudioStory[];
  currentIndex: number;
}

export type PlayerDrawerState = 'closed' | 'mini' | 'expanded';

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  purchases: string[]; // Array of purchased story IDs
  isAdmin?: boolean; // Admin flag
}

export interface PurchaseDetails {
  storyId: string;
  amount: number;
  currency: string;
  paymentId: string;
  orderId: string;
  timestamp: number;
}

export interface DonationDetails {
  storyId: string;
  creatorName: string;
  storyTitle: string;
  amount: number;
  currency: string;
  paymentId: string;
  orderId: string;
  timestamp: number;
  type: 'donation'; // to distinguish from purchases
}
