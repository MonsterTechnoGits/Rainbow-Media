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
import { MusicTrack } from '@/types/music';

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
export interface FirestoreTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
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
  likedTracks: {
    [trackId: string]: {
      likedAt: Timestamp;
      trackTitle: string;
    };
  };
  lastUpdated: Timestamp;
}

export interface TrackLikes {
  trackId: string;
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
  trackId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: Timestamp;
  likes: number;
  trackId_createdAt: string; // Composite field for efficient sorting
}

// Collection references - using functions to handle null db
const getTracksCollection = () => collection(getDb(), 'tracks');
const getUserLikesCollection = () => collection(getDb(), 'user-likes');
const getTrackLikesCollection = () => collection(getDb(), 'track-likes');
const getCommentsCollection = () => collection(getDb(), 'comments');

/**
 * Track Services - Optimized for minimal reads
 */
export class FirestoreTrackService {
  /**
   * Get tracks with pagination (1 read)
   * Includes like and comment counts directly in track data
   */
  static async getTracks(
    options: {
      limit?: number;
      offset?: number;
      search?: string;
      lastDoc?: QueryDocumentSnapshot<DocumentData>;
    } = {}
  ): Promise<{
    tracks: MusicTrack[];
    hasMore: boolean;
    lastDoc?: QueryDocumentSnapshot<DocumentData>;
  }> {
    const { limit: pageLimit = 20, search, lastDoc } = options;

    const tracksCollection = getTracksCollection();
    let trackQuery = query(
      tracksCollection,
      orderBy('createdAt', 'desc'),
      limit(pageLimit + 1) // Get one extra to check if there are more
    );

    // Add search filter if provided
    if (search) {
      const searchLower = search.toLowerCase();
      trackQuery = query(
        tracksCollection,
        where('title', '>=', searchLower),
        where('title', '<=', searchLower + '\uf8ff'),
        limit(pageLimit + 1)
      );
    }

    // Add pagination if lastDoc provided
    if (lastDoc) {
      trackQuery = query(trackQuery, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(trackQuery);
    logFirestoreRead(`getTracks${search ? ' (search)' : ''}`, 1);
    const docs = querySnapshot.docs;
    const hasMore = docs.length > pageLimit;

    // Remove the extra document if we have more
    if (hasMore) {
      docs.pop();
    }

    const tracks = docs.map((doc) => {
      const data = doc.data() as FirestoreTrack;
      return this.convertFirestoreTrackToMusicTrack(data);
    });

    return {
      tracks,
      hasMore,
      lastDoc: docs.length > 0 ? docs[docs.length - 1] : undefined,
    };
  }

  /**
   * Get user's liked tracks for efficient like status checking (1 read)
   */
  static async getUserLikes(userId: string): Promise<Set<string>> {
    try {
      const userLikesDoc = await getDoc(doc(getUserLikesCollection(), userId));
      logFirestoreRead('getUserLikes', 1);

      if (userLikesDoc.exists()) {
        const data = userLikesDoc.data() as UserLikes;
        return new Set(Object.keys(data.likedTracks || {}));
      }

      return new Set();
    } catch (error) {
      console.error('Error getting user likes:', error);
      return new Set();
    }
  }

  /**
   * Get tracks with user's like status (2 reads total)
   */
  static async getTracksWithLikes(
    userId: string,
    options: {
      limit?: number;
      search?: string;
      lastDoc?: QueryDocumentSnapshot<DocumentData>;
    } = {}
  ): Promise<{
    tracks: MusicTrack[];
    hasMore: boolean;
    lastDoc?: QueryDocumentSnapshot<DocumentData>;
  }> {
    // Get tracks (1 read)
    const { tracks, hasMore, lastDoc } = await this.getTracks(options);

    // Get user likes (1 read)
    const userLikedTracks = await this.getUserLikes(userId);

    // Add isLiked property to tracks
    const tracksWithLikes = tracks.map((track) => ({
      ...track,
      isLiked: userLikedTracks.has(track.id),
    }));

    return {
      tracks: tracksWithLikes,
      hasMore,
      lastDoc,
    };
  }

  /**
   * Get single track by ID
   */
  static async getTrackById(trackId: string): Promise<MusicTrack | null> {
    try {
      const trackDoc = await getDoc(doc(getTracksCollection(), trackId));

      if (trackDoc.exists()) {
        const data = trackDoc.data() as FirestoreTrack;
        return this.convertFirestoreTrackToMusicTrack(data);
      }

      return null;
    } catch (error) {
      console.error('Error getting track:', error);
      return null;
    }
  }

  /**
   * Convert Firestore track to MusicTrack type
   */
  private static convertFirestoreTrackToMusicTrack(data: FirestoreTrack): MusicTrack {
    return {
      id: data.id,
      title: data.title,
      artist: data.artist,
      album: data.album,
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
   * Toggle like for a track (Atomic transaction - 1 read + 3 writes)
   */
  static async toggleTrackLike(
    trackId: string,
    userId: string,
    userName: string,
    trackTitle: string
  ): Promise<{ likeCount: number; isLiked: boolean }> {
    return runTransaction(getDb(), async (transaction) => {
      // Read current state
      const userLikesRef = doc(getUserLikesCollection(), userId);
      const trackRef = doc(getTracksCollection(), trackId);
      const trackLikesRef = doc(getTrackLikesCollection(), trackId);

      const [userLikesDoc, trackDoc, trackLikesDoc] = await Promise.all([
        transaction.get(userLikesRef),
        transaction.get(trackRef),
        transaction.get(trackLikesRef),
      ]);
      logFirestoreRead('toggleTrackLike (transaction)', 3);

      const userData = userLikesDoc.exists()
        ? (userLikesDoc.data() as UserLikes)
        : {
            userId,
            likedTracks: {},
            lastUpdated: serverTimestamp() as Timestamp,
          };

      const trackData = trackDoc.data() as FirestoreTrack;
      const trackLikesData = trackLikesDoc.exists()
        ? (trackLikesDoc.data() as TrackLikes)
        : {
            trackId,
            count: 0,
            users: {},
            lastUpdated: serverTimestamp() as Timestamp,
          };

      const isCurrentlyLiked = userData.likedTracks[trackId] !== undefined;
      const newIsLiked = !isCurrentlyLiked;
      let newLikeCount = trackData.likeCount || 0;

      if (newIsLiked) {
        // Add like
        userData.likedTracks[trackId] = {
          likedAt: serverTimestamp() as Timestamp,
          trackTitle,
        };
        trackLikesData.users[userId] = {
          likedAt: serverTimestamp() as Timestamp,
        };
        trackLikesData.count += 1;
        newLikeCount += 1;
      } else {
        // Remove like
        delete userData.likedTracks[trackId];
        delete trackLikesData.users[userId];
        trackLikesData.count = Math.max(0, trackLikesData.count - 1);
        newLikeCount = Math.max(0, newLikeCount - 1);
      }

      // Update documents
      userData.lastUpdated = serverTimestamp() as Timestamp;
      trackLikesData.lastUpdated = serverTimestamp() as Timestamp;

      transaction.set(userLikesRef, userData);
      transaction.set(trackLikesRef, trackLikesData);
      transaction.update(trackRef, {
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
   * Get track like info (if needed separately)
   */
  static async getTrackLikes(
    trackId: string,
    userId?: string
  ): Promise<{ likeCount: number; isLiked: boolean }> {
    try {
      const [trackDoc, userLikesDoc] = await Promise.all([
        getDoc(doc(getTracksCollection(), trackId)),
        userId ? getDoc(doc(getUserLikesCollection(), userId)) : Promise.resolve(null),
      ]);

      const likeCount = trackDoc.exists() ? trackDoc.data().likeCount || 0 : 0;
      let isLiked = false;

      if (userId && userLikesDoc?.exists()) {
        const userData = userLikesDoc.data() as UserLikes;
        isLiked = userData.likedTracks[trackId] !== undefined;
      }

      return { likeCount, isLiked };
    } catch (error) {
      console.error('Error getting track likes:', error);
      return { likeCount: 0, isLiked: false };
    }
  }
}

/**
 * Comment Services - Optimized for minimal reads
 */
export class FirestoreCommentService {
  /**
   * Get comments for a track with pagination (1 read)
   */
  static async getTrackComments(
    trackId: string,
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
      where('trackId', '==', trackId),
      orderBy('createdAt', 'desc'),
      limit(pageLimit + 1)
    );

    if (lastDoc) {
      commentQuery = query(commentQuery, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(commentQuery);
    logFirestoreRead('getTrackComments', 1);
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
   * Add comment to a track (Atomic transaction - 2 writes)
   */
  static async addComment(
    trackId: string,
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
      const trackRef = doc(getTracksCollection(), trackId);
      const commentRef = doc(commentsCollection, commentId);

      // Create composite field for efficient sorting
      const now = new Date();
      const trackId_createdAt = `${trackId}_${now.getTime()}`;

      const commentData: FirestoreComment = {
        id: commentId,
        trackId,
        userId,
        userName,
        userAvatar,
        content,
        createdAt,
        likes: 0,
        trackId_createdAt,
      };

      // Add comment and increment counter
      transaction.set(commentRef, commentData);
      transaction.update(trackRef, {
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
