'use client';

import { Box, Container, Typography, Button } from '@mui/material';
import { useState, useEffect } from 'react';

import ClientOnly from '@/components/ClientOnly';
import CommentDrawer from '@/components/CommentDrawer';
import ExpandedPlayer from '@/components/ExpandedPlayer';
import LoadingScreen from '@/components/loading-screen';
import MiniPlayer from '@/components/MiniPlayer';
import MusicList from '@/components/MusicList';
import SettingsDrawer from '@/components/SettingsDrawer';
import Toolbar from '@/components/Toolbar';
import { useAuth } from '@/contexts/AuthContext';
import { useTrackLikesContext } from '@/contexts/TrackLikesContext';
import { useApi } from '@/hooks/use-api-query-hook';
import { useUrlTrackLoader } from '@/hooks/useUrlTrackLoader';
import { trackApi } from '@/services/api';
import { MusicTrack } from '@/types/music';

export default function HomePageView() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, loading: authLoading } = useAuth();
  const { useApiQuery } = useApi();
  const { initializeLikes } = useTrackLikesContext();

  // Handle URL-based track loading with authentication
  useUrlTrackLoader();

  const handleSettings = () => {
    setSettingsOpen(true);
  };

  const handleSettingsClose = () => {
    setSettingsOpen(false);
  };

  // Fetch tracks using the custom hook with user ID for optimized like data
  const {
    data: tracksResponse,
    isLoading: loading,
    error,
    refetch,
  } = useApiQuery({
    queryKey: ['tracks', searchQuery, user?.uid],
    queryFn: () =>
      trackApi.getTracks({
        q: searchQuery.trim() || undefined,
        userId: user?.uid, // Pass userId for optimized like state
      }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: true,
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const tracks = ((tracksResponse?.data as { tracks: MusicTrack[] })?.tracks || []) as MusicTrack[];

  // Initialize like states when tracks are loaded
  useEffect(() => {
    if (tracks.length > 0) {
      initializeLikes(tracks);
    }
  }, [tracks, initializeLikes]);

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
        title="RainbowMedia"
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
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          pt: { xs: 9, sm: 12 }, // Responsive padding for toolbar
          pb: { xs: 8, sm: 10 }, // Responsive padding for mini player
          px: { xs: 1, sm: 2 },
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
          <MusicList tracks={tracks} />
        </Box>
      </Container>

      {/* Music Player Components */}
      <ClientOnly>
        <MiniPlayer />
        <ExpandedPlayer />
        <CommentDrawer />
        <SettingsDrawer open={settingsOpen} onClose={handleSettingsClose} />
      </ClientOnly>
    </>
  );
}
