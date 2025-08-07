import axios, { AxiosResponse } from 'axios';

import { MusicTrack } from '@/types/music';

// Base API configuration
const API_BASE_URL = '/api';

// Configure axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options?: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    data?: Record<string, unknown>;
    params?: Record<string, unknown>;
  }
): Promise<AxiosResponse<T>> {
  const { method = 'GET', data, params } = options || {};

  return apiClient.request<T>({
    url: endpoint,
    method,
    data,
    params,
  });
}

// Track API calls
export const trackApi = {
  // Get all tracks with optional search and pagination
  async getTracks(params?: {
    q?: string;
    limit?: number;
    offset?: number;
    userId?: string;
  }): Promise<
    AxiosResponse<{
      tracks: MusicTrack[];
      total: number;
      filtered: number;
      pagination: {
        offset: number;
        limit: number;
        hasMore: boolean;
      };
    }>
  > {
    return apiCall('/tracks', {
      method: 'GET',
      params,
    });
  },

  // Get single track by ID
  async getTrack(id: string): Promise<
    AxiosResponse<
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
    >
  > {
    return apiCall(`/tracks/${id}`);
  },

  // Get track likes
  async getTrackLikes(
    trackId: string,
    userId?: string
  ): Promise<
    AxiosResponse<{
      trackId: string;
      likeCount: number;
      isLiked: boolean;
    }>
  > {
    return apiCall(`/tracks/${trackId}/likes`, {
      method: 'GET',
      params: userId ? { userId } : undefined,
    });
  },

  // Toggle track like
  async toggleTrackLike(
    trackId: string,
    userId: string
  ): Promise<
    AxiosResponse<{
      trackId: string;
      likeCount: number;
      isLiked: boolean;
    }>
  > {
    return apiCall(`/tracks/${trackId}/likes`, {
      method: 'POST',
      data: { userId },
    });
  },

  // Get track comments
  async getTrackComments(
    trackId: string,
    params?: {
      limit?: number;
      offset?: number;
    }
  ): Promise<
    AxiosResponse<{
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
    }>
  > {
    return apiCall(`/tracks/${trackId}/comments`, {
      method: 'GET',
      params,
    });
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
  ): Promise<
    AxiosResponse<{
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
    }>
  > {
    return apiCall(`/tracks/${trackId}/comments`, {
      method: 'POST',
      data: comment,
    });
  },
};

// User API calls (for future use with real backend)
export const userApi = {
  // Get user profile
  async getUserProfile(userId: string): Promise<AxiosResponse<Record<string, unknown>>> {
    return apiCall(`/users/${userId}`);
  },

  // Update user profile
  async updateUserProfile(
    userId: string,
    data: Record<string, unknown>
  ): Promise<AxiosResponse<Record<string, unknown>>> {
    return apiCall(`/users/${userId}`, {
      method: 'PUT',
      data,
    });
  },
};

// Payment API calls
export const paymentApi = {
  // Create Razorpay order
  async createOrder(amount: number): Promise<
    AxiosResponse<{
      id: string;
      amount: number;
      currency: string;
    }>
  > {
    return apiCall('/razorpay/order', {
      method: 'POST',
      data: { amount },
    });
  },
};

export default {
  track: trackApi,
  user: userApi,
  payment: paymentApi,
};
