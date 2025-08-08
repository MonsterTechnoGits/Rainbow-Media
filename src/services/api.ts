import axios, { AxiosResponse } from 'axios';

import { AudioStory } from '@/types/audio-story';

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

// Story API calls
export const storyApi = {
  // Get all stories with optional search and pagination
  async getStories(params?: {
    q?: string;
    limit?: number;
    offset?: number;
    userId?: string;
  }): Promise<
    AxiosResponse<{
      stories: AudioStory[];
      total: number;
      filtered: number;
      pagination: {
        offset: number;
        limit: number;
        hasMore: boolean;
      };
    }>
  > {
    return apiCall('/stories', {
      method: 'GET',
      params,
    });
  },

  // Get single story by ID
  async getStory(id: string): Promise<
    AxiosResponse<
      AudioStory & {
        metadata: {
          totalStories: number;
          storyIndex: number;
          nextStory: string | null;
          previousStory: string | null;
          relatedStories: Array<{
            id: string;
            title: string;
            creator: string;
          }>;
        };
      }
    >
  > {
    return apiCall(`/stories/${id}`);
  },

  // Get story likes
  async getStoryLikes(
    storyId: string,
    userId?: string
  ): Promise<
    AxiosResponse<{
      storyId: string;
      likeCount: number;
      isLiked: boolean;
    }>
  > {
    return apiCall(`/stories/${storyId}/likes`, {
      method: 'GET',
      params: userId ? { userId } : undefined,
    });
  },

  // Toggle story like
  async toggleStoryLike(
    storyId: string,
    userId: string
  ): Promise<
    AxiosResponse<{
      storyId: string;
      likeCount: number;
      isLiked: boolean;
    }>
  > {
    return apiCall(`/stories/${storyId}/likes`, {
      method: 'POST',
      data: { userId },
    });
  },

  // Get story comments
  async getStoryComments(
    storyId: string,
    params?: {
      limit?: number;
      offset?: number;
    }
  ): Promise<
    AxiosResponse<{
      storyId: string;
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
    return apiCall(`/stories/${storyId}/comments`, {
      method: 'GET',
      params,
    });
  },

  // Add comment to story
  async addStoryComment(
    storyId: string,
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
    return apiCall(`/stories/${storyId}/comments`, {
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

// Backward compatibility
export const trackApi = storyApi;

export default {
  story: storyApi,
  track: storyApi, // Backward compatibility
  user: userApi,
  payment: paymentApi,
};
