'use client';

import { Box, Container } from '@mui/material';
import { useState, useMemo } from 'react';

import CommentDrawer from '@/components/CommentDrawer';
import ExpandedPlayer from '@/components/ExpandedPlayer';
import MiniPlayer from '@/components/MiniPlayer';
import MusicList from '@/components/MusicList';
import SettingsDrawer from '@/components/SettingsDrawer';
import Toolbar from '@/components/Toolbar';
import { mockMusicTracks } from '@/data/musicData';
import { MusicTrack } from '@/types/music';

export default function HomePageView() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSettings = () => {
    setSettingsOpen(true);
  };

  const handleSettingsClose = () => {
    setSettingsOpen(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Filter tracks based on search query
  const filteredTracks = useMemo(() => {
    if (!searchQuery.trim()) {
      return mockMusicTracks;
    }

    const lowercaseQuery = searchQuery.toLowerCase();
    return mockMusicTracks.filter(
      (track: MusicTrack) =>
        track.title.toLowerCase().includes(lowercaseQuery) ||
        track.artist.toLowerCase().includes(lowercaseQuery) ||
        track.album.toLowerCase().includes(lowercaseQuery)
    );
  }, [searchQuery]);

  const displayTitle = searchQuery.trim()
    ? `Found ${filteredTracks.length} track${filteredTracks.length !== 1 ? 's' : ''}`
    : 'Your Music Collection';

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
        maxWidth="md"
        sx={{
          pt: 12, // Padding for fixed toolbar card design
          pb: 12, // Extra padding for mini player
          minHeight: '100vh',
        }}
      >
        <Box sx={{ py: 2 }}>
          <MusicList tracks={filteredTracks} title={displayTitle} />
        </Box>
      </Container>

      {/* Music Player Components */}
      <MiniPlayer />
      <ExpandedPlayer />
      <CommentDrawer />

      <SettingsDrawer open={settingsOpen} onClose={handleSettingsClose} />
    </>
  );
}
