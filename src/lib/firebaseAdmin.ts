// lib/firebaseAdmin.ts
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  // Check if we have service account credentials
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (privateKey && clientEmail && projectId) {
    // Use service account credentials
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } else if (projectId) {
    // Fallback to application default with explicit project ID
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId,
    });
  } else {
    // Last resort - try application default (may fail in some environments)
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  }
}

export const adminAuth = admin.auth();
