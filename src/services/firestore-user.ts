import { doc, setDoc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';

import { getDbInstance } from '@/lib/firebase';
import { User, PurchaseDetails, DonationDetails } from '@/types/audio-story';

// User service functions
export const userService = {
  // Get user data by UID
  async getUser(uid: string): Promise<User | null> {
    if (!getDbInstance()) throw new Error('Firebase not initialized');

    const userRef = doc(getDbInstance(), 'users', uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return null;
    }

    return userSnap.data() as User;
  },

  // Create or get existing user
  async createUser(userData: User): Promise<User> {
    if (!getDbInstance()) throw new Error('Firebase not initialized');

    const userRef = doc(getDbInstance(), 'users', userData.uid);
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
    if (!getDbInstance()) throw new Error('Firebase not initialized');

    const userRef = doc(getDbInstance(), 'users', uid);
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
    if (!getDbInstance()) throw new Error('Firebase not initialized');

    const purchaseRef = doc(getDbInstance(), 'purchases', purchaseData.paymentId);
    await setDoc(purchaseRef, purchaseData);
    return purchaseData.paymentId;
  },
};

// Donation service functions
export const donationService = {
  // Store donation details in firestore
  async storeDonation(
    donationData: DonationDetails & {
      userId: string;
      userEmail: string;
      userName?: string;
    }
  ): Promise<string> {
    if (!getDbInstance()) throw new Error('Firebase not initialized');

    // Store in donations collection
    const donationsRef = collection(getDbInstance(), 'donations');
    const donationDoc = await addDoc(donationsRef, {
      ...donationData,
      createdAt: serverTimestamp(),
    });

    // Also store in payment history collection for the story
    const paymentHistoryRef = collection(
      getDbInstance(),
      'stories',
      donationData.storyId,
      'paymentHistory'
    );
    await addDoc(paymentHistoryRef, {
      type: 'donation',
      userId: donationData.userId,
      userEmail: donationData.userEmail,
      userName: donationData.userName || 'Anonymous',
      amount: donationData.amount,
      currency: donationData.currency,
      paymentId: donationData.paymentId,
      orderId: donationData.orderId,
      timestamp: donationData.timestamp,
      createdAt: serverTimestamp(),
    });

    return donationDoc.id;
  },

  // Store purchase in story's payment history (for analytics)
  async storePurchaseHistory(
    purchaseData: PurchaseDetails & {
      userId: string;
      userEmail: string;
      userName?: string;
      trackTitle: string;
      trackArtist: string;
    }
  ): Promise<void> {
    if (!getDbInstance()) throw new Error('Firebase not initialized');

    const paymentHistoryRef = collection(
      getDbInstance(),
      'stories',
      purchaseData.storyId,
      'paymentHistory'
    );
    await addDoc(paymentHistoryRef, {
      type: 'purchase',
      userId: purchaseData.userId,
      userEmail: purchaseData.userEmail,
      userName: purchaseData.userName || 'Anonymous',
      amount: purchaseData.amount,
      currency: purchaseData.currency,
      paymentId: purchaseData.paymentId,
      orderId: purchaseData.orderId,
      timestamp: purchaseData.timestamp,
      createdAt: serverTimestamp(),
    });
  },
};
