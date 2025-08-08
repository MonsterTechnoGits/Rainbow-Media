'use client';

import {
  PlayArrow,
  Pause,
  SkipNext,
  SkipPrevious,
  Shuffle,
  Repeat,
  KeyboardArrowDown,
  Comment as CommentIcon,
  Share,
  MoreVert,
  Favorite,
  FavoriteBorder,
} from '@mui/icons-material';
import {
  Box,
  Drawer,
  Typography,
  IconButton,
  Slider,
  Stack,
  Paper,
  CircularProgress,
  alpha,
  Fade,
  Zoom,
  ButtonBase,
} from '@mui/material';
import React from 'react';

import Iconify from '@/components/iconify';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { useComments } from '@/contexts/CommentContext';
import { formatDuration } from '@/data/storyData';

const ExpandedPlayer: React.FC = () => {
  const {
    state,
    drawerState,
    setDrawerState,
    pauseStory,
    resumeStory,
    // nextStory,
    // previousStory,
    seekTo,
    toggleShuffle,
    toggleRepeat,
  } = useAudioPlayer();
  const { openComments, likeStory, getStoryLike, getStoryComments, loadStoryData } = useComments();

  const [tempCurrentTime, setTempCurrentTime] = React.useState<number | null>(null);
  const [isLikeAnimating, setIsLikeAnimating] = React.useState<boolean>(false);
  const [coverImageColors, setCoverImageColors] = React.useState<string[]>(['#ff6b35', '#f7931e']);

  // Haptic feedback function
  const triggerHaptic = React.useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: 10,
        medium: 50,
        heavy: 100,
      };
      navigator.vibrate(patterns[type]);
    }
  }, []);

  // Extract colors from cover image
  const extractColorsFromImage = React.useCallback((imageUrl: string) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);

        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData?.data;

        if (data) {
          // Sample pixels and find dominant colors
          const colorMap = new Map<string, number>();
          const step = 50; // Sample every 50th pixel for performance

          for (let i = 0; i < data.length; i += 4 * step) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const alpha = data[i + 3];

            if (alpha > 128) {
              // Only consider non-transparent pixels
              const colorKey = `${Math.round(r / 20) * 20},${Math.round(g / 20) * 20},${Math.round(b / 20) * 20}`;
              colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1);
            }
          }

          // Get the most frequent colors
          const sortedColors = Array.from(colorMap.entries())
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([color]) => {
              const [r, g, b] = color.split(',').map(Number);
              return `rgb(${r}, ${g}, ${b})`;
            });

          if (sortedColors.length > 0) {
            setCoverImageColors(
              sortedColors.length >= 2 ? sortedColors : [...sortedColors, '#ff6b35']
            );
          }
        }
      } catch (error) {
        console.log('Could not extract colors from image:', error);
        setCoverImageColors(['#ff6b35', '#f7931e']);
      }
    };
    img.onerror = () => {
      setCoverImageColors(['#ff6b35', '#f7931e']);
    };
    img.src = imageUrl;
  }, []);

  // Initialize story data in CommentContext when story changes
  React.useEffect(() => {
    if (state.currentStory) {
      // Don't pass isLiked status - let CommentContext fetch the real status from API
      // This ensures we get the actual like state for the current user
      loadStoryData(state.currentStory.id);

      // Extract colors from cover image
      if (state.currentStory.coverUrl) {
        extractColorsFromImage(state.currentStory.coverUrl);
      } else {
        setCoverImageColors(['#ff6b35', '#f7931e']);
      }
    }
  }, [
    state.currentStory?.id,
    state.currentStory?.coverUrl,
    state.currentStory,
    loadStoryData,
    extractColorsFromImage,
  ]);

  // Get story like status and comment count from CommentContext (with optimistic updates)
  const storyLike = state.currentStory ? getStoryLike(state.currentStory.id) : null;
  const comments = state.currentStory ? getStoryComments(state.currentStory.id) : [];
  const commentCount = comments.length;

  if (!state.currentStory) {
    return null;
  }

  const handlePlayPause = () => {
    triggerHaptic('medium');
    if (state.isPlaying) {
      pauseStory();
    } else {
      resumeStory();
    }
  };

  const handleSeekChange = (_: Event | React.SyntheticEvent, value: number | number[]) => {
    const time = Array.isArray(value) ? value[0] : value;
    setTempCurrentTime(time);
  };

  const handleSeekCommit = (_: Event | React.SyntheticEvent, value: number | number[]) => {
    triggerHaptic('light');
    const time = Array.isArray(value) ? value[0] : value;
    seekTo(time);
    setTempCurrentTime(null);
  };

  const handleClose = () => {
    triggerHaptic('light');
    setDrawerState('mini');
  };

  const handleLikeClick = () => {
    if (state.currentStory) {
      triggerHaptic('heavy');
      setIsLikeAnimating(true);
      likeStory(state.currentStory.id);
      setTimeout(() => setIsLikeAnimating(false), 300);
    }
  };

  const handleSkipPrevious = () => {
    triggerHaptic('light');
    // previousStory logic
  };

  const handleSkipNext = () => {
    triggerHaptic('light');
    // nextStory logic
  };

  const handleShuffle = () => {
    triggerHaptic('light');
    toggleShuffle();
  };

  const handleRepeat = () => {
    triggerHaptic('light');
    toggleRepeat();
  };

  const handleCommentClick = () => {
    if (state.currentStory) {
      triggerHaptic('light');
      // Use current optimistic state from CommentContext
      const currentStoryLike = getStoryLike(state.currentStory.id);
      openComments(state.currentStory.id, {
        likeCount: currentStoryLike.likeCount,
        isLiked: currentStoryLike.isLiked,
      });
    }
  };

  const handleShareClick = async () => {
    if (state.currentStory) {
      triggerHaptic('medium');

      const shareData = {
        title: state.currentStory.title,
        text: `Listen to "${state.currentStory.title}" by ${state.currentStory.creator || 'Unknown Artist'}`,
        url: window.location.origin + `/story/${state.currentStory.id}`,
      };

      try {
        // Check if native sharing is available
        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
          await navigator.share(shareData);
        } else {
          // Fallback to clipboard
          await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
          // You could show a toast/snackbar here to inform user
          console.log('Share link copied to clipboard!');
        }
      } catch (error) {
        console.error('Error sharing:', error);
        // Fallback: copy to clipboard
        try {
          await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
          console.log('Share link copied to clipboard as fallback!');
        } catch (clipboardError) {
          console.error('Failed to copy to clipboard:', clipboardError);
        }
      }
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
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            maxHeight: '100vh',
            bgcolor: '#121212',
            backgroundImage: 'none',
            overflow: 'hidden',
          },
        },
      }}
    >
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          bgcolor: '#121212',
          color: '#fff',
        }}
      >
        {/* Enhanced Header with Ripple Effects */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            pt: { xs: 3, sm: 2 },
            flexShrink: 0,
          }}
        >
          <IconButton
            onClick={() => {
              console.log('Close button clicked');
              triggerHaptic('light');
              handleClose();
            }}
            sx={{
              color: '#fff',
              '&:hover': {
                bgcolor: alpha('#fff', 0.1),
              },
            }}
          >
            <KeyboardArrowDown sx={{ fontSize: 32 }} />
          </IconButton>

          <Typography
            variant="body2"
            sx={{
              color: alpha('#fff', 0.7),
              textAlign: 'center',
              fontSize: '0.875rem',
              fontWeight: 500,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}
          >
            Now Playing
          </Typography>

          <IconButton
            sx={{
              color: '#fff',
              '&:hover': {
                bgcolor: alpha('#fff', 0.1),
              },
            }}
          >
            <MoreVert sx={{ fontSize: 24 }} />
          </IconButton>
        </Box>

        {/* Album Art - YouTube Music Style with Dynamic Background */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: { xs: 3, sm: 4 },
            py: 2,
            position: 'relative',
          }}
        >
          {/* Dynamic Gradient Background */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: `
                radial-gradient(ellipse at center, 
                  ${coverImageColors[0]}40 0%, 
                  ${coverImageColors[1] || coverImageColors[0]}30 30%, 
                  rgba(18, 18, 18, 0.8) 70%
                ),
                linear-gradient(135deg, 
                  ${coverImageColors[0]}25 0%, 
                  ${coverImageColors[1] || coverImageColors[0]}15 50%, 
                  rgba(18, 18, 18, 0.9) 100%
                )
              `,
              filter: 'blur(40px)',
              transform: 'scale(1.2)',
              opacity: 0.6,
              transition: 'background 1s ease-in-out',
            }}
          />

          {/* Album Art Container with Zoom Animation */}
          <Fade in={drawerState === 'expanded'} timeout={600}>
            <Box
              sx={{
                width: '100%',
                maxWidth: 400,
                aspectRatio: '1',
                borderRadius: 2,
                overflow: 'hidden',
                position: 'relative',
                zIndex: 1,
                boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
                transform: 'scale(0.95)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                animation:
                  drawerState === 'expanded' && state.isPlaying
                    ? 'coverZoomBreathe 4s ease-in-out infinite alternate, coverZoomIn 0.6s ease-out forwards'
                    : drawerState === 'expanded'
                      ? 'coverZoomIn 0.6s ease-out forwards'
                      : 'none',
                '@keyframes coverZoomIn': {
                  '0%': {
                    transform: 'scale(0.8) translateY(20px)',
                    opacity: 0,
                  },
                  '100%': {
                    transform: 'scale(1) translateY(0)',
                    opacity: 1,
                  },
                },
                '@keyframes coverZoomBreathe': {
                  '0%': {
                    transform: 'scale(1)',
                  },
                  '100%': {
                    transform: 'scale(1.03)',
                  },
                },
              }}
            >
              {state.currentStory.coverUrl ? (
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    backgroundImage: `url(${state.currentStory.coverUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                  }}
                />
              ) : (
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #ff6b35, #f7931e)',
                  }}
                >
                  <Iconify
                    icon="solar:music-note-bold"
                    width={100}
                    height={100}
                    color="white"
                    sx={{
                      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
                    }}
                  />
                </Box>
              )}

              {/* Subtle overlay for better text contrast */}
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.1) 100%)',
                  pointerEvents: 'none',
                }}
              />
            </Box>
          </Fade>
        </Box>

        {/* Song Info */}
        <Box sx={{ px: 3, flexShrink: 0, textAlign: 'center' }}>
          <Typography
            variant="h5"
            sx={{
              color: '#fff',
              fontWeight: 400,
              fontSize: { xs: '1.5rem', sm: '1.8rem' },
              mb: 1,
              lineHeight: 1.2,
            }}
          >
            {state.currentStory.title}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: alpha('#fff', 0.7),
              fontSize: { xs: '0.9rem', sm: '1rem' },
              mb: 3,
            }}
          >
            {state.currentStory.creator || 'Unknown Creator'}
          </Typography>
        </Box>

        {/* Enhanced Action Bar with Ripple Effects */}
        <Box sx={{ px: 3, pb: 2, flexShrink: 0 }}>
          <Stack direction="row" spacing={1} justifyContent="space-around" alignItems="center">
            {/* Enhanced Like Button */}
            <Box sx={{ textAlign: 'center', minWidth: 70 }}>
              <Zoom in={!isLikeAnimating} timeout={200}>
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    bgcolor: storyLike?.isLiked ? alpha('#ff1744', 0.15) : alpha('#fff', 0.08),
                    border: storyLike?.isLiked
                      ? `1px solid ${alpha('#ff1744', 0.3)}`
                      : `1px solid ${alpha('#fff', 0.12)}`,
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      bgcolor: storyLike?.isLiked ? alpha('#ff1744', 0.2) : alpha('#fff', 0.12),
                      transform: 'translateY(-2px) scale(1.02)',
                      boxShadow: storyLike?.isLiked
                        ? '0 8px 25px rgba(255, 23, 68, 0.25)'
                        : '0 8px 25px rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  <ButtonBase
                    onClick={handleLikeClick}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      width: '100%',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:active': {
                        transform: 'scale(0.95)',
                      },
                    }}
                  >
                    <Stack alignItems="center" spacing={1}>
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 2,
                          bgcolor: storyLike?.isLiked
                            ? alpha('#ff1744', 0.15)
                            : alpha('#fff', 0.08),
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {storyLike?.isLiked ? (
                          <Favorite
                            sx={{
                              color: '#ff1744',
                              fontSize: 28,
                              filter: 'drop-shadow(0 2px 8px rgba(255, 23, 68, 0.4))',
                            }}
                          />
                        ) : (
                          <FavoriteBorder
                            sx={{
                              color: alpha('#fff', 0.8),
                              fontSize: 28,
                            }}
                          />
                        )}
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: storyLike?.isLiked ? '#ff1744' : alpha('#fff', 0.8),
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        {storyLike?.likeCount || 0}
                      </Typography>
                    </Stack>
                  </ButtonBase>
                </Paper>
              </Zoom>
            </Box>

            {/* Enhanced Comment Button */}
            <Box sx={{ textAlign: 'center', minWidth: 70 }}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  bgcolor: alpha('#fff', 0.08),
                  border: `1px solid ${alpha('#fff', 0.12)}`,
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    bgcolor: alpha('#fff', 0.12),
                    transform: 'translateY(-2px) scale(1.02)',
                    boxShadow: '0 8px 25px rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <ButtonBase
                  onClick={handleCommentClick}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    width: '100%',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:active': {
                      transform: 'scale(0.95)',
                    },
                  }}
                >
                  <Stack alignItems="center" spacing={1}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        bgcolor: alpha('#fff', 0.08),
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <CommentIcon
                        sx={{
                          color: alpha('#fff', 0.8),
                          fontSize: 28,
                        }}
                      />
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: alpha('#fff', 0.8),
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      {commentCount || 0}
                    </Typography>
                  </Stack>
                </ButtonBase>
              </Paper>
            </Box>

            {/* Enhanced Share Button */}
            <Box sx={{ textAlign: 'center', minWidth: 70 }}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  bgcolor: alpha('#fff', 0.08),
                  border: `1px solid ${alpha('#fff', 0.12)}`,
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    bgcolor: alpha('#fff', 0.12),
                    transform: 'translateY(-2px) scale(1.02)',
                    boxShadow: '0 8px 25px rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <ButtonBase
                  onClick={handleShareClick}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    width: '100%',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:active': {
                      transform: 'scale(0.95)',
                    },
                  }}
                >
                  <Stack alignItems="center" spacing={1}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        bgcolor: alpha('#fff', 0.08),
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Share
                        sx={{
                          color: alpha('#fff', 0.8),
                          fontSize: 28,
                        }}
                      />
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: alpha('#fff', 0.8),
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      Share
                    </Typography>
                  </Stack>
                </ButtonBase>
              </Paper>
            </Box>
          </Stack>
        </Box>

        {/* YouTube Music Style Seek Bar */}
        <Box sx={{ px: 3, pb: 1, flexShrink: 0 }}>
          <Slider
            value={currentTime}
            max={state.duration || 100}
            onChange={handleSeekChange}
            onChangeCommitted={handleSeekCommit}
            sx={{
              color: '#fff',
              height: 4,
              padding: '10px 0',
              transition: 'all 0.2s ease',
              '& .MuiSlider-track': {
                height: 4,
                borderRadius: 2,
                backgroundColor: '#fff',
                transition: 'height 0.2s ease',
              },
              '& .MuiSlider-rail': {
                height: 4,
                borderRadius: 2,
                backgroundColor: alpha('#fff', 0.3),
                opacity: 1,
                transition: 'height 0.2s ease',
              },
              '& .MuiSlider-thumb': {
                height: 12,
                width: 12,
                backgroundColor: '#fff',
                border: 'none',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 2px 8px rgba(255, 255, 255, 0.2)',
                '&::before': {
                  display: 'none',
                },
                '&:hover, &.Mui-focusVisible': {
                  height: 16,
                  width: 16,
                  boxShadow:
                    '0 0 0 8px rgba(255,255,255,0.16), 0 4px 12px rgba(255, 255, 255, 0.3)',
                },
                '&:active': {
                  height: 18,
                  width: 18,
                },
              },
              '&:hover': {
                '& .MuiSlider-track': {
                  height: 5,
                },
                '& .MuiSlider-rail': {
                  height: 5,
                },
              },
            }}
          />

          {/* Time Display */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
            <Typography
              variant="caption"
              sx={{
                color: alpha('#fff', 0.7),
                fontSize: '0.8rem',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatDuration(Math.floor(currentTime))}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: alpha('#fff', 0.7),
                fontSize: '0.8rem',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatDuration(Math.floor(state.duration))}
            </Typography>
          </Stack>
        </Box>

        {/* Enhanced Music Controls with Premium Ripples */}
        <Box sx={{ px: 3, pb: { xs: 2, sm: 3 }, flexShrink: 0 }}>
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
            {/* Enhanced Shuffle Button */}
            <ButtonBase
              onClick={handleShuffle}
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                color: state.isShuffled ? '#fff' : alpha('#fff', 0.7),
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '&:hover': {
                  bgcolor: state.isShuffled ? alpha('#1976d2', 0.2) : alpha('#fff', 0.1),
                  color: '#fff',
                  transform: 'scale(1.15)',
                  boxShadow: state.isShuffled
                    ? '0 4px 16px rgba(25, 118, 210, 0.3)'
                    : '0 4px 16px rgba(255, 255, 255, 0.1)',
                },
                '&:active': {
                  transform: 'scale(0.95)',
                },
                '& .MuiTouchRipple-root': {
                  borderRadius: '50%',
                },
                '& .MuiTouchRipple-child': {
                  backgroundColor: state.isShuffled ? alpha('#1976d2', 0.4) : alpha('#fff', 0.3),
                },
                '&::after': state.isShuffled
                  ? {
                      content: '""',
                      position: 'absolute',
                      inset: -2,
                      borderRadius: '50%',
                      border: '2px solid #1976d2',
                      opacity: 0.6,
                      animation: 'pulse 2s ease-in-out infinite',
                    }
                  : {},
                '@keyframes pulse': {
                  '0%': {
                    transform: 'scale(1)',
                    opacity: 0.6,
                  },
                  '50%': {
                    transform: 'scale(1.1)',
                    opacity: 0.3,
                  },
                  '100%': {
                    transform: 'scale(1)',
                    opacity: 0.6,
                  },
                },
              }}
            >
              <Shuffle sx={{ fontSize: 24 }} />
            </ButtonBase>

            {/* Enhanced Previous Button */}
            <ButtonBase
              onClick={handleSkipPrevious}
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                color: '#fff',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '&:hover': {
                  bgcolor: alpha('#fff', 0.1),
                  transform: 'scale(1.15)',
                  boxShadow: '0 4px 16px rgba(255, 255, 255, 0.15)',
                },
                '&:active': {
                  transform: 'scale(0.9)',
                },
                '& .MuiTouchRipple-root': {
                  borderRadius: '50%',
                },
                '& .MuiTouchRipple-child': {
                  backgroundColor: alpha('#fff', 0.3),
                },
              }}
            >
              <SkipPrevious sx={{ fontSize: 36 }} />
            </ButtonBase>

            {/* Enhanced Play/Pause Button */}
            {state.isLoading || state.isBuffering ? (
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 2,
                  boxShadow: '0 6px 24px rgba(255, 255, 255, 0.25)',
                }}
              >
                <CircularProgress size={28} sx={{ color: '#121212' }} />
              </Box>
            ) : (
              <ButtonBase
                onClick={handlePlayPause}
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: '#fff',
                  color: '#121212',
                  mx: 2,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 6px 24px rgba(255, 255, 255, 0.25)',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  '&:hover': {
                    bgcolor: '#f5f5f5',
                    transform: 'scale(1.08)',
                    boxShadow: '0 8px 32px rgba(255, 255, 255, 0.4)',
                  },
                  '&:active': {
                    transform: 'scale(0.95)',
                  },
                  '& .MuiTouchRipple-root': {
                    borderRadius: '50%',
                  },
                  '& .MuiTouchRipple-child': {
                    backgroundColor: alpha('#121212', 0.2),
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    background: state.isPlaying
                      ? 'conic-gradient(from 0deg, transparent, rgba(25, 118, 210, 0.1), transparent)'
                      : 'none',
                    borderRadius: '50%',
                    animation: state.isPlaying ? 'spin 3s linear infinite' : 'none',
                  },
                  '@keyframes spin': {
                    '0%': {
                      transform: 'rotate(0deg)',
                    },
                    '100%': {
                      transform: 'rotate(360deg)',
                    },
                  },
                }}
              >
                {state.isPlaying ? (
                  <Pause sx={{ fontSize: 36, zIndex: 1 }} />
                ) : (
                  <PlayArrow sx={{ fontSize: 36, zIndex: 1 }} />
                )}
              </ButtonBase>
            )}

            {/* Enhanced Next Button */}
            <ButtonBase
              onClick={handleSkipNext}
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                color: '#fff',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '&:hover': {
                  bgcolor: alpha('#fff', 0.1),
                  transform: 'scale(1.15)',
                  boxShadow: '0 4px 16px rgba(255, 255, 255, 0.15)',
                },
                '&:active': {
                  transform: 'scale(0.9)',
                },
                '& .MuiTouchRipple-root': {
                  borderRadius: '50%',
                },
                '& .MuiTouchRipple-child': {
                  backgroundColor: alpha('#fff', 0.3),
                },
              }}
            >
              <SkipNext sx={{ fontSize: 36 }} />
            </ButtonBase>

            {/* Enhanced Repeat Button */}
            <ButtonBase
              onClick={handleRepeat}
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                color: state.isRepeated ? '#fff' : alpha('#fff', 0.7),
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '&:hover': {
                  bgcolor: state.isRepeated ? alpha('#4caf50', 0.2) : alpha('#fff', 0.1),
                  color: '#fff',
                  transform: 'scale(1.15)',
                  boxShadow: state.isRepeated
                    ? '0 4px 16px rgba(76, 175, 80, 0.3)'
                    : '0 4px 16px rgba(255, 255, 255, 0.1)',
                },
                '&:active': {
                  transform: 'scale(0.95)',
                },
                '& .MuiTouchRipple-root': {
                  borderRadius: '50%',
                },
                '& .MuiTouchRipple-child': {
                  backgroundColor: state.isRepeated ? alpha('#4caf50', 0.4) : alpha('#fff', 0.3),
                },
                '&::after': state.isRepeated
                  ? {
                      content: '""',
                      position: 'absolute',
                      inset: -2,
                      borderRadius: '50%',
                      border: '2px solid #4caf50',
                      opacity: 0.6,
                      animation: 'pulse 2s ease-in-out infinite',
                    }
                  : {},
              }}
            >
              <Repeat sx={{ fontSize: 24 }} />
            </ButtonBase>
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
};

export default ExpandedPlayer;
