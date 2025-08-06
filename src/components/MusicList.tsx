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

import Iconify from '@/components/iconify';
import { useComments } from '@/contexts/CommentContext';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { formatDuration } from '@/data/musicData';
import { MusicTrack } from '@/types/music';

interface MusicListProps {
  tracks: MusicTrack[];
  title?: string;
}

const MusicList: React.FC<MusicListProps> = ({ tracks, title = 'Your Music' }) => {
  const { state, playTrack, pauseTrack, resumeTrack } = useMusicPlayer();
  const { getTrackLike, getTrackComments } = useComments();
  const theme = useTheme();

  const handleTrackClick = (track: MusicTrack) => {
    if (state.currentTrack?.id === track.id) {
      if (state.isPlaying) {
        pauseTrack();
      } else {
        resumeTrack();
      }
    } else {
      playTrack(track, tracks);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      {/* Header Section */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 4,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.1)',
          }}
        />

        <Stack
          direction="row"
          alignItems="center"
          spacing={3}
          sx={{ position: 'relative', zIndex: 1 }}
        >
          <Avatar
            sx={{
              width: 60,
              height: 60,
              bgcolor: 'rgba(255,255,255,0.2)',
            }}
          >
            <Iconify icon="material-symbols:music-note" width={28} height={28} />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              {title}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {tracks.length} {tracks.length === 1 ? 'track' : 'tracks'} in your collection
            </Typography>
            <Chip
              label="High Quality"
              size="small"
              sx={{
                mt: 1,
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontSize: '0.75rem',
              }}
            />
          </Box>
        </Stack>
      </Paper>

      {/* Music List */}
      <List sx={{ width: '100%', px: 1 }}>
        {tracks.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              m: 2,
              borderRadius: 4,
              bgcolor: alpha(theme.palette.background.paper, 0.6),
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              textAlign: 'center',
            }}
          >
            <Stack alignItems="center" spacing={3}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: alpha(theme.palette.text.secondary, 0.1),
                  color: theme.palette.text.secondary,
                }}
              >
                <Iconify icon="material-symbols:search-off" width={32} height={32} />
              </Avatar>
              <Box>
                <Typography
                  variant="h6"
                  sx={{ color: theme.palette.text.primary, fontWeight: 600, mb: 1 }}
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
                  mb: 2,
                  borderRadius: 3,
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
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
                  },
                }}
              >
                <ListItem
                  sx={{
                    py: 2,
                    px: 2.5,
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
                        width: 60,
                        height: 60,
                        borderRadius: 3,
                        bgcolor: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                      }}
                    >
                      {!track.coverUrl && (
                        <Iconify
                          icon="material-symbols:music-note"
                          width={24}
                          height={24}
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
                        borderRadius: 3,
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
                            width: 32,
                            height: 32,
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
                            <Pause sx={{ fontSize: '1rem', color: 'white' }} />
                          ) : (
                            <PlayArrow sx={{ fontSize: '1rem', color: 'white' }} />
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
                          variant="h6"
                          sx={{
                            fontWeight: isCurrentTrack ? 700 : 600,
                            color: isCurrentTrack
                              ? theme.palette.primary.main
                              : theme.palette.text.primary,
                            fontSize: '1rem',
                          }}
                        >
                          {track.title}
                        </Typography>
                        <Chip
                          label={`${index + 1}`}
                          size="small"
                          sx={{
                            height: 20,
                            minWidth: 20,
                            fontSize: '0.7rem',
                            bgcolor: alpha(theme.palette.text.secondary, 0.1),
                            color: theme.palette.text.secondary,
                            fontWeight: 600,
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
                            mb: 1,
                          }}
                        >
                          {track.artist}
                        </Typography>

                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <Typography
                            variant="caption"
                            sx={{
                              color: alpha(theme.palette.text.secondary, 0.8),
                              fontSize: '0.75rem',
                              fontWeight: 500,
                            }}
                          >
                            {track.album} • {formatDuration(track.duration)}
                          </Typography>

                          <Stack direction="row" spacing={2}>
                            <Paper
                              elevation={0}
                              sx={{
                                px: 1,
                                py: 0.5,
                                borderRadius: 2,
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
                                    fontSize: '0.8rem',
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
                                    fontSize: '0.7rem',
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
                                px: 1,
                                py: 0.5,
                                borderRadius: 2,
                                bgcolor: alpha(theme.palette.text.primary, 0.05),
                                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                              }}
                            >
                              <Stack direction="row" alignItems="center" spacing={0.5}>
                                <CommentIcon
                                  sx={{
                                    fontSize: '0.8rem',
                                    color: theme.palette.text.secondary,
                                  }}
                                />
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: theme.palette.text.secondary,
                                    fontSize: '0.7rem',
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
                      display: 'flex',
                      alignItems: 'center',
                      ml: 2,
                    }}
                  >
                    <IconButton
                      size="small"
                      sx={{
                        opacity: 0.6,
                        bgcolor: alpha(theme.palette.text.primary, 0.05),
                        '&:hover': {
                          opacity: 1,
                          bgcolor: alpha(theme.palette.text.primary, 0.08),
                          transform: 'scale(1.1)',
                        },
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVert sx={{ fontSize: '1rem' }} />
                    </IconButton>
                  </Box>
                </ListItem>
              </Paper>
            );
          })
        )}
      </List>
    </Box>
  );
};

export default MusicList;
