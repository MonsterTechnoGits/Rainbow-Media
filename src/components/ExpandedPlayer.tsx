'use client';

import {
  PlayArrow,
  Pause,
  SkipNext,
  SkipPrevious,
  Shuffle,
  Repeat,
  ExpandMore,
  Favorite,
  FavoriteBorder,
  QueueMusic,
  Comment as CommentIcon,
} from '@mui/icons-material';
import {
  Box,
  Drawer,
  Avatar,
  Typography,
  IconButton,
  Slider,
  useTheme,
  Stack,
  Paper,
  CircularProgress,
  Chip,
  alpha,
} from '@mui/material';
import React from 'react';

import Iconify from '@/components/iconify';
import { useComments } from '@/contexts/CommentContext';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { formatDuration } from '@/data/musicData';

const ExpandedPlayer: React.FC = () => {
  const {
    state,
    drawerState,
    setDrawerState,
    pauseTrack,
    resumeTrack,
    nextTrack,
    previousTrack,
    seekTo,
    toggleShuffle,
    toggleRepeat,
  } = useMusicPlayer();
  const { openComments, likeTrack, getTrackLike, getTrackComments } = useComments();
  const theme = useTheme();

  const [tempCurrentTime, setTempCurrentTime] = React.useState<number | null>(null);

  // Get track like status and comment count
  const trackLike = state.currentTrack ? getTrackLike(state.currentTrack.id) : null;
  const commentCount = state.currentTrack ? getTrackComments(state.currentTrack.id).length : 0;

  if (!state.currentTrack) {
    return null;
  }

  const handlePlayPause = () => {
    if (state.isPlaying) {
      pauseTrack();
    } else {
      resumeTrack();
    }
  };

  const handleSeekChange = (_: Event | React.SyntheticEvent, value: number | number[]) => {
    const time = Array.isArray(value) ? value[0] : value;
    setTempCurrentTime(time);
  };

  const handleSeekCommit = (_: Event | React.SyntheticEvent, value: number | number[]) => {
    const time = Array.isArray(value) ? value[0] : value;
    seekTo(time);
    setTempCurrentTime(null);
  };

  const handleClose = () => {
    setDrawerState('mini');
  };

  const handleLikeClick = () => {
    if (state.currentTrack) {
      likeTrack(state.currentTrack.id);
    }
  };

  const handleCommentClick = () => {
    if (state.currentTrack) {
      openComments(state.currentTrack.id);
    }
  };

  const currentTime = tempCurrentTime !== null ? tempCurrentTime : state.currentTime;

  return (
    <Drawer
      anchor="bottom"
      open={drawerState === 'expanded'}
      onClose={handleClose}
      slotProps={{
        paper: {
          sx: {
            height: '100vh',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: '100vh',
            bgcolor: theme.palette.background.paper,
            backgroundImage: 'none',
          },
        },
      }}
    >
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${theme.palette.background.paper} 20%)`,
          position: 'relative',
        }}
      >
        {/* Header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ p: 3, pb: 2 }}
        >
          <IconButton
            onClick={handleClose}
            size="small"
            sx={{
              bgcolor: alpha(theme.palette.text.primary, 0.08),
              '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.12) },
            }}
          >
            <ExpandMore />
          </IconButton>
          <Stack direction="column" alignItems="center" spacing={0.5}>
            <Typography
              variant="caption"
              sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}
            >
              Now Playing
            </Typography>
            <Chip
              label="Your Music"
              size="small"
              sx={{
                height: 20,
                fontSize: '0.7rem',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                fontWeight: 600,
              }}
            />
          </Stack>
          <IconButton
            size="small"
            sx={{
              bgcolor: alpha(theme.palette.text.primary, 0.08),
              '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.12) },
            }}
          >
            <QueueMusic />
          </IconButton>
        </Stack>

        {/* Album Art */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: 4,
            py: 2,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              width: '85%',
              maxWidth: 320,
              aspectRatio: '1',
              borderRadius: 6,
              overflow: 'hidden',
              background: state.currentTrack.coverUrl
                ? `url(${state.currentTrack.coverUrl}) center/cover`
                : `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundRepeat: 'no-repeat',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              boxShadow: `0 24px 48px ${alpha(theme.palette.primary.main, 0.15)}`,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            {!state.currentTrack.coverUrl && (
              <Stack alignItems="center" spacing={2}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    fontSize: '2rem',
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                  }}
                >
                  <Iconify icon="material-symbols:music-note" width={40} height={40} />
                </Avatar>
                <Typography
                  variant="h6"
                  sx={{
                    color: 'white',
                    fontWeight: 700,
                    textAlign: 'center',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  }}
                >
                  {state.currentTrack.title}
                </Typography>
              </Stack>
            )}
          </Paper>
        </Box>

        {/* Song Info */}
        <Paper
          elevation={0}
          sx={{
            mx: 3,
            mb: 3,
            p: 3,
            borderRadius: 4,
            bgcolor: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: theme.palette.text.primary,
              textAlign: 'center',
              mb: 1,
              lineHeight: 1.2,
            }}
          >
            {state.currentTrack.title}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: theme.palette.text.secondary,
              textAlign: 'center',
              mb: 3,
              fontWeight: 500,
            }}
          >
            {state.currentTrack.artist}
          </Typography>

          {/* Action Buttons */}
          <Stack direction="row" spacing={4} justifyContent="center" alignItems="center">
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                borderRadius: 3,
                bgcolor: trackLike?.isLiked
                  ? alpha(theme.palette.error.main, 0.1)
                  : alpha(theme.palette.text.primary, 0.05),
                border: `1px solid ${trackLike?.isLiked ? alpha(theme.palette.error.main, 0.2) : alpha(theme.palette.divider, 0.1)}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: trackLike?.isLiked
                    ? alpha(theme.palette.error.main, 0.15)
                    : alpha(theme.palette.text.primary, 0.08),
                  transform: 'translateY(-2px)',
                },
              }}
              onClick={handleLikeClick}
            >
              <Stack direction="column" alignItems="center" spacing={1}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: trackLike?.isLiked
                      ? alpha(theme.palette.error.main, 0.1)
                      : alpha(theme.palette.text.primary, 0.05),
                  }}
                >
                  {trackLike?.isLiked ? (
                    <Favorite sx={{ color: theme.palette.error.main, fontSize: '1.2rem' }} />
                  ) : (
                    <FavoriteBorder
                      sx={{ color: theme.palette.text.secondary, fontSize: '1.2rem' }}
                    />
                  )}
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: trackLike?.isLiked
                      ? theme.palette.error.main
                      : theme.palette.text.secondary,
                    fontWeight: 600,
                    fontSize: '0.75rem',
                  }}
                >
                  {trackLike?.likeCount || 0}
                </Typography>
              </Stack>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.text.primary, 0.05),
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: alpha(theme.palette.text.primary, 0.08),
                  transform: 'translateY(-2px)',
                },
              }}
              onClick={handleCommentClick}
            >
              <Stack direction="column" alignItems="center" spacing={1}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.text.primary, 0.05),
                  }}
                >
                  <CommentIcon sx={{ color: theme.palette.text.secondary, fontSize: '1.2rem' }} />
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontWeight: 600,
                    fontSize: '0.75rem',
                  }}
                >
                  {commentCount}
                </Typography>
              </Stack>
            </Paper>
          </Stack>
        </Paper>

        {/* Progress Bar */}
        <Paper
          elevation={0}
          sx={{
            mx: 3,
            mb: 2,
            p: 3,
            borderRadius: 4,
            bgcolor: alpha(theme.palette.background.paper, 0.6),
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Slider
            value={currentTime}
            max={state.duration || 100}
            onChange={handleSeekChange}
            onChangeCommitted={handleSeekCommit}
            sx={{
              color: theme.palette.primary.main,
              height: 6,
              '& .MuiSlider-thumb': {
                width: 16,
                height: 16,
                transition: '0.3s cubic-bezier(.47,1.64,.41,.8)',
                '&::before': {
                  boxShadow: `0 4px 8px ${alpha(theme.palette.primary.main, 0.4)}`,
                },
                '&:hover, &.Mui-focusVisible': {
                  boxShadow: `0 0 0 8px ${alpha(theme.palette.primary.main, 0.16)}`,
                },
              },
              '& .MuiSlider-track': {
                height: 6,
                borderRadius: 3,
              },
              '& .MuiSlider-rail': {
                height: 6,
                borderRadius: 3,
                backgroundColor: alpha(theme.palette.divider, 0.4),
              },
            }}
          />
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mt: 1,
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}
            >
              {formatDuration(Math.floor(currentTime))}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}
            >
              {formatDuration(Math.floor(state.duration))}
            </Typography>
          </Box>
        </Paper>

        {/* Control Buttons */}
        <Paper
          elevation={0}
          sx={{
            mx: 3,
            mb: 3,
            p: 3,
            borderRadius: 4,
            bgcolor: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
            <IconButton
              onClick={toggleShuffle}
              sx={{
                color: state.isShuffled ? theme.palette.primary.main : theme.palette.text.secondary,
                bgcolor: state.isShuffled ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                '&:hover': {
                  bgcolor: state.isShuffled
                    ? alpha(theme.palette.primary.main, 0.15)
                    : alpha(theme.palette.text.primary, 0.08),
                },
              }}
            >
              <Shuffle />
            </IconButton>

            <IconButton
              onClick={previousTrack}
              sx={{
                color: theme.palette.text.primary,
                '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.08) },
              }}
            >
              <SkipPrevious sx={{ fontSize: '2rem' }} />
            </IconButton>

            {state.isLoading || state.isBuffering ? (
              <Paper
                elevation={0}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  bgcolor: theme.palette.primary.main,
                  boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
                }}
              >
                <CircularProgress
                  size={32}
                  sx={{
                    color: theme.palette.primary.contrastText,
                  }}
                />
              </Paper>
            ) : (
              <Paper
                elevation={0}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  bgcolor: theme.palette.primary.main,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
                  '&:hover': {
                    bgcolor: theme.palette.primary.dark,
                    transform: 'scale(1.05)',
                    boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.5)}`,
                  },
                }}
                onClick={handlePlayPause}
              >
                {state.isPlaying ? (
                  <Pause sx={{ fontSize: '2rem', color: theme.palette.primary.contrastText }} />
                ) : (
                  <PlayArrow sx={{ fontSize: '2rem', color: theme.palette.primary.contrastText }} />
                )}
              </Paper>
            )}

            <IconButton
              onClick={nextTrack}
              sx={{
                color: theme.palette.text.primary,
                '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.08) },
              }}
            >
              <SkipNext sx={{ fontSize: '2rem' }} />
            </IconButton>

            <IconButton
              onClick={toggleRepeat}
              sx={{
                color: state.isRepeated ? theme.palette.primary.main : theme.palette.text.secondary,
                bgcolor: state.isRepeated ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                '&:hover': {
                  bgcolor: state.isRepeated
                    ? alpha(theme.palette.primary.main, 0.15)
                    : alpha(theme.palette.text.primary, 0.08),
                },
              }}
            >
              <Repeat />
            </IconButton>
          </Stack>
        </Paper>
      </Box>
    </Drawer>
  );
};

export default ExpandedPlayer;
