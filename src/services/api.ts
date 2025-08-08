import axios, { AxiosResponse } from 'axios';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

import { AudioStory } from '@/types/audio-story';

function waitForAuthInit(): Promise<string | null> {
  const auth = getAuth();
  return new Promise((resolve) => {
    if (auth.currentUser) {
      auth.currentUser.getIdToken().then(resolve);
    } else {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        unsubscribe();
        if (user) {
          resolve(await user.getIdToken());
        } else {
          resolve(null);
        }
      });
    }
  });
}
// Simple axios instance without authentication
const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});
apiClient.interceptors.request.use(async (config) => {
  const token = await waitForAuthInit();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
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
    userId: string,
    userName: string
  ): Promise<
    AxiosResponse<{
      storyId: string;
      likeCount: number;
      isLiked: boolean;
    }>
  > {
    return apiCall(`/stories/${storyId}/likes`, {
      method: 'POST',
      data: { userId, userName },
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

// Admin API calls
export const adminApi = {
  // Get story for editing
  async getStory(id: string): Promise<AxiosResponse<{ story: AudioStory }>> {
    return apiCall(`/admin/stories/${id}`, {
      method: 'GET',
    });
  },

  // Update story
  async updateStory(
    id: string,
    data: {
      title: string;
      series: string;
      description?: string;
      creator?: string;
      isPaid: boolean;
      price?: number;
      currency: string;
      genre: string;
      genres?: string[];
      license?: string;
      rightsOwner?: string;
      isExplicit?: boolean;
      episodeNumber?: number;
      storyType?: string;
      duration?: number;
      coverUrl?: string;
    }
  ): Promise<AxiosResponse<{ success: boolean; story: AudioStory }>> {
    return apiCall(`/admin/stories/${id}`, {
      method: 'PUT',
      data,
    });
  },

  // Delete story
  async deleteStory(id: string): Promise<AxiosResponse<{ success: boolean }>> {
    return apiCall(`/admin/stories/${id}`, {
      method: 'DELETE',
    });
  },
};

// Upload API calls
export const uploadApi = {
  // Upload complete story with audio and cover
  async uploadStory(formData: FormData): Promise<
    AxiosResponse<{
      success: boolean;
      message: string;
      story?: AudioStory;
    }>
  > {
    // For FormData, we need to use a different approach
    const user = getAuth().currentUser;
    let token = '';
    if (user) {
      token = await user.getIdToken();
    }

    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: formData,
    });

    const data = await response.json();
    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: {} as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      config: {} as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      request: {} as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    };
  },

  // Upload cover image only
  async uploadCoverImage(formData: FormData): Promise<
    AxiosResponse<{
      coverUrl: string;
    }>
  > {
    // For FormData, we need to use a different approach
    const user = getAuth().currentUser;
    let token = '';
    if (user) {
      token = await user.getIdToken();
    }

    const response = await fetch('/api/upload-simple', {
      method: 'POST',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: formData,
    });

    const data = await response.json();
    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: {} as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      config: {} as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      request: {} as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    };
  },
};

// Backward compatibility
export const trackApi = storyApi;

export default {
  story: storyApi,
  track: storyApi, // Backward compatibility
  user: userApi,
  payment: paymentApi,
  admin: adminApi,
  upload: uploadApi,
};
