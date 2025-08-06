'use client';

import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { auth, db } from '@/lib/firebase';
import { User } from '@/types/music';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithGoogleRedirect: () => Promise<void>;
  signOut: () => Promise<void>;
  hasPurchased: (trackId: string) => boolean;
  addPurchase: (trackId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  const isMobile = () => {
    if (typeof window === 'undefined') return false;
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      window.innerWidth <= 768
    );
  };

  const createUserDocument = async (firebaseUser: FirebaseUser): Promise<User> => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const userData: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName || '',
        photoURL: firebaseUser.photoURL || '',
        purchases: [],
      };

      await setDoc(userRef, userData);
      return userData;
    }

    return userSnap.data() as User;
  };

  const signInWithGoogle = async () => {
    // On mobile devices, use redirect method directly for better reliability
    if (isMobile()) {
      console.log('Mobile device detected, using redirect method for better compatibility');
      return await signInWithGoogleRedirect();
    }

    try {
      const provider = new GoogleAuthProvider();

      // Configure the provider to ensure compatibility
      provider.addScope('email');
      provider.addScope('profile');

      // Set custom parameters to avoid "browser not supported" errors
      provider.setCustomParameters({
        prompt: 'select_account',
      });

      const result = await signInWithPopup(auth, provider);
      const userData = await createUserDocument(result.user);
      setUser(userData);
    } catch (error: unknown) {
      console.error('Error signing in with Google:', error);
      const firebaseError = error as { code?: string; message?: string };

      // Handle specific Firebase Auth errors
      if (firebaseError.code === 'auth/popup-blocked') {
        console.log('Popup blocked, falling back to redirect method');
        return await signInWithGoogleRedirect();
      } else if (firebaseError.code === 'auth/popup-closed-by-user') {
        console.log('Popup closed by user, trying redirect method as fallback');
        return await signInWithGoogleRedirect();
      } else if (firebaseError.code === 'auth/operation-not-supported-in-this-environment') {
        // Fallback to redirect method
        console.log('Popup not supported, falling back to redirect...');
        return await signInWithGoogleRedirect();
      } else if (firebaseError.code === 'auth/unauthorized-domain') {
        throw new Error('This domain is not authorized for Google Sign-In.');
      }

      throw error;
    }
  };

  const signInWithGoogleRedirect = async () => {
    try {
      const provider = new GoogleAuthProvider();

      // Configure the provider to ensure compatibility
      provider.addScope('email');
      provider.addScope('profile');

      provider.setCustomParameters({
        prompt: 'select_account',
      });

      await signInWithRedirect(auth, provider);
      // The redirect will happen, and the result will be handled in useEffect
    } catch (error: unknown) {
      console.error('Error with redirect sign-in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
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

    const updatedUser = {
      ...user,
      purchases: [...user.purchases, trackId],
    };

    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, updatedUser, { merge: true });
    setUser(updatedUser);
  };

  useEffect(() => {
    // Check for redirect result first
    getRedirectResult(auth)
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

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
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
    signInWithGoogleRedirect,
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
