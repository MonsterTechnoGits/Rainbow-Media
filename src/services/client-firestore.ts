// Simple client-only Firestore service - no admin SDK needed
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore';

import { getDbInstance } from '@/lib/firebase';

export class ClientFirestoreService {
  static async toggleStoryLike(
    storyId: string,
    userId: string,
    userName: string,
    storyTitle: string
  ): Promise<{ likeCount: number; isLiked: boolean }> {
    try {
      if (!getDbInstance()) {
        throw new Error('Firestore not initialized');
      }

      console.log('Toggling like for story:', storyId, 'by user:', userId);

      // Access story document directly using the UUID as document ID
      const storyRef = doc(getDbInstance(), 'stories', storyId);
      const userLikeRef = doc(getDbInstance(), 'user-likes', `${userId}_${storyId}`);

      // Check if user already liked this story
      const userLikeDoc = await getDoc(userLikeRef);
      const isCurrentlyLiked = userLikeDoc.exists() && userLikeDoc.data()?.isLiked === true;

      console.log('Current like status:', isCurrentlyLiked);

      if (isCurrentlyLiked) {
        // Unlike
        await setDoc(userLikeRef, {
          userId,
          storyId,
          storyTitle,
          userName,
          isLiked: false,
          updatedAt: serverTimestamp(),
        });

        await updateDoc(storyRef, {
          likeCount: increment(-1),
          updatedAt: serverTimestamp(),
        });

        // Get updated like count
        const updatedStoryDoc = await getDoc(storyRef);
        const likeCount = updatedStoryDoc.exists() ? updatedStoryDoc.data()?.likeCount || 0 : 0;

        console.log('Unliked - new count:', likeCount);
        return { likeCount, isLiked: false };
      } else {
        // Like
        await setDoc(userLikeRef, {
          userId,
          storyId,
          storyTitle,
          userName,
          isLiked: true,
          likedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        await updateDoc(storyRef, {
          likeCount: increment(1),
          updatedAt: serverTimestamp(),
        });

        // Get updated like count
        const updatedStoryDoc = await getDoc(storyRef);
        const likeCount = updatedStoryDoc.exists() ? updatedStoryDoc.data()?.likeCount || 0 : 1;

        console.log('Liked - new count:', likeCount);
        return { likeCount, isLiked: true };
      }
    } catch (error) {
      console.error('Error toggling story like:', error);
      // Return a reasonable fallback
      return { likeCount: 0, isLiked: false };
    }
  }

  static async getStoryLikes(
    storyId: string,
    userId?: string
  ): Promise<{ likeCount: number; isLiked: boolean }> {
    try {
      if (!getDbInstance()) {
        throw new Error('Firestore not initialized');
      }

      // Access story document directly using the UUID as document ID
      const storyRef = doc(getDbInstance(), 'stories', storyId);
      const storyDoc = await getDoc(storyRef);

      const likeCount = storyDoc.exists() ? storyDoc.data()?.likeCount || 0 : 0;
      let isLiked = false;

      if (userId) {
        const userLikeRef = doc(getDbInstance(), 'user-likes', `${userId}_${storyId}`);
        const userLikeDoc = await getDoc(userLikeRef);
        isLiked = userLikeDoc.exists() && userLikeDoc.data()?.isLiked === true;
      }

      return { likeCount, isLiked };
    } catch (error) {
      console.error('Error getting story likes:', error);
      return { likeCount: 0, isLiked: false };
    }
  }

  static async addComment(
    storyId: string,
    userId: string,
    userName: string,
    userAvatar: string,
    content: string
  ) {
    try {
      if (!getDbInstance()) {
        throw new Error('Firestore not initialized');
      }

      console.log('Adding comment to story:', storyId, 'by user:', userId);

      // Access story document directly using the UUID as document ID
      const storyRef = doc(getDbInstance(), 'stories', storyId);
      const commentsRef = collection(getDbInstance(), 'comments');

      const commentData = {
        storyId,
        userId,
        userName,
        userAvatar,
        content,
        timestamp: Date.now(),
        createdAt: serverTimestamp(),
        likes: 0,
        replies: [],
      };

      const docRef = await addDoc(commentsRef, commentData);

      // Update story comment count using the direct story reference
      await updateDoc(storyRef, {
        commentCount: increment(1),
        updatedAt: serverTimestamp(),
      });

      console.log('Comment added with ID:', docRef.id);

      return {
        id: docRef.id,
        ...commentData,
        timestamp: Date.now(), // Use current timestamp since serverTimestamp() isn't available yet
      };
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  static async getStoryComments(storyId: string, options: { limit?: number } = {}) {
    try {
      if (!getDbInstance()) {
        throw new Error('Firestore not initialized');
      }

      console.log('Getting comments for story:', storyId);

      const commentsRef = collection(getDbInstance(), 'comments');
      const q = query(
        commentsRef,
        where('storyId', '==', storyId),
        orderBy('createdAt', 'desc'),
        limit(options.limit || 20)
      );

      const querySnapshot = await getDocs(q);
      const comments = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log('Found comments:', comments.length);

      return {
        comments,
        hasMore: querySnapshot.docs.length === (options.limit || 20),
      };
    } catch (error) {
      console.error('Error getting story comments:', error);
      return {
        comments: [],
        hasMore: false,
      };
    }
  }
}
