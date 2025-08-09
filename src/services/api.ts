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

// Admin API calls (updated to use unified story endpoint)
export const adminApi = {
  // Get story for editing
  async getStory(id: string): Promise<AxiosResponse<{ story: AudioStory }>> {
    return apiCall(`/admin/stories/${id}`, {
      method: 'GET',
    });
  },

  // Update story (deprecated - use storyManagementApi.updateStory instead)
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
    console.warn('adminApi.updateStory is deprecated. Use storyManagementApi.updateStory instead.');

    // Convert to FormData for unified endpoint
    const formData = new FormData();
    formData.set('storyId', id);
    formData.set('edit', 'true');
    formData.set('title', data.title);
    formData.set('series', data.series);
    if (data.description) formData.set('description', data.description);
    if (data.creator) formData.set('creator', data.creator);
    formData.set('isPaid', data.isPaid.toString());
    if (data.price) formData.set('price', data.price.toString());
    formData.set('currency', data.currency);
    formData.set('genre', data.genre);
    if (data.genres) formData.set('genres', JSON.stringify(data.genres));
    if (data.license) formData.set('license', data.license);
    if (data.rightsOwner) formData.set('rightsOwner', data.rightsOwner);
    formData.set('isExplicit', (data.isExplicit || false).toString());
    if (data.episodeNumber) formData.set('episodeNumber', data.episodeNumber.toString());
    if (data.storyType) formData.set('storyType', data.storyType);
    if (data.duration) formData.set('duration', data.duration.toString());

    const result = await storyManagementApi.updateStory(formData);
    return {
      ...result,
      data: {
        success: result.data.success,
        story: result.data.data,
      },
    };
  },

  // Delete story
  async deleteStory(id: string): Promise<AxiosResponse<{ success: boolean }>> {
    return apiCall(`/admin/stories/${id}`, {
      method: 'DELETE',
    });
  },
};

// Story management API calls
export const storyManagementApi = {
  // Create or update story with unified endpoint
  async saveStory(
    formData: FormData,
    isEdit: boolean = false
  ): Promise<
    AxiosResponse<{
      success: boolean;
      message: string;
      data: AudioStory;
    }>
  > {
    // Set the edit flag
    formData.set('edit', isEdit.toString());

    const user = getAuth().currentUser;
    let token = '';
    if (user) {
      token = await user.getIdToken();
    }

    const response = await fetch('/api/story', {
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

  // Create new story (convenience method)
  async createStory(formData: FormData): Promise<
    AxiosResponse<{
      success: boolean;
      message: string;
      data: AudioStory;
    }>
  > {
    return this.saveStory(formData, false);
  },

  // Update existing story (convenience method)
  async updateStory(formData: FormData): Promise<
    AxiosResponse<{
      success: boolean;
      message: string;
      data: AudioStory;
    }>
  > {
    return this.saveStory(formData, true);
  },
};

// Upload API calls (deprecated - use storyManagementApi instead)
export const uploadApi = {
  // Upload complete story with audio and cover
  async uploadStory(formData: FormData): Promise<
    AxiosResponse<{
      success: boolean;
      message: string;
      story?: AudioStory;
    }>
  > {
    console.warn(
      'uploadApi.uploadStory is deprecated. Use storyManagementApi.createStory instead.'
    );
    return storyManagementApi.createStory(formData);
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
  storyManagement: storyManagementApi,
};
