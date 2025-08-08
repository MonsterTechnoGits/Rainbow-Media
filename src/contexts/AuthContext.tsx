'use client';

import {
  signInWithPopup,
  getRedirectResult,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { getAuthInstance } from '@/lib/firebase';
import { userService, purchaseService } from '@/services/firestore-user';
import { User } from '@/types/audio-story';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  hasPurchased: (trackId: string) => boolean;
  addPurchase: (trackId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  const createUserDocument = async (firebaseUser: FirebaseUser): Promise<User> => {
    try {
      const userData: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName || '',
        photoURL: firebaseUser.photoURL || '',
        purchases: [],
        isAdmin: false, // Default to false, can be manually updated in Firestore
      };

      return await userService.createUser(userData);
    } catch (error) {
      console.error('Error creating user document via service:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    if (!getAuthInstance()) throw new Error('Firebase not initialized');

    try {
      const provider = new GoogleAuthProvider();

      // Configure the provider to ensure compatibility
      provider.addScope('email');
      provider.addScope('profile');

      const result = await signInWithPopup(getAuthInstance(), provider);
      const userData = await createUserDocument(result.user);
      setUser(userData);
    } catch (error: unknown) {
      console.error('Error signing in with Google:', error);
      const firebaseError = error as { code?: string; message?: string };

      if (firebaseError.code === 'getAuthInstance()/unauthorized-domain') {
        throw new Error('This domain is not authorized for Google Sign-In.');
      }

      throw error;
    }
  };

  const signOut = async () => {
    if (!getAuthInstance()) throw new Error('Firebase not initialized');

    try {
      await firebaseSignOut(getAuthInstance());
      setUser(null);
      setFirebaseUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const hasPurchased = (trackId: string): boolean => {
    return user?.purchases.includes(trackId) || false;
  };

  const addPurchase = async (trackId: string) => {
    if (!user) return;

    try {
      const updatedUser = {
        ...user,
        purchases: [...user.purchases, trackId],
      };

      const result = await purchaseService.addPurchase(user.uid, trackId, updatedUser);
      setUser(result);
    } catch (error) {
      console.error('Error adding purchase via service:', error);
      throw error;
    }
  };

  useEffect(() => {
    // Skip authentication setup if Firebase is not available (during build)
    if (!getAuthInstance()) {
      setLoading(false);
      return;
    }

    // Check for redirect result first
    getRedirectResult(getAuthInstance())
      .then(async (result) => {
        if (result?.user) {
          console.log('Redirect sign-in successful');
          const userData = await createUserDocument(result.user);
          setUser(userData);
        }
      })
      .catch((error) => {
        console.error('Redirect sign-in error:', error);
      });

    const unsubscribe = onAuthStateChanged(getAuthInstance(), async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setFirebaseUser(firebaseUser);
        try {
          const userData = await createUserDocument(firebaseUser);
          setUser(userData);
        } catch (error) {
          console.error('Error creating user document:', error);
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    signInWithGoogle,
    signOut,
    hasPurchased,
    addPurchase,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
