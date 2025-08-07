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
import { useComments } from '@/contexts/CommentContext';
import { formatTimeAgo } from '@/data/commentData';
import { useMobileViewport, getMobileDrawerStyles } from '@/hooks/useMobileViewport';

const CommentDrawer: React.FC = () => {
  const { state, closeComments, addComment, likeComment } = useComments();
  const theme = useTheme();
  const [commentText, setCommentText] = useState('');
  const { isMobile } = useMobileViewport();

  const currentComments = state.currentTrackId ? state.comments[state.currentTrackId] || [] : [];

  const handleClose = () => {
    closeComments();
  };

  const handleSubmitComment = () => {
    if (commentText.trim() && state.currentTrackId) {
      addComment(state.currentTrackId, commentText);
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
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            bgcolor: theme.palette.background.paper,
            backgroundImage: 'none',
            ...getMobileDrawerStyles(isMobile, 85, 50),
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
          sx={{ p: 3, pb: 2 }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar
              sx={{
                bgcolor: theme.palette.primary.main,
                width: 36,
                height: 36,
              }}
            >
              <Iconify icon="material-symbols:comment" width={20} height={20} />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Comments
              </Typography>
              <Chip
                label={`${currentComments.length} ${currentComments.length === 1 ? 'comment' : 'comments'}`}
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.7rem',
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
        <Box sx={{ flex: 1, overflow: 'auto', px: 2 }}>
          {currentComments.length === 0 ? (
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
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                  }}
                >
                  <Iconify icon="material-symbols:comment-outline" width={32} height={32} />
                </Avatar>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ color: theme.palette.text.primary, fontWeight: 600, mb: 1 }}
                  >
                    No comments yet
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
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
                      mx: 1,
                      mb: 2,
                      borderRadius: 3,
                      bgcolor: alpha(theme.palette.background.paper, 0.8),
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.background.paper, 0.9),
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    <ListItem sx={{ py: 2, px: 2.5, alignItems: 'flex-start' }}>
                      <ListItemAvatar>
                        <Avatar
                          src={comment.userAvatar}
                          sx={{
                            width: 40,
                            height: 40,
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
                              sx={{ fontWeight: 700, color: theme.palette.text.primary }}
                            >
                              {comment.username}
                            </Typography>
                            <Chip
                              label={formatTimeAgo(comment.timestamp)}
                              size="small"
                              sx={{
                                height: 16,
                                fontSize: '0.65rem',
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
                            p: 1,
                            borderRadius: 2,
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
                          onClick={() => likeComment(comment.id, comment.trackId)}
                        >
                          <Stack direction="column" alignItems="center" spacing={0.5}>
                            {comment.isLiked ? (
                              <Favorite
                                sx={{ fontSize: '1rem', color: theme.palette.error.main }}
                              />
                            ) : (
                              <FavoriteBorder
                                sx={{ fontSize: '1rem', color: theme.palette.text.secondary }}
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
                                  fontSize: '0.7rem',
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
            m: 2,
            mt: 1,
            p: 2.5,
            borderRadius: 4,
            bgcolor: alpha(theme.palette.background.paper, 0.9),
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="flex-end">
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: theme.palette.primary.main,
                mb: 1,
              }}
            >
              <Typography variant="body2" fontWeight={700} sx={{ color: 'white' }}>
                Y
              </Typography>
            </Avatar>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyPress={handleKeyPress}
              variant="outlined"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
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
                  py: 1.5,
                },
              }}
            />
            <Paper
              elevation={0}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 48,
                height: 48,
                borderRadius: 3,
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
                  fontSize: '1.2rem',
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
