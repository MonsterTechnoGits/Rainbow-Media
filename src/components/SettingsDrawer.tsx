'use client';

import { ExitToApp } from '@mui/icons-material';
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  useTheme,
  Avatar,
  Stack,
  Chip,
  Paper,
  IconButton,
  Button,
  alpha,
  ListItemButton,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import React from 'react';

import AuthDrawer from '@/components/AuthDrawer';
import Iconify from '@/components/iconify';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { useMobileViewport, getMobileDrawerStyles } from '@/hooks/use-mobile-view-port';
import { useThemeMode } from '@/theme/ThemeProvider';

interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function SettingsDrawer({ open, onClose }: SettingsDrawerProps) {
  const theme = useTheme();
  const router = useRouter();
  const { mode } = useThemeMode();
  const { user, signOut, loading } = useAuth();
  const [showAuthDrawer, setShowAuthDrawer] = React.useState(false);
  const { isMobile } = useMobileViewport();

  const handleSignOut = async () => {
    try {
      await signOut();
      onClose();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSignIn = () => {
    setShowAuthDrawer(true);
  };

  const handleAuthSuccess = () => {
    setShowAuthDrawer(false);
  };

  const handleAdminClick = () => {
    router.push('/admin');
    onClose();
  };

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            bgcolor: theme.palette.background.paper,
            ...getMobileDrawerStyles(isMobile, 90, 70),
          },
        },
        backdrop: {
          sx: {},
        },
      }}
    >
      <Box sx={{ p: 3, pb: 6 }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight={700}>
            Settings
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Iconify icon="material-symbols:close" width={24} height={24} />
          </IconButton>
        </Stack>

        {/* Profile Header */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            background: user
              ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
              : `linear-gradient(135deg, ${alpha(theme.palette.text.secondary, 0.5)}, ${alpha(theme.palette.text.secondary, 0.3)})`,
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
              src={user?.photoURL}
              sx={{
                width: 60,
                height: 60,
                bgcolor: 'rgba(255,255,255,0.2)',
              }}
            >
              {user?.displayName ? (
                user.displayName.charAt(0).toUpperCase()
              ) : (
                <Iconify icon="material-symbols:person" width={28} height={28} />
              )}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                {user ? user.displayName || 'User' : 'Not Signed In'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {user ? user.email : 'Sign in to access premium features'}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Chip
                  label={`${mode === 'dark' ? 'Dark' : 'Light'} Mode`}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontSize: '0.75rem',
                  }}
                />
                {user && (
                  <Chip
                    label={`${user.purchases?.length || 0} Purchases`}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      fontSize: '0.75rem',
                    }}
                  />
                )}
              </Stack>
            </Box>
          </Stack>

          {/* Sign Out Button */}
          {user && (
            <Button
              variant="outlined"
              startIcon={<ExitToApp />}
              onClick={handleSignOut}
              disabled={loading}
              sx={{
                mt: 2,
                borderColor: 'rgba(255,255,255,0.3)',
                color: 'white',
                '&:hover': {
                  borderColor: 'rgba(255,255,255,0.6)',
                  bgcolor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              Sign Out
            </Button>
          )}
        </Paper>

        {/* Account Section */}
        {user && (
          <Box sx={{ mb: 3 }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
              <Avatar
                sx={{
                  bgcolor: theme.palette.success.main,
                  width: 36,
                  height: 36,
                }}
              >
                <Iconify icon="material-symbols:account-circle" width={20} height={20} />
              </Avatar>
              <Typography variant="h6" fontWeight={600}>
                Account
              </Typography>
            </Stack>

            <Paper elevation={1} sx={{ borderRadius: 2 }}>
              <List disablePadding>
                <ListItem sx={{ py: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mr: 2 }}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 1.5,
                        bgcolor: alpha(theme.palette.success.main, 0.1),
                      }}
                    >
                      <Iconify
                        icon="material-symbols:person"
                        width={20}
                        height={20}
                        sx={{ color: theme.palette.success.main }}
                      />
                    </Box>
                  </Stack>
                  <ListItemText
                    primary="Profile"
                    secondary={user.displayName || 'No display name'}
                    slotProps={{
                      primary: { style: { fontWeight: 600 } },
                    }}
                  />
                  <Iconify icon="material-symbols:chevron-right" width={20} height={20} />
                </ListItem>

                <Divider variant="inset" sx={{ ml: 7 }} />

                <ListItem sx={{ py: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mr: 2 }}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 1.5,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                      }}
                    >
                      <Iconify
                        icon="material-symbols:shopping-cart"
                        width={20}
                        height={20}
                        sx={{ color: theme.palette.primary.main }}
                      />
                    </Box>
                  </Stack>
                  <ListItemText
                    primary="Purchases"
                    secondary={`${user.purchases?.length || 0} tracks purchased`}
                    slotProps={{
                      primary: { style: { fontWeight: 600 } },
                    }}
                  />
                  <Iconify icon="material-symbols:chevron-right" width={20} height={20} />
                </ListItem>

                <Divider variant="inset" sx={{ ml: 7 }} />

                <ListItem sx={{ py: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mr: 2 }}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 1.5,
                        bgcolor: alpha(theme.palette.warning.main, 0.1),
                      }}
                    >
                      <Iconify
                        icon="material-symbols:email"
                        width={20}
                        height={20}
                        sx={{ color: theme.palette.warning.main }}
                      />
                    </Box>
                  </Stack>
                  <ListItemText
                    primary="Email"
                    secondary={user.email}
                    slotProps={{
                      primary: { style: { fontWeight: 600 } },
                    }}
                  />
                </ListItem>

                {/* Admin Option - Only shown to admin users */}
                {user.isAdmin && (
                  <>
                    <Divider variant="inset" sx={{ ml: 7 }} />
                    <ListItemButton sx={{ py: 2 }} onClick={handleAdminClick}>
                      <Stack direction="row" alignItems="center" spacing={2} sx={{ mr: 2 }}>
                        <Box
                          sx={{
                            p: 1,
                            borderRadius: 1.5,
                            bgcolor: alpha(theme.palette.error.main, 0.1),
                          }}
                        >
                          <Iconify
                            icon="material-symbols:admin-panel-settings"
                            width={20}
                            height={20}
                            sx={{ color: theme.palette.error.main }}
                          />
                        </Box>
                      </Stack>
                      <ListItemText
                        primary="Admin Dashboard"
                        secondary="Manage platform settings"
                        slotProps={{
                          primary: { style: { fontWeight: 600 } },
                        }}
                      />
                      <Iconify icon="material-symbols:chevron-right" width={20} height={20} />
                    </ListItemButton>
                  </>
                )}
              </List>
            </Paper>
          </Box>
        )}

        {/* Sign In Section for Non-Authenticated Users */}
        {!user && (
          <Box sx={{ mb: 3 }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
              <Avatar
                sx={{
                  bgcolor: theme.palette.warning.main,
                  width: 36,
                  height: 36,
                }}
              >
                <Iconify icon="material-symbols:login" width={20} height={20} />
              </Avatar>
              <Typography variant="h6" fontWeight={600}>
                Get Started
              </Typography>
            </Stack>

            <Paper elevation={1} sx={{ borderRadius: 2 }}>
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Iconify
                  icon="material-symbols:music-note"
                  width={48}
                  height={48}
                  sx={{
                    color: theme.palette.primary.main,
                    mb: 2,
                  }}
                />
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Sign In to Unlock Premium
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Access paid tracks, sync your purchases, and enjoy premium features
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleSignIn}
                  startIcon={<Iconify icon="material-symbols:login" width={20} height={20} />}
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                    },
                  }}
                >
                  Sign In with Google
                </Button>
              </Box>
            </Paper>
          </Box>
        )}

        {/* Appearance Section */}
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <Avatar
              sx={{
                bgcolor: theme.palette.primary.main,
                width: 36,
                height: 36,
              }}
            >
              <Iconify icon="material-symbols:palette" width={20} height={20} />
            </Avatar>
            <Typography variant="h6" fontWeight={600}>
              Appearance
            </Typography>
          </Stack>

          <Paper elevation={1} sx={{ borderRadius: 2 }}>
            <List disablePadding>
              <ListItem sx={{ py: 2.5 }}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mr: 2 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1.5,
                      bgcolor:
                        theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.05)'
                          : 'rgba(0,0,0,0.05)',
                    }}
                  >
                    <Iconify
                      icon={
                        mode === 'dark'
                          ? 'material-symbols:dark-mode'
                          : 'material-symbols:light-mode'
                      }
                      width={20}
                      height={20}
                      sx={{ color: theme.palette.primary.main }}
                    />
                  </Box>
                </Stack>
                <ListItemText
                  primary="Theme Mode"
                  secondary="Switch between light and dark mode"
                  slotProps={{
                    primary: { style: { fontWeight: 600 } },
                  }}
                />
                <Box sx={{ ml: 'auto' }}>
                  <ThemeToggle size="medium" />
                </Box>
              </ListItem>
            </List>
          </Paper>
        </Box>

        {/* Other Settings */}
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <Avatar
              sx={{
                bgcolor: theme.palette.secondary.main,
                width: 36,
                height: 36,
              }}
            >
              <Iconify icon="material-symbols:tune" width={20} height={20} />
            </Avatar>
            <Typography variant="h6" fontWeight={600}>
              Preferences
            </Typography>
          </Stack>

          <Paper elevation={1} sx={{ borderRadius: 2 }}>
            <List disablePadding>
              <ListItem sx={{ py: 2 }}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mr: 2 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1.5,
                      bgcolor:
                        theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.05)'
                          : 'rgba(0,0,0,0.05)',
                    }}
                  >
                    <Iconify
                      icon="material-symbols:notifications"
                      width={20}
                      height={20}
                      sx={{ color: theme.palette.warning.main }}
                    />
                  </Box>
                </Stack>
                <ListItemText
                  primary="Notifications"
                  secondary="Manage your notification preferences"
                  slotProps={{
                    primary: { style: { fontWeight: 600 } },
                  }}
                />
                <Iconify icon="material-symbols:chevron-right" width={20} height={20} />
              </ListItem>

              <Divider variant="inset" sx={{ ml: 7 }} />

              <ListItem sx={{ py: 2 }}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mr: 2 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1.5,
                      bgcolor:
                        theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.05)'
                          : 'rgba(0,0,0,0.05)',
                    }}
                  >
                    <Iconify
                      icon="material-symbols:language"
                      width={20}
                      height={20}
                      sx={{ color: theme.palette.info.main }}
                    />
                  </Box>
                </Stack>
                <ListItemText
                  primary="Language"
                  secondary="English (US)"
                  slotProps={{
                    primary: { style: { fontWeight: 600 } },
                  }}
                />
                <Iconify icon="material-symbols:chevron-right" width={20} height={20} />
              </ListItem>
            </List>
          </Paper>
        </Box>

        {/* About Section */}
        <Box>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <Avatar
              sx={{
                bgcolor: theme.palette.info.main,
                width: 36,
                height: 36,
              }}
            >
              <Iconify icon="material-symbols:info" width={20} height={20} />
            </Avatar>
            <Typography variant="h6" fontWeight={600}>
              About
            </Typography>
          </Stack>

          <Paper elevation={1} sx={{ borderRadius: 2 }}>
            <List disablePadding>
              <ListItem sx={{ py: 1.5 }}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mr: 2 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1.5,
                      bgcolor:
                        theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.05)'
                          : 'rgba(0,0,0,0.05)',
                    }}
                  >
                    <Iconify
                      icon="material-symbols:apps"
                      width={16}
                      height={16}
                      sx={{ color: theme.palette.success.main }}
                    />
                  </Box>
                </Stack>
                <ListItemText
                  primary="Version"
                  secondary="1.0.0 Beta"
                  slotProps={{
                    primary: { style: { fontWeight: 600, fontSize: '0.95rem' } },
                    secondary: { style: { fontSize: '0.85rem' } },
                  }}
                />
              </ListItem>

              <Divider variant="inset" sx={{ ml: 7 }} />

              <ListItem sx={{ py: 1.5 }}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mr: 2 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1.5,
                      bgcolor:
                        theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.05)'
                          : 'rgba(0,0,0,0.05)',
                    }}
                  >
                    <Iconify
                      icon="material-symbols:code"
                      width={16}
                      height={16}
                      sx={{ color: theme.palette.secondary.main }}
                    />
                  </Box>
                </Stack>
                <ListItemText
                  primary="Built with"
                  secondary="React + Material-UI"
                  slotProps={{
                    primary: { style: { fontWeight: 600, fontSize: '0.95rem' } },
                    secondary: { style: { fontSize: '0.85rem' } },
                  }}
                />
              </ListItem>
            </List>
          </Paper>
        </Box>
      </Box>

      {/* Authentication Drawer */}
      <AuthDrawer
        open={showAuthDrawer}
        onClose={() => setShowAuthDrawer(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </Drawer>
  );
}
