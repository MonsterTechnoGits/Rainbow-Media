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
import { useUrlTrackLoader } from '@/hooks/useUrlTrackLoader';
import { trackApi } from '@/services/api';
import { MusicTrack } from '@/types/music';

export default function HomePageView() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { loading: authLoading } = useAuth();

  // Handle URL-based track loading with authentication
  useUrlTrackLoader();

  const handleSettings = () => {
    setSettingsOpen(true);
  };

  const handleSettingsClose = () => {
    setSettingsOpen(false);
  };

  // Fetch tracks from API
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await trackApi.getTracks({
          q: searchQuery.trim() || undefined,
        });
        setTracks(response.tracks);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tracks');
      } finally {
        setLoading(false);
      }
    };

    fetchTracks();
  }, [searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filteredTracks = tracks;

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
          {error}
        </Typography>
        <Button variant="contained" onClick={() => window.location.reload()} sx={{ mt: 2 }}>
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
          <MusicList tracks={filteredTracks} />
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
