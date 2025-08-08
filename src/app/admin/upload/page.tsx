'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import UploadStoryView from '@/views/upload-page';

export default function UploadPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if not authenticated or not admin
    if (!loading && (!user || !user.isAdmin)) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Show loading while checking auth
  if (loading) {
    return <div>Loading...</div>;
  }

  // Redirect if not authorized
  if (!user || !user.isAdmin) {
    return null;
  }

  return <UploadStoryView />;
}
