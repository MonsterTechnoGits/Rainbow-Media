import { MusicTrack } from '@/types/music';

// Base API configuration
const API_BASE_URL = '/api';

// Helper function for API calls
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }

  return response.json();
}

// Track API calls
export const trackApi = {
  // Get all tracks with optional search and pagination
  async getTracks(params?: { q?: string; limit?: number; offset?: number }): Promise<{
    tracks: MusicTrack[];
    total: number;
    filtered: number;
    pagination: {
      offset: number;
      limit: number;
      hasMore: boolean;
    };
  }> {
    const searchParams = new URLSearchParams();
    if (params?.q) searchParams.set('q', params.q);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());

    const query = searchParams.toString();
    return apiCall(`/tracks${query ? `?${query}` : ''}`);
  },

  // Get single track by ID
  async getTrack(id: string): Promise<
    MusicTrack & {
      metadata: {
        totalTracks: number;
        trackIndex: number;
        nextTrack: string | null;
        previousTrack: string | null;
        relatedTracks: Array<{
          id: string;
          title: string;
          artist: string;
        }>;
      };
    }
  > {
    return apiCall(`/tracks/${id}`);
  },

  // Get track likes
  async getTrackLikes(
    trackId: string,
    userId?: string
  ): Promise<{
    trackId: string;
    likeCount: number;
    isLiked: boolean;
  }> {
    const params = userId ? `?userId=${userId}` : '';
    return apiCall(`/tracks/${trackId}/likes${params}`);
  },

  // Toggle track like
  async toggleTrackLike(
    trackId: string,
    userId: string
  ): Promise<{
    trackId: string;
    likeCount: number;
    isLiked: boolean;
  }> {
    return apiCall(`/tracks/${trackId}/likes`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  },

  // Get track comments
  async getTrackComments(
    trackId: string,
    params?: {
      limit?: number;
      offset?: number;
    }
  ): Promise<{
    trackId: string;
    comments: Array<{
      id: string;
      userId: string;
      userName: string;
      userAvatar: string;
      content: string;
      timestamp: number;
      likes: number;
      replies: Array<{
        id: string;
        userId: string;
        userName: string;
        userAvatar: string;
        content: string;
        timestamp: number;
      }>;
    }>;
    total: number;
    pagination: {
      offset: number;
      limit: number;
      hasMore: boolean;
    };
  }> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());

    const query = searchParams.toString();
    return apiCall(`/tracks/${trackId}/comments${query ? `?${query}` : ''}`);
  },

  // Add comment to track
  async addTrackComment(
    trackId: string,
    comment: {
      userId: string;
      userName: string;
      userAvatar?: string;
      content: string;
    }
  ): Promise<{
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
  }> {
    return apiCall(`/tracks/${trackId}/comments`, {
      method: 'POST',
      body: JSON.stringify(comment),
    });
  },
};

// User API calls (for future use with real backend)
export const userApi = {
  // Get user profile
  async getUserProfile(userId: string) {
    return apiCall(`/users/${userId}`);
  },

  // Update user profile
  async updateUserProfile(userId: string, data: Record<string, unknown>) {
    return apiCall(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// Payment API calls
export const paymentApi = {
  // Create Razorpay order
  async createOrder(amount: number): Promise<{
    id: string;
    amount: number;
    currency: string;
  }> {
    return apiCall('/razorpay/order', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  },
};

export default {
  track: trackApi,
  user: userApi,
  payment: paymentApi,
};
