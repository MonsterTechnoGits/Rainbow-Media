'use client';

import { Payment, MusicNote, CheckCircle, Shield } from '@mui/icons-material';
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
  Chip,
  Snackbar,
  Alert,
} from '@mui/material';
import React, { useState } from 'react';
import { RazorpayOrderOptions, useRazorpay } from 'react-razorpay';

import { useAuth } from '@/contexts/AuthContext';
import { MusicTrack } from '@/types/music';

interface PaymentDrawerProps {
  open: boolean;
  onClose: () => void;
  track: MusicTrack | null;
  onPaymentSuccess: () => void;
}

const PaymentDrawer: React.FC<PaymentDrawerProps> = ({
  open,
  onClose,
  track,
  onPaymentSuccess,
}) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const { Razorpay } = useRazorpay();
  const { user, addPurchase } = useAuth();

  // Toast state management
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const showToast = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setToast({ open: true, message, severity });
  };

  const closeToast = () => {
    setToast((prev) => ({ ...prev, open: false }));
  };

  const handlePayment = async () => {
    if (!user) {
      showToast('Please sign in to make a purchase', 'warning');
      return;
    }

    setLoading(true);
    const res = await fetch('/api/razorpay/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: track?.amount || 5 }), // amount in INR
    });

    const order = await res.json();
    setLoading(false);

    if (!window.Razorpay) {
      showToast(
        'Payment gateway is not supported in this browser. Please try a different browser or device.',
        'error'
      );
      return;
    }

    const options: RazorpayOrderOptions = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? '',
      amount: order.amount,
      currency: order.currency,
      name: 'Rainbow Media',
      description: `Purchase: ${track?.title} by ${track?.artist}`,
      order_id: order.id, // Generate order_id on server
      handler: async (response) => {
        try {
          // Add purchase to user's account
          if (track?.id) {
            await addPurchase(track.id);
          }
          console.log('Payment successful:', response);
          onPaymentSuccess();
          onClose();
        } catch (error) {
          console.error('Error processing payment:', error);
          showToast(
            'Payment successful but failed to update account. Please contact support.',
            'error'
          );
        }
      },
      prefill: {
        name: user?.displayName || 'Guest User',
        email: user?.email || '',
        contact: '',
      },
      theme: {
        color: '#F37254',
      },
    };

    const razorpayInstance = new Razorpay(options);
    razorpayInstance.open();

    // const razor = new window.Razorpay(options);
    // razor.open();
  };

  if (!track) return null;

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            bgcolor: theme.palette.background.paper,
            maxHeight: '90vh',
          },
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

        {/* Track Info */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          }}
        >
          <Stack direction="row" spacing={3} alignItems="center">
            <Avatar
              variant="rounded"
              src={track.coverUrl}
              sx={{
                width: 60,
                height: 60,
                borderRadius: 2,
                bgcolor: theme.palette.primary.main,
              }}
            >
              <MusicNote />
            </Avatar>

            <Box flex={1}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {track.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {track.artist} • {track.album}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={track.genre}
                  size="small"
                  sx={{
                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                    color: theme.palette.secondary.main,
                  }}
                />
                <Chip
                  label="Premium"
                  size="small"
                  sx={{
                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                    color: theme.palette.warning.main,
                  }}
                />
              </Stack>
            </Box>

            <Box textAlign="right">
              <Typography variant="h5" fontWeight={700} color="primary">
                ₹{track.amount || 5}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                One-time purchase
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Features */}
        <Typography variant="h6" fontWeight={600} gutterBottom>
          What you'll get:
        </Typography>

        <Stack spacing={2} sx={{ mb: 4 }}>
          {[
            { icon: CheckCircle, text: 'Unlimited plays of this track' },
            { icon: MusicNote, text: 'High-quality 320kbps audio' },
            { icon: Shield, text: 'Secure payment via Razorpay' },
          ].map((feature, index) => (
            <Stack key={index} direction="row" alignItems="center" spacing={2}>
              <Avatar
                sx={{
                  width: 24,
                  height: 24,
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  color: theme.palette.success.main,
                }}
              >
                <feature.icon sx={{ fontSize: 14 }} />
              </Avatar>
              <Typography variant="body2" color="text.secondary">
                {feature.text}
              </Typography>
            </Stack>
          ))}
        </Stack>

        <Divider sx={{ mb: 3 }} />

        {/* Payment Button */}
        <Stack spacing={2}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={
              loading ? <CircularProgress size={20} sx={{ color: 'inherit' }} /> : <Payment />
            }
            onClick={handlePayment}
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
            }}
          >
            {loading ? 'Processing...' : `Pay ₹${track.amount || 5} Now`}
          </Button>

          <Button
            fullWidth
            variant="text"
            onClick={onClose}
            sx={{ color: theme.palette.text.secondary }}
          >
            Cancel
          </Button>
        </Stack>

        {/* Powered by Razorpay */}
        <Box textAlign="center" sx={{ mt: 3 }}>
          <Typography variant="caption" color="text.secondary">
            Powered by Razorpay • Secure payments
          </Typography>
        </Box>
      </Box>

      {/* Toast Notifications */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={closeToast}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={closeToast} severity={toast.severity} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Drawer>
  );
};

export default PaymentDrawer;
