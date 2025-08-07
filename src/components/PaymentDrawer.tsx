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
} from '@mui/material';
import React from 'react';
import { RazorpayOrderOptions, useRazorpay } from 'react-razorpay';

import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useApi } from '@/hooks/use-api-query-hook';
import { paymentApi } from '@/services/api';
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
  const { Razorpay } = useRazorpay();
  const { user, addPurchase } = useAuth();
  const { showError } = useToast();
  const { useApiMutation } = useApi();

  const createOrderMutation = useApiMutation({
    mutationFn: (variables: unknown) => paymentApi.createOrder(variables as number),
  });

  const handlePayment = async () => {
    if (!user) {
      showError('Please sign in to make a purchase');
      return;
    }

    try {
      const orderResponse = await createOrderMutation.mutateAsync(track?.amount || 5);
      const order = orderResponse.data;

      if (!window.Razorpay) {
        showError(
          'Payment gateway is not supported in this browser. Please try a different browser or device.'
        );
        return;
      }

      const options: RazorpayOrderOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? '',
        amount: (order as { id: string; amount: number; currency: string }).amount,
        currency: (order as { id: string; amount: number; currency: string }).currency as 'INR',
        name: 'Rainbow Media',
        description: `Purchase: ${track?.title} by ${track?.artist}`,
        order_id: (order as { id: string; amount: number; currency: string }).id, // Generate order_id on server
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
            showError('Payment successful but failed to update account. Please contact support.');
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
    } catch (error) {
      console.error('Error creating payment order:', error);
    }
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
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            bgcolor: theme.palette.background.paper,
            height: 'auto',
            maxHeight: '75vh',
          },
        },
        backdrop: {
          sx: {},
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
              createOrderMutation.isPending ? (
                <CircularProgress size={20} sx={{ color: 'inherit' }} />
              ) : (
                <Payment />
              )
            }
            onClick={handlePayment}
            disabled={createOrderMutation.isPending}
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
            {createOrderMutation.isPending ? 'Processing...' : `Pay ₹${track.amount || 5} Now`}
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
    </Drawer>
  );
};

export default PaymentDrawer;
