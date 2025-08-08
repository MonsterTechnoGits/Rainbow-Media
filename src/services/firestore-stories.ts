import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  runTransaction,
  serverTimestamp,
  increment,
  QueryDocumentSnapshot,
  DocumentData,
  Timestamp,
  Firestore,
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

import { db } from '@/lib/firebase';
import { AudioStory } from '@/types/audio-story';

// Read count monitoring for development
const readCountMonitor = {
  totalReads: 0,
  sessionReads: 0,
  operations: [] as Array<{ operation: string; reads: number; timestamp: Date }>,
};

function logFirestoreRead(operation: string, readCount: number = 1) {
  if (process.env.NODE_ENV === 'development') {
    readCountMonitor.totalReads += readCount;
    readCountMonitor.sessionReads += readCount;
    readCountMonitor.operations.push({
      operation,
      reads: readCount,
      timestamp: new Date(),
    });
    console.log(
      `🔥 Firestore Read: ${operation} (${readCount} read${readCount > 1 ? 's' : ''}) - Session Total: ${readCountMonitor.sessionReads}`
    );
  }
}

// Export read monitoring for debugging
export const getReadCountStats = () => readCountMonitor;
export const resetReadCount = () => {
  readCountMonitor.sessionReads = 0;
  readCountMonitor.operations = [];
};

// Guard function to ensure db is initialized
function getDb(): Firestore {
  if (!db) {
    throw new Error('Firestore is not initialized. Please check your Firebase configuration.');
  }
  return db;
}

// Types for Firestore documents
export interface FirestoreStory {
  id: string;
  title: string;
  creator: string;
  series: string;
  duration: number;
  coverUrl: string;
  audioUrl: string;
  genre: string;
  paid: boolean;
  amount?: number;
  currency?: string;
  likeCount: number;
  commentCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserLikes {
  userId: string;
  likedStories: {
    [storyId: string]: {
      likedAt: Timestamp;
      storyTitle: string;
    };
  };
  lastUpdated: Timestamp;
}

export interface StoryLikes {
  storyId: string;
  count: number;
  users: {
    [userId: string]: {
      likedAt: Timestamp;
    };
  };
  lastUpdated: Timestamp;
}

export interface FirestoreComment {
  id: string;
  storyId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: Timestamp;
  likes: number;
  storyId_createdAt: string; // Composite field for efficient sorting
}

// Collection references - using functions to handle null db
const getStoriesCollection = () => collection(getDb(), 'stories');
const getUserLikesCollection = () => collection(getDb(), 'user-likes');
const getStoryLikesCollection = () => collection(getDb(), 'story-likes');
const getCommentsCollection = () => collection(getDb(), 'comments');

/**
 * Story Services - Optimized for minimal reads
 */
export class FirestoreStoryService {
  /**
   * Get stories with pagination (1 read)
   * Includes like and comment counts directly in story data
   */
  static async getStories(
    options: {
      limit?: number;
      offset?: number;
      search?: string;
      lastDoc?: QueryDocumentSnapshot<DocumentData>;
    } = {}
  ): Promise<{
    stories: AudioStory[];
    hasMore: boolean;
    lastDoc?: QueryDocumentSnapshot<DocumentData>;
  }> {
    const { limit: pageLimit = 20, search, lastDoc } = options;

    const storiesCollection = getStoriesCollection();
    let storyQuery = query(
      storiesCollection,
      orderBy('createdAt', 'desc'),
      limit(pageLimit + 1) // Get one extra to check if there are more
    );

    // Add search filter if provided
    if (search) {
      const searchLower = search.toLowerCase();
      storyQuery = query(
        storiesCollection,
        where('title', '>=', searchLower),
        where('title', '<=', searchLower + '\uf8ff'),
        limit(pageLimit + 1)
      );
    }

    // Add pagination if lastDoc provided
    if (lastDoc) {
      storyQuery = query(storyQuery, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(storyQuery);
    logFirestoreRead(`getStories${search ? ' (search)' : ''}`, 1);
    const docs = querySnapshot.docs;
    const hasMore = docs.length > pageLimit;

    // Remove the extra document if we have more
    if (hasMore) {
      docs.pop();
    }

    const stories = docs.map((doc) => {
      const data = doc.data() as FirestoreStory;
      return this.convertFirestoreStoryToAudioStory(data);
    });

    return {
      stories,
      hasMore,
      lastDoc: docs.length > 0 ? docs[docs.length - 1] : undefined,
    };
  }

  /**
   * Get user's liked stories for efficient like status checking (1 read)
   */
  static async getUserLikes(userId: string): Promise<Set<string>> {
    try {
      const userLikesDoc = await getDoc(doc(getUserLikesCollection(), userId));
      logFirestoreRead('getUserLikes', 1);

      if (userLikesDoc.exists()) {
        const data = userLikesDoc.data() as UserLikes;
        return new Set(Object.keys(data.likedStories || {}));
      }

      return new Set();
    } catch (error) {
      console.error('Error getting user likes:', error);
      return new Set();
    }
  }

  /**
   * Get stories with user's like status (2 reads total)
   */
  static async getStoriesWithLikes(
    userId: string,
    options: {
      limit?: number;
      search?: string;
      lastDoc?: QueryDocumentSnapshot<DocumentData>;
    } = {}
  ): Promise<{
    stories: AudioStory[];
    hasMore: boolean;
    lastDoc?: QueryDocumentSnapshot<DocumentData>;
  }> {
    // Get stories (1 read)
    const { stories, hasMore, lastDoc } = await this.getStories(options);

    // Get user likes (1 read)
    const userLikedStories = await this.getUserLikes(userId);

    // Add isLiked property to stories
    const storiesWithLikes = stories.map((story) => ({
      ...story,
      isLiked: userLikedStories.has(story.id),
    }));

    return {
      stories: storiesWithLikes,
      hasMore,
      lastDoc,
    };
  }

  /**
   * Get single story by ID
   */
  static async getStoryById(storyId: string): Promise<AudioStory | null> {
    try {
      const storyDoc = await getDoc(doc(getStoriesCollection(), storyId));

      if (storyDoc.exists()) {
        const data = storyDoc.data() as FirestoreStory;
        return this.convertFirestoreStoryToAudioStory(data);
      }

      return null;
    } catch (error) {
      console.error('Error getting story:', error);
      return null;
    }
  }

  /**
   * Convert Firestore story to AudioStory type
   */
  private static convertFirestoreStoryToAudioStory(data: FirestoreStory): AudioStory {
    return {
      id: data.id,
      title: data.title,
      creator: data.creator,
      series: data.series,
      duration: data.duration,
      coverUrl: data.coverUrl,
      audioUrl: data.audioUrl,
      genre: data.genre,
      paid: data.paid,
      amount: data.amount,
      currency: data.currency,
      likeCount: data.likeCount || 0,
      commentCount: data.commentCount || 0,
    };
  }
}

/**
 * Like Services - Optimized for minimal reads
 */
export class FirestoreLikeService {
  /**
   * Toggle like for a story (Atomic transaction - 1 read + 3 writes)
   */
  static async toggleStoryLike(
    storyId: string,
    userId: string,
    userName: string,
    storyTitle: string
  ): Promise<{ likeCount: number; isLiked: boolean }> {
    return runTransaction(getDb(), async (transaction) => {
      // Read current state
      const userLikesRef = doc(getUserLikesCollection(), userId);
      const storyRef = doc(getStoriesCollection(), storyId);
      const storyLikesRef = doc(getStoryLikesCollection(), storyId);

      const [userLikesDoc, storyDoc, storyLikesDoc] = await Promise.all([
        transaction.get(userLikesRef),
        transaction.get(storyRef),
        transaction.get(storyLikesRef),
      ]);
      logFirestoreRead('toggleStoryLike (transaction)', 3);

      const userData = userLikesDoc.exists()
        ? (userLikesDoc.data() as UserLikes)
        : {
            userId,
            likedStories: {},
            lastUpdated: serverTimestamp() as Timestamp,
          };

      const storyData = storyDoc.data() as FirestoreStory;
      const storyLikesData = storyLikesDoc.exists()
        ? (storyLikesDoc.data() as StoryLikes)
        : {
            storyId,
            count: 0,
            users: {},
            lastUpdated: serverTimestamp() as Timestamp,
          };

      const isCurrentlyLiked = userData.likedStories[storyId] !== undefined;
      const newIsLiked = !isCurrentlyLiked;
      let newLikeCount = storyData.likeCount || 0;

      if (newIsLiked) {
        // Add like
        userData.likedStories[storyId] = {
          likedAt: serverTimestamp() as Timestamp,
          storyTitle,
        };
        storyLikesData.users[userId] = {
          likedAt: serverTimestamp() as Timestamp,
        };
        storyLikesData.count += 1;
        newLikeCount += 1;
      } else {
        // Remove like
        delete userData.likedStories[storyId];
        delete storyLikesData.users[userId];
        storyLikesData.count = Math.max(0, storyLikesData.count - 1);
        newLikeCount = Math.max(0, newLikeCount - 1);
      }

      // Update documents
      userData.lastUpdated = serverTimestamp() as Timestamp;
      storyLikesData.lastUpdated = serverTimestamp() as Timestamp;

      transaction.set(userLikesRef, userData);
      transaction.set(storyLikesRef, storyLikesData);
      transaction.update(storyRef, {
        likeCount: newLikeCount,
        updatedAt: serverTimestamp(),
      });

      return {
        likeCount: newLikeCount,
        isLiked: newIsLiked,
      };
    });
  }

  /**
   * Get story like info (if needed separately)
   */
  static async getStoryLikes(
    storyId: string,
    userId?: string
  ): Promise<{ likeCount: number; isLiked: boolean }> {
    try {
      const [storyDoc, userLikesDoc] = await Promise.all([
        getDoc(doc(getStoriesCollection(), storyId)),
        userId ? getDoc(doc(getUserLikesCollection(), userId)) : Promise.resolve(null),
      ]);

      const likeCount = storyDoc.exists() ? storyDoc.data().likeCount || 0 : 0;
      let isLiked = false;

      if (userId && userLikesDoc?.exists()) {
        const userData = userLikesDoc.data() as UserLikes;
        isLiked = userData.likedStories[storyId] !== undefined;
      }

      return { likeCount, isLiked };
    } catch (error) {
      console.error('Error getting story likes:', error);
      return { likeCount: 0, isLiked: false };
    }
  }
}

/**
 * Comment Services - Optimized for minimal reads
 */
export class FirestoreCommentService {
  /**
   * Get comments for a story with pagination (1 read)
   */
  static async getStoryComments(
    storyId: string,
    options: {
      limit?: number;
      lastDoc?: QueryDocumentSnapshot<DocumentData>;
    } = {}
  ): Promise<{
    comments: Array<{
      id: string;
      userId: string;
      userName: string;
      userAvatar: string;
      content: string;
      timestamp: number;
      likes: number;
      replies: Array<unknown>;
    }>;
    hasMore: boolean;
    lastDoc?: QueryDocumentSnapshot<DocumentData>;
  }> {
    const { limit: pageLimit = 20, lastDoc } = options;

    const commentsCollection = getCommentsCollection();
    let commentQuery = query(
      commentsCollection,
      where('storyId', '==', storyId),
      orderBy('createdAt', 'desc'),
      limit(pageLimit + 1)
    );

    if (lastDoc) {
      commentQuery = query(commentQuery, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(commentQuery);
    logFirestoreRead('getStoryComments', 1);
    const docs = querySnapshot.docs;
    const hasMore = docs.length > pageLimit;

    if (hasMore) {
      docs.pop();
    }

    const comments = docs.map((doc) => {
      const data = doc.data() as FirestoreComment;
      return {
        id: data.id,
        userId: data.userId,
        userName: data.userName,
        userAvatar: data.userAvatar,
        content: data.content,
        timestamp: data.createdAt.toMillis(),
        likes: data.likes || 0,
        replies: [], // TODO: Implement replies if needed
      };
    });

    return {
      comments,
      hasMore,
      lastDoc: docs.length > 0 ? docs[docs.length - 1] : undefined,
    };
  }

  /**
   * Add comment to a story (Atomic transaction - 2 writes)
   */
  static async addComment(
    storyId: string,
    userId: string,
    userName: string,
    userAvatar: string,
    content: string
  ): Promise<{
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    content: string;
    timestamp: number;
    likes: number;
    replies: Array<unknown>;
  }> {
    const commentsCollection = getCommentsCollection();
    const commentId = uuidv4(); // Generate UUID for comment
    const createdAt = serverTimestamp() as Timestamp;

    return runTransaction(getDb(), async (transaction) => {
      const storyRef = doc(getStoriesCollection(), storyId);
      const commentRef = doc(commentsCollection, commentId);

      // Create composite field for efficient sorting
      const now = new Date();
      const storyId_createdAt = `${storyId}_${now.getTime()}`;

      const commentData: FirestoreComment = {
        id: commentId,
        storyId,
        userId,
        userName,
        userAvatar,
        content,
        createdAt,
        likes: 0,
        storyId_createdAt,
      };

      // Add comment and increment counter
      transaction.set(commentRef, commentData);
      transaction.update(storyRef, {
        commentCount: increment(1),
        updatedAt: serverTimestamp(),
      });

      return {
        id: commentId,
        userId,
        userName,
        userAvatar,
        content,
        timestamp: now.getTime(),
        likes: 0,
        replies: [],
      };
    });
  }
}

// Backward compatibility exports
export const FirestoreTrackService = FirestoreStoryService;
// Note: Like and Comment services are now methods within FirestoreStoryService
