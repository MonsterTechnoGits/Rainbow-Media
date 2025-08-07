'use client';

import { PlayArrow, Pause, MoreVert, Favorite, Comment as CommentIcon } from '@mui/icons-material';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Typography,
  IconButton,
  useTheme,
  CircularProgress,
  Stack,
  Paper,
  alpha,
  Chip,
} from '@mui/material';
import React from 'react';

import AuthDrawer from '@/components/AuthDrawer';
import Iconify from '@/components/iconify';
import PaymentDrawer from '@/components/PaymentDrawer';
import { useAuth } from '@/contexts/AuthContext';
import { useComments } from '@/contexts/CommentContext';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { formatDuration } from '@/data/musicData';
import { MusicTrack } from '@/types/music';

interface MusicListProps {
  tracks: MusicTrack[];
}

const MusicList: React.FC<MusicListProps> = ({ tracks }) => {
  const {
    state,
    playTrack,
    pauseTrack,
    resumeTrack,
    showAuthDrawer,
    setShowAuthDrawer,
    showPaymentDrawer,
    setShowPaymentDrawer,
    pendingTrack,
    setPendingTrack,
    cancelAndCloseAll,
  } = useMusicPlayer();
  const { user, hasPurchased } = useAuth();
  const { getTrackLike, getTrackComments, loadTrackData } = useComments();
  const theme = useTheme();

  // Load track data (likes and comments) for all tracks when component mounts
  React.useEffect(() => {
    tracks.forEach((track) => {
      loadTrackData(track.id);
    });
  }, [tracks, loadTrackData]);

  const handleTrackClick = (track: MusicTrack) => {
    // If it's the same track, just toggle play/pause
    if (state.currentTrack?.id === track.id) {
      if (state.isPlaying) {
        pauseTrack();
      } else {
        resumeTrack();
      }
      return;
    }

    // Check if track is paid
    if (track.paid) {
      // Check if user is authenticated
      if (!user) {
        setPendingTrack(track);
        setShowAuthDrawer(true);
        return;
      }

      // Check if user has already purchased the track
      if (!hasPurchased(track.id)) {
        setPendingTrack(track);
        setShowPaymentDrawer(true);
        return;
      }
    }

    // Play the track if it's free or user has purchased it
    playTrack(track, tracks);
  };

  const handleAuthSuccess = () => {
    if (pendingTrack && !pendingTrack.paid) {
      // If track is free, play it after authentication
      playTrack(pendingTrack, tracks);
      setPendingTrack(null);
    } else if (pendingTrack && pendingTrack.paid && hasPurchased(pendingTrack.id)) {
      // If user already purchased it, play it
      playTrack(pendingTrack, tracks);
      setPendingTrack(null);
    } else if (pendingTrack && pendingTrack.paid) {
      // If track is paid and not purchased, show payment drawer
      setShowPaymentDrawer(true);
    }
  };

  const handlePaymentSuccess = () => {
    if (pendingTrack) {
      playTrack(pendingTrack, tracks);
      setPendingTrack(null);
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '100%',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Music List */}
      <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
        <List sx={{ width: '100%', px: { xs: 0, sm: 1 } }}>
          {tracks.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 4,
                m: 1,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.background.paper, 0.6),
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                textAlign: 'center',
              }}
            >
              <Stack alignItems="center" spacing={2}>
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: alpha(theme.palette.text.secondary, 0.1),
                    color: theme.palette.text.secondary,
                  }}
                >
                  <Iconify icon="material-symbols:search-off" width={24} height={24} />
                </Avatar>
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{ color: theme.palette.text.primary, fontWeight: 600, mb: 0.5 }}
                  >
                    No tracks found
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    Try adjusting your search terms or browse all music
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          ) : (
            tracks.map((track, index) => {
              const isCurrentTrack = state.currentTrack?.id === track.id;
              const isPlaying = isCurrentTrack && state.isPlaying;
              const isLoading = isCurrentTrack && state.isLoading;
              const isBuffering = isCurrentTrack && state.isBuffering;
              const trackLike = getTrackLike(track.id);
              const commentCount = getTrackComments(track.id).length;

              return (
                <Paper
                  key={track.id}
                  elevation={0}
                  sx={{
                    mb: { xs: 1.5, sm: 2 },
                    mx: { xs: 1, sm: 0 },
                    borderRadius: { xs: 2, sm: 3 },
                    bgcolor: isCurrentTrack
                      ? alpha(theme.palette.primary.main, 0.08)
                      : alpha(theme.palette.background.paper, 0.6),
                    border: `1px solid ${
                      isCurrentTrack
                        ? alpha(theme.palette.primary.main, 0.2)
                        : alpha(theme.palette.divider, 0.1)
                    }`,
                    transition: 'all 0.2s ease-in-out',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: isCurrentTrack
                        ? alpha(theme.palette.primary.main, 0.12)
                        : alpha(theme.palette.background.paper, 0.8),
                      transform: { xs: 'none', sm: 'translateY(-2px)' },
                      boxShadow: {
                        xs: 'none',
                        sm: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
                      },
                    },
                  }}
                >
                  <ListItem
                    sx={{
                      py: { xs: 1, sm: 1.5 },
                      px: { xs: 1.5, sm: 2 },
                    }}
                    onClick={() => handleTrackClick(track)}
                  >
                    <Box
                      sx={{
                        position: 'relative',
                        mr: 2.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Avatar
                        variant="rounded"
                        src={track.coverUrl}
                        sx={{
                          width: { xs: 40, sm: 48 },
                          height: { xs: 40, sm: 48 },
                          borderRadius: 2,
                          bgcolor: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        }}
                      >
                        {!track.coverUrl && (
                          <Iconify
                            icon="material-symbols:music-note"
                            width={20}
                            height={20}
                            sx={{ color: 'white' }}
                          />
                        )}
                      </Avatar>

                      <Paper
                        elevation={0}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'rgba(0,0,0,0.6)',
                          borderRadius: 2,
                          opacity: isCurrentTrack ? 1 : 0,
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            opacity: 1,
                          },
                        }}
                      >
                        {isLoading || isBuffering ? (
                          <CircularProgress
                            size={20}
                            sx={{
                              color: 'white',
                            }}
                          />
                        ) : (
                          <Paper
                            elevation={0}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 28,
                              height: 28,
                              borderRadius: '50%',
                              bgcolor: theme.palette.primary.main,
                              '&:hover': {
                                bgcolor: theme.palette.primary.dark,
                                transform: 'scale(1.1)',
                              },
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTrackClick(track);
                            }}
                          >
                            {isPlaying ? (
                              <Pause sx={{ fontSize: '0.9rem', color: 'white' }} />
                            ) : (
                              <PlayArrow sx={{ fontSize: '0.9rem', color: 'white' }} />
                            )}
                          </Paper>
                        )}
                      </Paper>
                    </Box>

                    <ListItemText
                      primary={
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                          sx={{ mb: 0.5 }}
                        >
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: isCurrentTrack ? 700 : 600,
                              color: isCurrentTrack
                                ? theme.palette.primary.main
                                : theme.palette.text.primary,
                              fontSize: { xs: '0.85rem', sm: '0.95rem' },
                              lineHeight: 1.2,
                            }}
                          >
                            {track.title || 'Unknown Title'}
                          </Typography>
                          <Chip
                            label={`${index + 1}`}
                            size="small"
                            sx={{
                              height: { xs: 16, sm: 18 },
                              minWidth: { xs: 16, sm: 18 },
                              fontSize: { xs: '0.6rem', sm: '0.65rem' },
                              bgcolor: alpha(theme.palette.text.secondary, 0.08),
                              color: theme.palette.text.secondary,
                              fontWeight: 600,
                              display: { xs: 'none', sm: 'inline-flex' },
                            }}
                          />
                        </Stack>
                      }
                      secondary={
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{
                              color: theme.palette.text.secondary,
                              fontWeight: 500,
                              mb: 0.5,
                              fontSize: { xs: '0.75rem', sm: '0.85rem' },
                              lineHeight: 1.3,
                            }}
                          >
                            {track.artist || 'Unknown Artist'}
                          </Typography>

                          <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: alpha(theme.palette.text.secondary, 0.8),
                                  fontSize: { xs: '0.65rem', sm: '0.72rem' },
                                  fontWeight: 500,
                                }}
                              >
                                {track.album || 'Unknown Album'} •{' '}
                                {formatDuration(track.duration || 0)}
                              </Typography>
                              {track.paid && (
                                <Chip
                                  label={
                                    user && hasPurchased(track.id)
                                      ? 'Purchased'
                                      : `₹${track.amount || 5}`
                                  }
                                  size="small"
                                  sx={{
                                    height: { xs: 12, sm: 14 },
                                    fontSize: { xs: '0.55rem', sm: '0.58rem' },
                                    fontWeight: 600,
                                    bgcolor:
                                      user && hasPurchased(track.id)
                                        ? alpha(theme.palette.success.main, 0.1)
                                        : alpha(theme.palette.warning.main, 0.1),
                                    color:
                                      user && hasPurchased(track.id)
                                        ? theme.palette.success.main
                                        : theme.palette.warning.main,
                                    border: `1px solid ${
                                      user && hasPurchased(track.id)
                                        ? alpha(theme.palette.success.main, 0.2)
                                        : alpha(theme.palette.warning.main, 0.2)
                                    }`,
                                  }}
                                />
                              )}
                            </Stack>

                            <Stack
                              direction="row"
                              spacing={{ xs: 0.5, sm: 1 }}
                              sx={{ display: { xs: 'none', sm: 'flex' } }}
                            >
                              <Paper
                                elevation={0}
                                sx={{
                                  px: { xs: 0.5, sm: 0.75 },
                                  py: 0.25,
                                  borderRadius: 1.5,
                                  bgcolor: trackLike.isLiked
                                    ? alpha(theme.palette.error.main, 0.1)
                                    : alpha(theme.palette.text.primary, 0.05),
                                  border: `1px solid ${
                                    trackLike.isLiked
                                      ? alpha(theme.palette.error.main, 0.2)
                                      : alpha(theme.palette.divider, 0.1)
                                  }`,
                                }}
                              >
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                  <Favorite
                                    sx={{
                                      fontSize: { xs: '0.65rem', sm: '0.75rem' },
                                      color: trackLike.isLiked
                                        ? theme.palette.error.main
                                        : theme.palette.text.secondary,
                                    }}
                                  />
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: trackLike.isLiked
                                        ? theme.palette.error.main
                                        : theme.palette.text.secondary,
                                      fontSize: { xs: '0.6rem', sm: '0.65rem' },
                                      fontWeight: 600,
                                    }}
                                  >
                                    {trackLike.likeCount}
                                  </Typography>
                                </Stack>
                              </Paper>

                              <Paper
                                elevation={0}
                                sx={{
                                  px: { xs: 0.5, sm: 0.75 },
                                  py: 0.25,
                                  borderRadius: 1.5,
                                  bgcolor: alpha(theme.palette.text.primary, 0.05),
                                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                }}
                              >
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                  <CommentIcon
                                    sx={{
                                      fontSize: { xs: '0.65rem', sm: '0.75rem' },
                                      color: theme.palette.text.secondary,
                                    }}
                                  />
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: theme.palette.text.secondary,
                                      fontSize: { xs: '0.6rem', sm: '0.65rem' },
                                      fontWeight: 600,
                                    }}
                                  >
                                    {commentCount}
                                  </Typography>
                                </Stack>
                              </Paper>
                            </Stack>
                          </Stack>
                        </Box>
                      }
                    />

                    <Box
                      sx={{
                        display: { xs: 'none', sm: 'flex' },
                        alignItems: 'center',
                        ml: 1.5,
                      }}
                    >
                      <IconButton
                        size="small"
                        sx={{
                          opacity: 0.5,
                          width: 32,
                          height: 32,
                          bgcolor: alpha(theme.palette.text.primary, 0.03),
                          '&:hover': {
                            opacity: 1,
                            bgcolor: alpha(theme.palette.text.primary, 0.08),
                            transform: 'scale(1.05)',
                          },
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVert sx={{ fontSize: '0.9rem' }} />
                      </IconButton>
                    </Box>
                  </ListItem>
                </Paper>
              );
            })
          )}
        </List>
      </Box>

      {/* Authentication Drawer */}
      <AuthDrawer
        open={showAuthDrawer}
        onClose={cancelAndCloseAll}
        trackTitle={pendingTrack?.title}
        trackPrice={pendingTrack?.amount}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Payment Drawer */}
      <PaymentDrawer
        open={showPaymentDrawer}
        onClose={cancelAndCloseAll}
        track={pendingTrack}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </Box>
  );
};

export default MusicList;
