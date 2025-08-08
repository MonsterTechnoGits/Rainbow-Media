'use client';

import { Box } from '@mui/material';
import { useRouter } from 'next/navigation';
import React from 'react';

import StoryForm from '@/components/StoryForm';
import Toolbar from '@/components/Toolbar';
import UploadButton from '@/components/UploadButton';
import { useToast } from '@/contexts/ToastContext';

export default function UploadStoryView() {
  const router = useRouter();
  const { showToast } = useToast();

  const handleSuccess = (message: string) => {
    showToast(message, 'success');

    // Redirect to admin page after successful upload
    setTimeout(() => {
      router.push('/admin');
    }, 1500);
  };

  return (
    <>
      <Toolbar title="Upload Story" showBackButton={true} singleAction={<UploadButton />} />
      <Box sx={{ pt: { xs: 9, sm: 12 }, pb: 4, px: { xs: 2, sm: 3, md: 4 } }}>
        <StoryForm mode="create" onSuccess={handleSuccess} />
      </Box>
    </>
  );
}
