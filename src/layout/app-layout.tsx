'use client';

import { PhoneAndroid, Apple } from '@mui/icons-material';
import { Button, Box, Typography, Container, Stack, Paper, useTheme } from '@mui/material';
import React, { useEffect, useState } from 'react';

import { ThemeToggle } from '../components/ThemeToggle';

type Props = { children: React.ReactNode };

export default function AppLayout({ children }: Props) {
  const [isPortrait, setIsPortrait] = useState(false);

  // Update portrait mode on resize.
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsPortrait(window.matchMedia('(orientation: portrait)').matches);
      const handleResize = () =>
        setIsPortrait(window.matchMedia('(orientation: portrait)').matches);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  if (!isPortrait) return <IsPortraitWarningScreen />;

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh' }}>
      <div>{children}</div>
    </Box>
  );
}

const IsPortraitWarningScreen = () => {
  const theme = useTheme();

  const platformConfig = [
    {
      name: 'Android',
      icon: <PhoneAndroid sx={{ fontSize: 20 }} />,
      url: 'https://play.google.com/store/apps',
    },
    {
      name: 'iOS',
      icon: <Apple sx={{ fontSize: 20 }} />,
      url: 'https://apps.apple.com/us/app',
    },
  ] as const;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.palette.background.default,
        p: 3,
        position: 'relative',
      }}
    >
      {/* Theme Toggle Button */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 1000,
        }}
      >
        <ThemeToggle />
      </Box>

      <Container>
        <Paper
          elevation={theme.palette.mode === 'dark' ? 8 : 1}
          sx={{
            p: { xs: 4, sm: 6, md: 8 },
            borderRadius: 3,
            textAlign: 'center',
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            maxWidth: 600,
            mx: 'auto',
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            color="text.primary"
            sx={{
              fontWeight: 600,
              mb: 2,
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
            }}
          >
            Please Rotate Your Device
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              mb: 4,
              lineHeight: 1.6,
              fontSize: '1.1rem',
              maxWidth: 480,
              mx: 'auto',
            }}
          >
            This application is optimized for portrait orientation. For the best experience, please
            rotate your device or download our mobile app.
          </Typography>

          <Stack
            spacing={2}
            direction={{ xs: 'column', sm: 'row' }}
            sx={{ maxWidth: 400, mx: 'auto' }}
          >
            {platformConfig.map(({ name, icon, url }) => (
              <Button
                key={name}
                variant="outlined"
                size="large"
                startIcon={icon}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  flex: 1,
                  py: 1.25,
                  px: 3,
                  borderRadius: 2,
                  borderColor: theme.palette.divider,
                  color: theme.palette.text.primary,
                  backgroundColor: theme.palette.background.paper,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                    borderColor: theme.palette.primary.main,
                    transform: 'translateY(-1px)',
                    boxShadow: theme.shadows[4],
                  },
                }}
              >
                Download for {name}
              </Button>
            ))}
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};
