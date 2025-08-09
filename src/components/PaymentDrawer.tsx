'use client';

import {
  Payment,
  MusicNote,
  CheckCircle,
  Shield,
  PlayArrow,
  VolunteerActivism,
} from '@mui/icons-material';
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
  TextField,
  InputAdornment,
} from '@mui/material';
import React from 'react';
import { RazorpayOrderOptions, useRazorpay } from 'react-razorpay';

import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useApi } from '@/hooks/use-api-query-hook';
import { paymentApi } from '@/services/api';
import { donationService, purchaseService } from '@/services/firestore-user';
import { AudioStory, DonationDetails } from '@/types/audio-story';

interface PaymentDrawerProps {
  open: boolean;
  onClose: () => void;
  story: AudioStory | null;
  onPaymentSuccess: () => void;
  onSkipPayment?: () => void; // New prop for free play
  isDonation?: boolean; // New prop to indicate donation flow
}

const PaymentDrawer: React.FC<PaymentDrawerProps> = ({
  open,
  onClose,
  story,
  onPaymentSuccess,
  onSkipPayment,
  isDonation = false,
}) => {
  const theme = useTheme();
  const { Razorpay } = useRazorpay();
  const { user, addPurchase } = useAuth();
  const { showError } = useToast();
  const { useApiMutation } = useApi();

  const createOrderMutation = useApiMutation({
    mutationFn: (variables: unknown) => paymentApi.createOrder(variables as number),
  });

  // Donation-related state
  const [selectedAmount, setSelectedAmount] = React.useState<number | null>(null);
  const [customAmount, setCustomAmount] = React.useState<string>('');
  const [isCustomAmountValid, setIsCustomAmountValid] = React.useState<boolean>(true);

  // Predefined donation amounts
  const donationAmounts = [10, 100, 200, 500, 1000];

  // Reset state when drawer opens/closes
  React.useEffect(() => {
    if (!open) {
      setSelectedAmount(null);
      setCustomAmount('');
      setIsCustomAmountValid(true);
    }
  }, [open]);

  // Handle chip selection
  const handleChipSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  // Handle custom amount input
  const handleCustomAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setCustomAmount(value);
    setSelectedAmount(null);

    if (value === '') {
      setIsCustomAmountValid(true);
      return;
    }

    const numValue = parseFloat(value);
    const minAmount = story?.amount || 5;
    const isValid = !isNaN(numValue) && numValue >= minAmount;
    setIsCustomAmountValid(isValid);
  };

  // Get the final amount to be paid
  const getFinalAmount = (): number => {
    if (isDonation) {
      if (selectedAmount) return selectedAmount;
      if (customAmount && isCustomAmountValid) {
        return parseFloat(customAmount);
      }
      return 0;
    }
    return story?.amount || 5;
  };

  const handleSkip = () => {
    // Play story for free without affecting purchase history
    if (onSkipPayment) {
      onSkipPayment();
    }
    onClose();
  };

  const handlePayment = async () => {
    if (!user) {
      showError(`Please sign in to make a ${isDonation ? 'donation' : 'purchase'}`);
      return;
    }

    if (isDonation) {
      const finalAmount = getFinalAmount();
      if (finalAmount <= 0) {
        showError('Please select or enter a valid donation amount');
        return;
      }

      const minAmount = story?.amount || 5;
      if (finalAmount < minAmount) {
        showError(`Minimum donation amount is ₹${minAmount}`);
        return;
      }
    }

    try {
      const paymentAmount = getFinalAmount();
      const orderResponse = await createOrderMutation.mutateAsync(paymentAmount);
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
        description: isDonation
          ? `Support Creator: ${story?.creator} for "${story?.title}"`
          : `Purchase: ${story?.title} by ${story?.creator}`,
        order_id: (order as { id: string; amount: number; currency: string }).id,
        handler: async (response) => {
          try {
            if (isDonation) {
              // Save donation history
              const donationData: DonationDetails = {
                storyId: story!.id,
                creatorName: story!.creator,
                storyTitle: story!.title,
                amount: paymentAmount,
                currency: 'INR',
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                timestamp: Date.now(),
                type: 'donation',
              };

              await donationService.storeDonation({
                ...donationData,
                userId: user!.uid,
                userEmail: user!.email,
                userName: user!.displayName,
              });
            } else {
              // Add purchase to user's account and save purchase history
              if (story?.id) {
                await addPurchase(story.id);

                // Also save purchase history for analytics
                await purchaseService.storePurchaseDetails({
                  storyId: story.id,
                  amount: paymentAmount,
                  currency: 'INR',
                  paymentId: response.razorpay_payment_id,
                  orderId: response.razorpay_order_id,
                  timestamp: Date.now(),
                  userId: user!.uid,
                  trackTitle: story.title,
                  trackArtist: story.creator,
                });
              }
            }
            console.log('Payment successful:', response);
            onPaymentSuccess();
            onClose();
          } catch (error) {
            console.error('Error processing payment:', error);
            showError(`Payment successful but failed to update account. Please contact support.`);
          }
        },
        prefill: {
          name: user?.displayName || 'Guest User',
          email: user?.email || '',
          contact: '',
        },
        theme: {
          color: isDonation ? '#ff9800' : '#F37254',
        },
      };

      const razorpayInstance = new Razorpay(options);
      razorpayInstance.open();
    } catch (error) {
      console.error('Error creating payment order:', error);
    }
  };

  if (!story) return null;

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
            bgcolor: isDonation ? alpha('#ff9800', 0.05) : alpha(theme.palette.primary.main, 0.05),
            border: isDonation
              ? `1px solid ${alpha('#ff9800', 0.1)}`
              : `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          }}
        >
          <Stack direction="row" spacing={3} alignItems="center">
            <Avatar
              variant="rounded"
              src={story.coverUrl}
              sx={{
                width: 60,
                height: 60,
                borderRadius: 2,
                bgcolor: isDonation ? '#ff9800' : theme.palette.primary.main,
              }}
            >
              {isDonation ? <VolunteerActivism /> : <MusicNote />}
            </Avatar>

            <Box flex={1}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {isDonation ? `Support ${story.creator}` : story.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {isDonation ? `For: ${story.title}` : `${story.creator} • ${story.series}`}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={isDonation ? 'Support Creator' : 'Premium'}
                  size="small"
                  sx={{
                    bgcolor: isDonation
                      ? alpha('#ff9800', 0.1)
                      : alpha(theme.palette.warning.main, 0.1),
                    color: isDonation ? '#ff9800' : theme.palette.warning.main,
                  }}
                />
              </Stack>
            </Box>

            {!isDonation && (
              <Box textAlign="right">
                <Typography variant="h5" fontWeight={700} color="primary">
                  ₹{story.amount || 5}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  One-time purchase
                </Typography>
              </Box>
            )}
          </Stack>
        </Paper>

        {/* Donation Amount Selection */}
        {isDonation && (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 3,
              bgcolor: alpha('#ff9800', 0.03),
              border: `1px solid ${alpha('#ff9800', 0.1)}`,
            }}
          >
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: '#ff9800' }}>
              Choose your support amount:
            </Typography>

            {/* Predefined Amount Chips */}
            <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
              {donationAmounts.map((amount) => (
                <Chip
                  key={amount}
                  label={`₹${amount}`}
                  clickable
                  variant={selectedAmount === amount ? 'filled' : 'outlined'}
                  onClick={() => handleChipSelect(amount)}
                  sx={{
                    bgcolor: selectedAmount === amount ? '#ff9800' : 'transparent',
                    color: selectedAmount === amount ? '#fff' : '#ff9800',
                    borderColor: '#ff9800',
                    '&:hover': {
                      bgcolor: selectedAmount === amount ? '#f57c00' : alpha('#ff9800', 0.08),
                    },
                    fontWeight: 600,
                    fontSize: '0.9rem',
                  }}
                />
              ))}
            </Stack>

            {/* Custom Amount Input */}
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Or enter a custom amount (minimum ₹{story.amount || 5}):
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Enter amount"
              value={customAmount}
              onChange={handleCustomAmountChange}
              error={!isCustomAmountValid && customAmount !== ''}
              helperText={
                !isCustomAmountValid && customAmount !== ''
                  ? `Minimum amount is ₹${story.amount || 5}`
                  : ''
              }
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#ff9800',
                  },
                },
              }}
            />
          </Paper>
        )}

        {/* Features */}
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {isDonation ? 'Your contribution helps:' : "What you'll get:"}
        </Typography>

        <Stack spacing={2} sx={{ mb: 4 }}>
          {(isDonation
            ? [
                { icon: VolunteerActivism, text: 'Support content creators directly' },
                { icon: MusicNote, text: 'Encourage more quality content' },
                { icon: Shield, text: 'Secure payment via Razorpay' },
              ]
            : [
                { icon: CheckCircle, text: 'Unlimited plays of this story' },
                { icon: MusicNote, text: 'High-quality 320kbps audio' },
                { icon: Shield, text: 'Secure payment via Razorpay' },
              ]
          ).map((feature, index) => (
            <Stack key={index} direction="row" alignItems="center" spacing={2}>
              <Avatar
                sx={{
                  width: 24,
                  height: 24,
                  bgcolor: isDonation
                    ? alpha('#ff9800', 0.1)
                    : alpha(theme.palette.success.main, 0.1),
                  color: isDonation ? '#ff9800' : theme.palette.success.main,
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
              ) : isDonation ? (
                <VolunteerActivism />
              ) : (
                <Payment />
              )
            }
            onClick={handlePayment}
            disabled={
              createOrderMutation.isPending ||
              (isDonation && getFinalAmount() <= 0) ||
              (isDonation && customAmount !== '' && !isCustomAmountValid)
            }
            sx={{
              py: 1.5,
              borderRadius: 3,
              fontWeight: 600,
              fontSize: '1rem',
              background: isDonation
                ? `linear-gradient(135deg, #ff9800, #f57c00)`
                : `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              '&:hover': {
                background: isDonation
                  ? `linear-gradient(135deg, #f57c00, #ef6c00)`
                  : `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
              },
              '&:disabled': {
                opacity: 0.6,
              },
            }}
          >
            {createOrderMutation.isPending
              ? 'Processing...'
              : isDonation
                ? getFinalAmount() > 0
                  ? `Support with ₹${getFinalAmount()}`
                  : 'Select amount to support'
                : `Pay ₹${story.amount || 5} Now`}
          </Button>

          {onSkipPayment && !isDonation && (
            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<PlayArrow />}
              onClick={handleSkip}
              sx={{
                py: 1.5,
                borderRadius: 3,
                fontWeight: 500,
                fontSize: '0.95rem',
                color: alpha(theme.palette.text.secondary, 0.8),
                borderColor: alpha(theme.palette.divider, 0.3),
                bgcolor: alpha(theme.palette.background.paper, 0.5),
                '&:hover': {
                  bgcolor: alpha(theme.palette.text.secondary, 0.04),
                  borderColor: alpha(theme.palette.text.secondary, 0.2),
                  color: theme.palette.text.secondary,
                  transform: 'translateY(-1px)',
                  boxShadow: `0 4px 12px ${alpha(theme.palette.text.secondary, 0.15)}`,
                },
                '&:active': {
                  transform: 'translateY(0px)',
                },
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              Play for Free (Limited Experience)
            </Button>
          )}

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
