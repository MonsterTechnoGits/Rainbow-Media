'use client';

import { Shield } from '@mui/icons-material';
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  Avatar,
  useTheme,
  alpha,
  Button,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

import Iconify from '@/components/iconify';
import Toolbar from '@/components/Toolbar';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminPage() {
  const theme = useTheme();
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Redirect if not admin or not authenticated
    if (!loading && (!user || !user.isAdmin)) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Show loading while checking auth
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="60vh"
          flexDirection="column"
        >
          <Box sx={{ mb: 2 }}>
            <Iconify
              icon="material-symbols:admin-panel-settings"
              width={48}
              height={48}
              sx={{ color: theme.palette.primary.main }}
            />
          </Box>
          <Typography variant="h6" color="text.secondary">
            Verifying admin access...
          </Typography>
        </Box>
      </Container>
    );
  }

  // Show access denied if not admin
  if (!user || !user.isAdmin) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="60vh"
          flexDirection="column"
        >
          <Paper
            sx={{
              p: 4,
              textAlign: 'center',
              borderRadius: 3,
              maxWidth: 400,
            }}
          >
            <Avatar
              sx={{
                bgcolor: alpha(theme.palette.error.main, 0.1),
                color: theme.palette.error.main,
                width: 64,
                height: 64,
                mx: 'auto',
                mb: 2,
              }}
            >
              <Shield sx={{ fontSize: 32 }} />
            </Avatar>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              Access Denied
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              You don't have permission to access this page. Admin privileges are required.
            </Typography>
            <Button
              variant="contained"
              onClick={() => router.push('/')}
              startIcon={<Iconify icon="material-symbols:home" width={20} height={20} />}
            >
              Go Home
            </Button>
          </Paper>
        </Box>
      </Container>
    );
  }

  // Admin dashboard content
  return (
    <>
      <Toolbar title="Admin Dashboard" showBackButton={true} />
      <Container maxWidth="lg" sx={{ pt: { xs: 9, sm: 12 }, pb: 4 }}>
        <Stack spacing={4}>
          {/* Header */}
          <Paper
            sx={{
              p: 4,
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
                top: -50,
                right: -50,
                width: 120,
                height: 120,
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
                  bgcolor: 'rgba(255,255,255,0.2)',
                  width: 64,
                  height: 64,
                }}
              >
                <Shield sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  Admin Dashboard
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Welcome back, {user.displayName || 'Admin'}! Manage your platform from here.
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Main Content Area */}
          <Paper
            sx={{
              p: 4,
              borderRadius: 3,
              minHeight: '400px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <Box sx={{ mb: 3 }}>
              <Iconify
                icon="material-symbols:construction"
                width={80}
                height={80}
                sx={{ color: theme.palette.text.secondary, opacity: 0.5 }}
              />
            </Box>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              Admin Features Coming Soon
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500 }}>
              This admin dashboard is currently empty. Admin functionality will be added here in
              future updates. You can manage users, tracks, analytics, and platform settings from
              this page.
            </Typography>
          </Paper>
        </Stack>
      </Container>
    </>
  );
}
