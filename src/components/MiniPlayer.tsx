'use client';

import { PlayArrow, Pause, SkipNext, SkipPrevious, ExpandLess } from '@mui/icons-material';
import {
  Box,
  Paper,
  Avatar,
  Typography,
  IconButton,
  LinearProgress,
  useTheme,
  Slide,
  CircularProgress,
  alpha,
  Stack,
  Chip,
} from '@mui/material';
import React from 'react';

import Iconify from '@/components/iconify';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';

const MiniPlayer: React.FC = () => {
  const { state, drawerState, setDrawerState, pauseTrack, resumeTrack, nextTrack, previousTrack } =
    useMusicPlayer();
  const theme = useTheme();

  if (!state.currentTrack || drawerState === 'closed') {
    return null;
  }

  const progress = state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;

  const handlePlayPause = () => {
    if (state.isPlaying) {
      pauseTrack();
    } else {
      resumeTrack();
    }
  };

  const handleExpand = () => {
    setDrawerState('expanded');
  };

  return (
    <Slide direction="up" in={drawerState === 'mini'} mountOnEnter unmountOnExit>
      <Paper
        elevation={0}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          bgcolor: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          borderBottom: 'none',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            bgcolor: alpha(theme.palette.background.paper, 0.98),
            transform: 'translateY(-2px)',
            boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.15)}`,
          },
        }}
        onClick={handleExpand}
      >
        {/* Progress Bar */}
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 3,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            bgcolor: alpha(theme.palette.divider, 0.2),
            '& .MuiLinearProgress-bar': {
              bgcolor: theme.palette.primary.main,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
            },
          }}
        />

        {/* Main Content */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: { xs: 1.5, sm: 2.5 },
            gap: { xs: 1.5, sm: 2 },
          }}
        >
          {/* Album Art */}
          <Paper
            elevation={0}
            sx={{
              position: 'relative',
              borderRadius: 3,
              overflow: 'hidden',
              width: { xs: 48, sm: 56 },
              height: { xs: 48, sm: 56 },
              bgcolor: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            <Avatar
              variant="square"
              src={state.currentTrack.coverUrl}
              sx={{
                width: '100%',
                height: '100%',
                borderRadius: 0,
              }}
            >
              {!state.currentTrack.coverUrl && (
                <Iconify
                  icon="material-symbols:music-note"
                  width={24}
                  height={24}
                  sx={{ color: 'white' }}
                />
              )}
            </Avatar>
          </Paper>

          {/* Song Info */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                color: theme.palette.text.primary,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                mb: 0.5,
                fontSize: { xs: '0.85rem', sm: '0.875rem' },
              }}
            >
              {state.currentTrack.title || 'Unknown Title'}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontWeight: 500,
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                }}
              >
                {state.currentTrack.artist || 'Unknown Artist'}
              </Typography>
              <Chip
                label={state.isPlaying ? 'Playing' : 'Paused'}
                size="small"
                sx={{
                  height: { xs: 14, sm: 16 },
                  fontSize: { xs: '0.6rem', sm: '0.65rem' },
                  bgcolor: state.isPlaying
                    ? alpha(theme.palette.success.main, 0.1)
                    : alpha(theme.palette.text.secondary, 0.1),
                  color: state.isPlaying
                    ? theme.palette.success.main
                    : theme.palette.text.secondary,
                  fontWeight: 600,
                  display: { xs: 'none', sm: 'inline-flex' },
                }}
              />
            </Stack>
          </Box>

          {/* Control Buttons */}
          <Stack direction="row" alignItems="center" spacing={{ xs: 0.25, sm: 0.5 }}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                previousTrack();
              }}
              sx={{
                color: theme.palette.text.secondary,
                bgcolor: alpha(theme.palette.text.primary, 0.05),
                display: { xs: 'none', sm: 'inline-flex' },
                '&:hover': {
                  bgcolor: alpha(theme.palette.text.primary, 0.08),
                  color: theme.palette.text.primary,
                  transform: 'scale(1.1)',
                },
              }}
            >
              <SkipPrevious sx={{ fontSize: '1.2rem' }} />
            </IconButton>

            {state.isLoading || state.isBuffering ? (
              <Paper
                elevation={0}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: { xs: 40, sm: 48 },
                  height: { xs: 40, sm: 48 },
                  borderRadius: '50%',
                  bgcolor: theme.palette.primary.main,
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                }}
              >
                <CircularProgress
                  size={20}
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
                  width: { xs: 40, sm: 48 },
                  height: { xs: 40, sm: 48 },
                  borderRadius: '50%',
                  bgcolor: theme.palette.primary.main,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                  '&:hover': {
                    bgcolor: theme.palette.primary.dark,
                    transform: 'scale(1.05)',
                    boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
                  },
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlayPause();
                }}
              >
                {state.isPlaying ? (
                  <Pause
                    sx={{
                      fontSize: { xs: '1.2rem', sm: '1.4rem' },
                      color: theme.palette.primary.contrastText,
                    }}
                  />
                ) : (
                  <PlayArrow
                    sx={{
                      fontSize: { xs: '1.2rem', sm: '1.4rem' },
                      color: theme.palette.primary.contrastText,
                    }}
                  />
                )}
              </Paper>
            )}

            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                nextTrack();
              }}
              sx={{
                color: theme.palette.text.secondary,
                bgcolor: alpha(theme.palette.text.primary, 0.05),
                display: { xs: 'none', sm: 'inline-flex' },
                '&:hover': {
                  bgcolor: alpha(theme.palette.text.primary, 0.08),
                  color: theme.palette.text.primary,
                  transform: 'scale(1.1)',
                },
              }}
            >
              <SkipNext sx={{ fontSize: '1.2rem' }} />
            </IconButton>

            <IconButton
              size="small"
              sx={{
                color: theme.palette.text.secondary,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.15),
                  color: theme.palette.primary.main,
                },
              }}
            >
              <ExpandLess sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }} />
            </IconButton>
          </Stack>
        </Box>
      </Paper>
    </Slide>
  );
};

export default MiniPlayer;
