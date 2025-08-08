// lib/firebaseClient.ts
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;
let storage: FirebaseStorage;

// Initialize Firebase App
function initFirebase(): FirebaseApp {
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    throw new Error('Firebase config is missing in environment variables.');
  }

  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  };

  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);

  return app;
}

// Ensure Firebase is initialized before accessing services
function getFirebaseApp(): FirebaseApp {
  if (!app) initFirebase();
  return app;
}

function getDbInstance(): Firestore {
  if (!db) initFirebase();
  return db;
}

function getAuthInstance(): Auth {
  if (!auth) initFirebase();
  return auth;
}

function getStorageInstance(): FirebaseStorage {
  if (!storage) initFirebase();
  return storage;
}

export { getFirebaseApp, getDbInstance, getAuthInstance, getStorageInstance };
