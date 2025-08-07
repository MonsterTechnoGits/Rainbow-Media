import { doc, setDoc, getDoc } from 'firebase/firestore';

import { db } from '@/lib/firebase';
import { User, PurchaseDetails } from '@/types/music';

// User service functions
export const userService = {
  // Get user data by UID
  async getUser(uid: string): Promise<User | null> {
    if (!db) throw new Error('Firebase not initialized');

    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return null;
    }

    return userSnap.data() as User;
  },

  // Create or get existing user
  async createUser(userData: User): Promise<User> {
    if (!db) throw new Error('Firebase not initialized');

    const userRef = doc(db, 'users', userData.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // Create new user
      const newUserData: User = {
        uid: userData.uid,
        email: userData.email,
        displayName: userData.displayName || '',
        photoURL: userData.photoURL || '',
        purchases: [],
      };

      await setDoc(userRef, newUserData);
      return newUserData;
    } else {
      // Return existing user
      return userSnap.data() as User;
    }
  },
};

// Purchase service functions
export const purchaseService = {
  // Add purchase to user account
  async addPurchase(uid: string, trackId: string, updatedUser: User): Promise<User> {
    if (!db) throw new Error('Firebase not initialized');

    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, updatedUser, { merge: true });
    return updatedUser;
  },

  // Store purchase details
  async storePurchaseDetails(
    purchaseData: PurchaseDetails & {
      userId: string;
      trackTitle: string;
      trackArtist: string;
      paymentId: string;
    }
  ): Promise<string> {
    if (!db) throw new Error('Firebase not initialized');

    const purchaseRef = doc(db, 'purchases', purchaseData.paymentId);
    await setDoc(purchaseRef, purchaseData);
    return purchaseData.paymentId;
  },
};
