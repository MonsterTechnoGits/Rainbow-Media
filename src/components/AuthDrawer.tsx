'use client';

import { Google, MusicNote, Security, Star } from '@mui/icons-material';
import {
  Drawer,
  Box,
  Typography,
  Button,
  Stack,
  Paper,
  Avatar,
  CircularProgress,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import React from 'react';

import { useAuth } from '@/contexts/AuthContext';

interface AuthDrawerProps {
  open: boolean;
  onClose: () => void;
  trackTitle?: string;
  trackPrice?: number;
  onAuthSuccess?: () => void;
}

const AuthDrawer: React.FC<AuthDrawerProps> = ({
  open,
  onClose,
  trackTitle,
  trackPrice = 5,
  onAuthSuccess,
}) => {
  const { signInWithGoogle, signInWithGoogleRedirect, loading } = useAuth();
  const theme = useTheme();

  const isMobile = () => {
    if (typeof window === 'undefined') return false;
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      window.innerWidth <= 768
    );
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      onAuthSuccess?.();
      onClose();
    } catch (error: unknown) {
      console.error('Sign in failed:', error);
      // Show user-friendly error message
      const errorMessage =
        error instanceof Error ? error.message : 'Sign in failed. Please try again.';
      alert(errorMessage);
    }
  };

  const handleGoogleSignInRedirect = async () => {
    try {
      await signInWithGoogleRedirect();
      // Redirect will happen, no need to call onAuthSuccess here
    } catch (error: unknown) {
      console.error('Redirect sign in failed:', error);
      alert('Sign in failed. Please try again.');
    }
  };

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          bgcolor: theme.palette.background.paper,
          maxHeight: '90vh',
        },
      }}
    >
      <Box sx={{ p: 3, pb: 4 }}>
        {/* Handle bar */}
        <Box
          sx={{
            width: 40,
            height: 4,
            bgcolor: alpha(theme.palette.text.secondary, 0.3),
            borderRadius: 2,
            mx: 'auto',
            mb: 3,
          }}
        />

        {/* Header */}
        <Stack alignItems="center" spacing={2} sx={{ mb: 4 }}>
          <Paper
            elevation={0}
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            }}
          >
            <MusicNote sx={{ fontSize: 32, color: 'white' }} />
          </Paper>

          <Box textAlign="center">
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Sign In Required
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 280 }}>
              {trackTitle
                ? `To play "${trackTitle}" (₹${trackPrice})`
                : 'To access premium content, please sign in with your Google account'}
            </Typography>
          </Box>
        </Stack>

        {/* Features */}
        <Stack spacing={2} sx={{ mb: 4 }}>
          {[
            { icon: Security, text: 'Secure authentication with Google' },
            { icon: Star, text: 'Access to premium music library' },
            { icon: MusicNote, text: 'High-quality audio streaming' },
          ].map((feature, index) => (
            <Paper
              key={index}
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                  }}
                >
                  <feature.icon sx={{ fontSize: 16 }} />
                </Avatar>
                <Typography variant="body2" fontWeight={500}>
                  {feature.text}
                </Typography>
              </Stack>
            </Paper>
          ))}
        </Stack>

        <Divider sx={{ mb: 3 }} />

        {/* Sign In Buttons */}
        <Stack spacing={2}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={
              loading ? <CircularProgress size={20} sx={{ color: 'inherit' }} /> : <Google />
            }
            onClick={handleGoogleSignIn}
            disabled={loading}
            sx={{
              py: 1.5,
              borderRadius: 3,
              fontWeight: 600,
              fontSize: '1rem',
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
              },
              '&:disabled': {
                background: alpha(theme.palette.text.secondary, 0.3),
              },
            }}
          >
            {loading
              ? 'Signing In...'
              : isMobile()
                ? 'Sign In with Google (Redirect)'
                : 'Sign In with Google'}
          </Button>

          {/* Only show alternative method on desktop */}
          {!isMobile() && (
            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<Google />}
              onClick={handleGoogleSignInRedirect}
              disabled={loading}
              sx={{
                py: 1.5,
                borderRadius: 3,
                fontWeight: 600,
                fontSize: '1rem',
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
                '&:hover': {
                  borderColor: theme.palette.primary.dark,
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                },
              }}
            >
              Alternative Sign In Method
            </Button>
          )}
        </Stack>

        {/* Privacy Notice */}
        <Typography
          variant="caption"
          color="text.secondary"
          textAlign="center"
          sx={{ mt: 2, display: 'block', lineHeight: 1.4 }}
        >
          {isMobile()
            ? 'You will be redirected to Google for secure sign-in, then back to the app. Your data is protected.'
            : 'By signing in, you agree to our Terms of Service and Privacy Policy. Your data is secure and protected.'}
        </Typography>
      </Box>
    </Drawer>
  );
};

export default AuthDrawer;
