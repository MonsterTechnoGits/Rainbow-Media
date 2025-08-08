// lib/verifyToken.ts
import { NextRequest } from 'next/server';

import { userService } from '@/services/firestore-user';

import { adminAuth } from './firebaseAdmin';

export async function verifyToken(req: NextRequest) {
  const authHeader = req.headers.get('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return { error: 'Missing Authorization header' };
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    if (!decodedToken) {
      return { error: 'Invalid token' };
    }
    // 1️⃣ Get UID from decoded token
    const uid = decodedToken.uid;
    // 2️⃣ Get Auth user data
    const authUser = await userService.getUser(uid);

    return { decodedToken, authUser }; // contains uid, email, etc.
  } catch (error) {
    return { error };
  }
}
