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
import { doc, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { MusicTrack, PurchaseDetails } from '@/types/music';

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
  const { user, addPurchase } = useAuth();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);

  const waitForRazorpay = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) {
        resolve();
        return;
      }

      const maxAttempts = 20; // Wait up to 4 seconds
      let attempts = 0;

      const checkInterval = setInterval(() => {
        attempts++;
        if (window.Razorpay) {
          clearInterval(checkInterval);
          resolve();
        } else if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          reject(new Error('Razorpay script failed to load'));
        }
      }, 200);
    });
  };

  const handlePayment = async () => {
    if (!track || !user) {
      alert('Missing track or user information');
      return;
    }

    setLoading(true);

    try {
      // Wait for Razorpay script to load
      console.log('Waiting for Razorpay script to load...');
      await waitForRazorpay();
      console.log('Razorpay script loaded successfully, typeof:', typeof window.Razorpay);

      // Add small delay to ensure everything is ready
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log('Additional delay completed');
    } catch (error) {
      console.error('Razorpay script loading failed:', error);
      alert('Payment gateway failed to load. Please refresh the page and try again.');
      setLoading(false);
      return;
    }

    try {
      console.log('Creating order for track:', track.title, 'Amount:', track.amount || 5);

      const orderResponse = await fetch('/api/razorpay-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: (track.amount || 5) * 100, // Convert to paise
        }),
      });

      console.log('Order response status:', orderResponse.status);

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        console.error('Order creation failed:', errorData);
        throw new Error(errorData.error || 'Failed to create order');
      }

      const orderData = await orderResponse.json();
      console.log('Order created successfully:', orderData);

      if (!orderData.id) {
        throw new Error('Invalid order data received - missing order ID');
      }

      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        throw new Error('Razorpay key is not configured');
      }

      // Detect mobile device
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      console.log('Is Mobile Device:', isMobile);

      // EXACT copy of working test page configuration
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'RainbowMedia Test', // Same name as test page
        description: 'Test Payment', // Same description as test page
        order_id: orderData.id,
        handler: function (response: { razorpay_payment_id: string; razorpay_order_id: string }) {
          console.log('✅ Payment Successful! Payment ID:', response.razorpay_payment_id);
          setLoading(false);

          // Process the payment asynchronously
          (async () => {
            try {
              // Add track to user's purchases
              await addPurchase(track.id);

              // Store detailed purchase information in Firestore
              const purchaseDetails: PurchaseDetails = {
                trackId: track.id,
                amount: track.amount || 5,
                currency: track.currency || 'INR',
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                timestamp: Date.now(),
              };

              // Store purchase details in Firestore
              if (db) {
                const purchaseRef = doc(db, 'purchases', response.razorpay_payment_id);
                await setDoc(purchaseRef, {
                  ...purchaseDetails,
                  userId: user.uid,
                  trackTitle: track.title,
                  trackArtist: track.artist,
                });
              }

              console.log('Purchase processed successfully:', purchaseDetails);
              alert(`Payment successful! Track "${track.title}" is now available.`);
              onPaymentSuccess();
              onClose();
            } catch (error) {
              console.error('Error processing successful payment:', error);
              alert(
                'Payment successful, but there was an error saving your purchase. Please contact support.'
              );
            }
          })();
        },
        prefill: {
          name: 'Test User', // Same as test page
          email: 'test@example.com', // Same as test page
        },
        theme: {
          color: '#1976d2', // Same as test page
        },
        modal: {
          ondismiss: () => {
            console.log('Payment cancelled by user');
            setLoading(false);
          },
        },
      };

      console.log('Opening Razorpay payment modal with options:', {
        key: options.key.substring(0, 12) + '...',
        amount: orderData.amount,
        currency: orderData.currency,
        orderId: orderData.id,
      });

      // Detailed debugging
      console.log('=== RAZORPAY DEBUG START ===');
      console.log('Current URL:', window.location.href);
      console.log('User agent:', navigator.userAgent);
      console.log('Razorpay object type:', typeof window.Razorpay);
      console.log('Razorpay key (first 8 chars):', options.key.substring(0, 8));
      console.log('Order amount:', orderData.amount);
      console.log('Order currency:', orderData.currency);

      // Check for script conflicts
      const scripts = Array.from(document.querySelectorAll('script')).filter(
        (s) => s.src.includes('razorpay') || s.src.includes('checkout')
      );
      console.log(
        'Razorpay scripts loaded:',
        scripts.map((s) => s.src)
      );
      console.log(
        'Window keys with "razor":',
        Object.keys(window).filter((k) => k.toLowerCase().includes('razor'))
      );

      console.log(
        'Full options object:',
        JSON.stringify(
          {
            ...options,
            handler: '[Function]',
          },
          null,
          2
        )
      );

      try {
        console.log('Creating Razorpay instance...');

        // Force clean Razorpay instance
        const RazorpayConstructor = window.Razorpay;
        const paymentObject = new RazorpayConstructor(options);

        console.log('Razorpay instance created successfully, type:', typeof paymentObject);
        console.log('PaymentObject methods:', Object.getOwnPropertyNames(paymentObject));

        // Add delay before opening to ensure DOM is ready
        await new Promise((resolve) => setTimeout(resolve, 100));

        console.log('Opening Razorpay modal...');

        // Add global error listener to catch Razorpay internal errors
        const originalOnError = window.onerror;
        const originalOnUnhandledRejection = window.onunhandledrejection;

        window.onerror = (message, source, lineno, colno, error) => {
          console.error('🚨 Window Error (possibly from Razorpay):', {
            message,
            source,
            lineno,
            colno,
            error,
          });
          if (originalOnError) originalOnError(message, source, lineno, colno, error);
        };

        window.onunhandledrejection = (event) => {
          console.error('🚨 Unhandled Rejection (possibly from Razorpay):', event.reason);
          if (originalOnUnhandledRejection) originalOnUnhandledRejection.call(window, event);
        };

        // Monitor for any alerts
        const originalAlert = window.alert;
        window.alert = (message) => {
          console.error('🚨 Alert captured:', message);
          console.trace('Alert stack trace');
          return originalAlert(message);
        };

        // Try to isolate Razorpay from CSS conflicts
        document.body.style.cssText +=
          '; position: relative !important; z-index: 999999 !important;';

        paymentObject.open();
        console.log('Razorpay modal opened successfully');

        // Restore after 5 seconds
        setTimeout(() => {
          window.onerror = originalOnError;
          window.onunhandledrejection = originalOnUnhandledRejection;
          window.alert = originalAlert;
        }, 5000);
      } catch (razorpayError) {
        console.error('=== RAZORPAY ERROR ===');
        console.error('Error type:', typeof razorpayError);
        console.error(
          'Error message:',
          razorpayError instanceof Error ? razorpayError.message : razorpayError
        );
        console.error(
          'Error stack:',
          razorpayError instanceof Error ? razorpayError.stack : 'No stack'
        );
        console.error('=== END RAZORPAY ERROR ===');

        // Handle mobile browser compatibility issues
        if (isMobile) {
          alert(
            '⚠️ Mobile Payment Issue\n\nPlease try:\n1. Open in Chrome mobile browser\n2. Enable JavaScript and cookies\n3. Disable any ad blockers\n4. Try on desktop for best experience'
          );
        }

        throw razorpayError;
      }

      console.log('=== RAZORPAY DEBUG END ===');
    } catch (error) {
      console.error('Payment initiation failed:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to initiate payment. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
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
    </Drawer>
  );
};

export default PaymentDrawer;
