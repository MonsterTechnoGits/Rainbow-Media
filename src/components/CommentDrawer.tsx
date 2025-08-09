'use client';

import { ExpandMore, Favorite, FavoriteBorder, Send } from '@mui/icons-material';
import {
  Box,
  Drawer,
  Typography,
  IconButton,
  useTheme,
  Avatar,
  Stack,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  alpha,
  Chip,
} from '@mui/material';
import React, { useState } from 'react';

import Iconify from '@/components/iconify';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { useAuth } from '@/contexts/AuthContext';
import { useComments } from '@/contexts/CommentContext';
import { formatTimeAgo } from '@/data/commentData';
import { useMobileViewport, getMobileDrawerStyles } from '@/hooks/use-mobile-view-port';

const CommentDrawer: React.FC = () => {
  const { state, closeComments, addComment, likeComment } = useComments();
  const { user } = useAuth();
  const { setShowAuthDrawer } = useAudioPlayer();
  const theme = useTheme();
  const [commentText, setCommentText] = useState('');
  const { isMobile } = useMobileViewport();

  const currentComments = state.currentStoryId ? state.comments[state.currentStoryId] || [] : [];

  const handleClose = () => {
    closeComments();
  };

  const handleSubmitComment = () => {
    if (commentText.trim() && state.currentStoryId) {
      // Check if user is authenticated before allowing comment posting
      if (!user) {
        setShowAuthDrawer(true);
        return;
      }

      addComment(state.currentStoryId, commentText);
      setCommentText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  return (
    <Drawer
      anchor="bottom"
      open={state.isCommentsOpen}
      onClose={handleClose}
      slotProps={{
        paper: {
          sx: {
            borderTopLeftRadius: { xs: 16, sm: 24 },
            borderTopRightRadius: { xs: 16, sm: 24 },
            bgcolor: theme.palette.background.paper,
            backgroundImage: 'none',
            ...getMobileDrawerStyles(isMobile, 85, 50),
            maxHeight: { xs: '90vh', sm: '85vh' },
            height: { xs: '90vh', sm: '85vh' },
          },
        },
        backdrop: {
          sx: {},
        },
      }}
    >
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${theme.palette.background.paper} 15%)`,
        }}
      >
        {/* Header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ p: { xs: 2, sm: 3 }, pb: { xs: 1.5, sm: 2 } }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar
              sx={{
                bgcolor: theme.palette.primary.main,
                width: { xs: 32, sm: 36 },
                height: { xs: 32, sm: 36 },
              }}
            >
              <Iconify
                icon="material-symbols:comment"
                width={{ xs: 18, sm: 20 }}
                height={{ xs: 18, sm: 20 }}
              />
            </Avatar>
            <Box>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
              >
                Comments
              </Typography>
              <Chip
                label={`${currentComments.length} ${currentComments.length === 1 ? 'comment' : 'comments'}`}
                size="small"
                sx={{
                  height: { xs: 16, sm: 18 },
                  fontSize: { xs: '0.65rem', sm: '0.7rem' },
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                  mt: 0.5,
                }}
              />
            </Box>
          </Stack>
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
        </Stack>

        {/* Comments List */}
        <Box sx={{ flex: 1, overflow: 'auto', px: { xs: 1.5, sm: 2 }, minHeight: 0 }}>
          {currentComments.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: { xs: 4, sm: 6 },
                m: { xs: 1.5, sm: 2 },
                borderRadius: { xs: 3, sm: 4 },
                bgcolor: alpha(theme.palette.background.paper, 0.6),
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                textAlign: 'center',
              }}
            >
              <Stack alignItems="center" spacing={3}>
                <Avatar
                  sx={{
                    width: { xs: 48, sm: 64 },
                    height: { xs: 48, sm: 64 },
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                  }}
                >
                  <Iconify
                    icon="material-symbols:comment-outline"
                    width={{ xs: 24, sm: 32 }}
                    height={{ xs: 24, sm: 32 }}
                  />
                </Avatar>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      color: theme.palette.text.primary,
                      fontWeight: 600,
                      mb: 1,
                      fontSize: { xs: '1.1rem', sm: '1.25rem' },
                    }}
                  >
                    No comments yet
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.text.secondary,
                      fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    }}
                  >
                    Be the first to leave a comment on this track!
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          ) : (
            <List sx={{ p: 0 }}>
              {currentComments.map((comment, index) => (
                <React.Fragment key={comment.id}>
                  <Paper
                    elevation={0}
                    sx={{
                      mx: { xs: 0.5, sm: 1 },
                      mb: { xs: 1.5, sm: 2 },
                      borderRadius: { xs: 2, sm: 3 },
                      bgcolor: alpha(theme.palette.background.paper, 0.8),
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.background.paper, 0.9),
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    <ListItem
                      sx={{
                        py: { xs: 1.5, sm: 2 },
                        px: { xs: 2, sm: 2.5 },
                        alignItems: 'flex-start',
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          src={comment.userAvatar}
                          sx={{
                            width: { xs: 32, sm: 40 },
                            height: { xs: 32, sm: 40 },
                            bgcolor: theme.palette.primary.main,
                            border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                          }}
                        >
                          {comment.username.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: 700,
                                color: theme.palette.text.primary,
                                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                              }}
                            >
                              {comment.username}
                            </Typography>
                            <Chip
                              label={formatTimeAgo(comment.timestamp)}
                              size="small"
                              sx={{
                                height: { xs: 14, sm: 16 },
                                fontSize: { xs: '0.6rem', sm: '0.65rem' },
                                bgcolor: alpha(theme.palette.text.secondary, 0.1),
                                color: theme.palette.text.secondary,
                                fontWeight: 500,
                              }}
                            />
                          </Stack>
                        }
                        secondary={
                          <Typography
                            variant="body2"
                            sx={{
                              color: theme.palette.text.primary,
                              mt: 0.5,
                              whiteSpace: 'pre-wrap',
                              lineHeight: 1.5,
                              fontSize: { xs: '0.8rem', sm: '0.875rem' },
                            }}
                          >
                            {comment.text}
                          </Typography>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Paper
                          elevation={0}
                          sx={{
                            p: { xs: 0.75, sm: 1 },
                            borderRadius: { xs: 1.5, sm: 2 },
                            bgcolor: comment.isLiked
                              ? alpha(theme.palette.error.main, 0.1)
                              : alpha(theme.palette.text.primary, 0.05),
                            border: `1px solid ${
                              comment.isLiked
                                ? alpha(theme.palette.error.main, 0.2)
                                : alpha(theme.palette.divider, 0.1)
                            }`,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: comment.isLiked
                                ? alpha(theme.palette.error.main, 0.15)
                                : alpha(theme.palette.text.primary, 0.08),
                              transform: 'scale(1.05)',
                            },
                          }}
                          onClick={() => {
                            if (!user) {
                              setShowAuthDrawer(true);
                              return;
                            }
                            likeComment(comment.id, comment.storyId);
                          }}
                        >
                          <Stack direction="column" alignItems="center" spacing={0.5}>
                            {comment.isLiked ? (
                              <Favorite
                                sx={{
                                  fontSize: { xs: '0.9rem', sm: '1rem' },
                                  color: theme.palette.error.main,
                                }}
                              />
                            ) : (
                              <FavoriteBorder
                                sx={{
                                  fontSize: { xs: '0.9rem', sm: '1rem' },
                                  color: theme.palette.text.secondary,
                                }}
                              />
                            )}
                            {comment.likes > 0 && (
                              <Typography
                                variant="caption"
                                sx={{
                                  color: comment.isLiked
                                    ? theme.palette.error.main
                                    : theme.palette.text.secondary,
                                  fontWeight: 600,
                                  fontSize: { xs: '0.65rem', sm: '0.7rem' },
                                }}
                              >
                                {comment.likes}
                              </Typography>
                            )}
                          </Stack>
                        </Paper>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </Paper>
                  {index < currentComments.length - 1 && <Box sx={{ height: 8 }} />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>

        {/* Comment Input */}
        <Paper
          elevation={0}
          sx={{
            m: { xs: 1.5, sm: 2 },
            mt: 1,
            p: { xs: 2, sm: 2.5 },
            borderRadius: { xs: 3, sm: 4 },
            bgcolor: alpha(theme.palette.background.paper, 0.9),
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Stack direction="row" spacing={{ xs: 1, sm: 1.5 }} alignItems="flex-end">
            <Avatar
              sx={{
                width: { xs: 32, sm: 36 },
                height: { xs: 32, sm: 36 },
                bgcolor: theme.palette.primary.main,
                mb: 1,
              }}
            >
              <Typography
                variant="body2"
                fontWeight={700}
                sx={{ color: 'white', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
              >
                Y
              </Typography>
            </Avatar>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              placeholder={user ? 'Add a comment...' : 'Sign in to add a comment'}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => {
                if (!user) {
                  setShowAuthDrawer(true);
                }
              }}
              variant="outlined"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: { xs: 2, sm: 3 },
                  bgcolor: alpha(theme.palette.background.default, 0.8),
                  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.background.default, 0.9),
                  },
                  '&.Mui-focused': {
                    bgcolor: theme.palette.background.default,
                    borderColor: theme.palette.primary.main,
                  },
                },
                '& .MuiOutlinedInput-input': {
                  py: { xs: 1.25, sm: 1.5 },
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                },
              }}
            />
            <Paper
              elevation={0}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: { xs: 40, sm: 48 },
                height: { xs: 40, sm: 48 },
                borderRadius: { xs: 2, sm: 3 },
                bgcolor: commentText.trim()
                  ? theme.palette.primary.main
                  : alpha(theme.palette.text.primary, 0.1),
                cursor: commentText.trim() ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
                mb: 1,
                '&:hover': commentText.trim()
                  ? {
                      bgcolor: theme.palette.primary.dark,
                      transform: 'scale(1.05)',
                    }
                  : {},
              }}
              onClick={handleSubmitComment}
            >
              <Send
                sx={{
                  fontSize: { xs: '1.1rem', sm: '1.2rem' },
                  color: commentText.trim() ? 'white' : theme.palette.text.disabled,
                }}
              />
            </Paper>
          </Stack>
        </Paper>
      </Box>
    </Drawer>
  );
};

export default CommentDrawer;
