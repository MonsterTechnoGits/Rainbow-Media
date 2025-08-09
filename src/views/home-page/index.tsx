'use client';

import { Box, Container, Typography, Button } from '@mui/material';
import { useState, useEffect, useMemo } from 'react';

import AuthDrawer from '@/components/AuthDrawer';
import ClientOnly from '@/components/ClientOnly';
import CommentDrawer from '@/components/CommentDrawer';
import ExpandedPlayer from '@/components/ExpandedPlayer';
import LoadingScreen from '@/components/loading-screen';
import MiniPlayer from '@/components/MiniPlayer';
import SettingsDrawer from '@/components/SettingsDrawer';
import StoryList from '@/components/StoryList';
import Toolbar from '@/components/Toolbar';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { useAuth } from '@/contexts/AuthContext';
import { useStoryLikesContext } from '@/contexts/StoryLikesContext';
import { useApi } from '@/hooks/use-api-query-hook';
import { useUrlStoryLoader } from '@/hooks/use-url-story-loader';
import { storyApi } from '@/services/api';
import { AudioStory } from '@/types/audio-story';

export default function HomePageView() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, loading: authLoading } = useAuth();
  const { useApiQuery } = useApi();
  const { initializeLikes } = useStoryLikesContext();
  const { showAuthDrawer, setShowAuthDrawer } = useAudioPlayer();

  // Handle URL-based story loading with authentication
  useUrlStoryLoader();

  const handleSettings = () => {
    setSettingsOpen(true);
  };

  const handleSettingsClose = () => {
    setSettingsOpen(false);
  };

  // Fetch stories using the custom hook with user ID for optimized like data
  const {
    data: storiesResponse,
    isLoading: loading,
    error,
    refetch,
  } = useApiQuery({
    queryKey: ['stories', searchQuery, user?.uid],
    queryFn: () =>
      storyApi.getStories({
        q: searchQuery.trim() || undefined,
        userId: user?.uid, // Pass userId for optimized like state
      }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: true,
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const stories = useMemo(() => {
    return ((storiesResponse?.data as { stories: AudioStory[] })?.stories || []) as AudioStory[];
  }, [storiesResponse]);

  // Initialize like states when stories are loaded
  useEffect(() => {
    if (stories.length > 0) {
      initializeLikes(stories);
    }
  }, [stories, initializeLikes]);

  // Show loading screen while authentication or tracks are loading
  if (authLoading || loading) {
    return <LoadingScreen />;
  }

  // Show error state if tracks failed to load
  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error" gutterBottom>
          Failed to load tracks
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {error.message || 'An error occurred'}
        </Typography>
        <Button variant="contained" onClick={() => refetch()} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <>
      <Toolbar
        onSearch={handleSearch}
        searchPlaceholder="Search songs, artists, albums..."
        singleAction={{
          icon: 'material-symbols:settings',
          onClick: handleSettings,
          tooltip: 'Settings',
        }}
      />

      <Container
        maxWidth="lg"
        sx={{
          height: { xs: '100dvh', sm: '100vh' },
          maxHeight: { xs: '100dvh', sm: '100vh' },
          display: 'flex',
          flexDirection: 'column',
          pt: { xs: 8, sm: 10, md: 12 }, // Responsive padding for toolbar
          pb: { xs: 7, sm: 8, md: 10 }, // Responsive padding for mini player
          px: { xs: 0.5, sm: 1, md: 2 },
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}
        >
          <StoryList stories={stories} />
        </Box>
      </Container>

      {/* Audio Story Player Components */}
      <ClientOnly>
        <MiniPlayer />
        <ExpandedPlayer />
        <CommentDrawer />
        <SettingsDrawer open={settingsOpen} onClose={handleSettingsClose} />
        <AuthDrawer
          open={showAuthDrawer}
          onClose={() => setShowAuthDrawer(false)}
          onAuthSuccess={() => setShowAuthDrawer(false)}
        />
      </ClientOnly>
    </>
  );
}
