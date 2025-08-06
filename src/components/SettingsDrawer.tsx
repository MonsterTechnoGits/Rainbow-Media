'use client';

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
} from '@mui/material';

import Iconify from '@/components/iconify';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useThemeMode } from '@/theme/ThemeProvider';

interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function SettingsDrawer({ open, onClose }: SettingsDrawerProps) {
  const theme = useTheme();
  const { mode } = useThemeMode();

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
            height: '100vh',
            maxHeight: '100vh',
            bgcolor: theme.palette.background.paper,
          },
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
              <Iconify icon="material-symbols:person" width={28} height={28} />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                iBudget
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Personal Finance Manager
              </Typography>
              <Chip
                label={`${mode === 'dark' ? 'Dark' : 'Light'} Mode`}
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
    </Drawer>
  );
}
