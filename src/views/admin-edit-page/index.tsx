'use client';

import { ArrowBack } from '@mui/icons-material';
import { Box, Button, CircularProgress, Paper, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';

import StoryForm from '@/components/StoryForm';
import Toolbar from '@/components/Toolbar';
import { useToast } from '@/contexts/ToastContext';
import { useApi } from '@/hooks/use-api-query-hook';
import { adminApi } from '@/services/api';
import { AudioStory } from '@/types/audio-story';

interface AdminEditStoryViewProps {
  storyId: string;
}

export default function AdminEditStoryView({ storyId }: AdminEditStoryViewProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const { useApiQuery } = useApi();
  const [story, setStory] = useState<AudioStory | null>(null);

  // Load story data using the API hook
  const {
    data: storyData,
    isLoading,
    error,
  } = useApiQuery({
    queryKey: ['admin-story', storyId],
    queryFn: () => adminApi.getStory(storyId),
    enabled: !!storyId,
  });

  // Update story state when data changes
  useEffect(() => {
    const data = storyData?.data as { story?: AudioStory };
    if (data?.story) {
      setStory(data.story);
    }
  }, [storyData]);

  // Handle errors
  useEffect(() => {
    if (error) {
      console.error('Error loading story:', error);
      showToast('Failed to load story', 'error');
      router.push('/admin');
    }
  }, [error, showToast, router]);

  const handleSuccess = (message: string) => {
    showToast(message, 'success');

    // Redirect to admin page after successful update
    setTimeout(() => {
      router.push('/admin');
    }, 1500);
  };

  // Loading state
  if (isLoading || !story) {
    return (
      <>
        <Toolbar title="Edit Story" showBackButton={true} />
        <Box sx={{ pt: { xs: 9, sm: 12 }, pb: 4, px: { xs: 2, sm: 3, md: 4 } }}>
          <Paper sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Loading story details...
            </Typography>
          </Paper>
        </Box>
      </>
    );
  }

  return (
    <>
      <Toolbar
        title={`Edit: ${story?.title || 'Story'}`}
        showBackButton={true}
        singleAction={
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => router.push('/admin')}
          >
            Back to Admin
          </Button>
        }
      />
      <Box sx={{ pt: { xs: 9, sm: 12 }, pb: 4, px: { xs: 2, sm: 3, md: 4 } }}>
        <StoryForm mode="edit" storyId={storyId} story={story} onSuccess={handleSuccess} />
      </Box>
    </>
  );
}
