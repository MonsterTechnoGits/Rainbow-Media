'use client';

import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import React, { useState, useEffect } from 'react';

interface RazorpayTestModalProps {
  open: boolean;
  onClose: () => void;
}

const RazorpayTestModal: React.FC<RazorpayTestModalProps> = ({ open, onClose }) => {
  const [browserInfo, setBrowserInfo] = useState<string>('');
  const [razorpaySupport, setRazorpaySupport] = useState<string>('');

  useEffect(() => {
    if (open) {
      // Get browser info
      const userAgent = navigator.userAgent;
      const browser = getBrowserInfo(userAgent);
      setBrowserInfo(browser);

      // Test Razorpay support
      testRazorpaySupport();
    }
  }, [open]);

  const getBrowserInfo = (userAgent: string): string => {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  };

  const testRazorpaySupport = () => {
    try {
      if (!window.Razorpay) {
        setRazorpaySupport('❌ Razorpay script not loaded');
        return;
      }

      // Test if we can create a Razorpay instance
      const testOptions = {
        key: 'rzp_test_example',
        amount: 100,
        currency: 'INR',
        name: 'Test',
        description: 'Test',
        order_id: 'test_order',
        handler: () => {},
        prefill: { name: 'Test', email: 'test@example.com' },
        theme: { color: '#3399cc' },
      };

      const razorpayInstance = new window.Razorpay(testOptions);

      if (razorpayInstance && typeof razorpayInstance.open === 'function') {
        setRazorpaySupport('✅ Razorpay instance created successfully');
      } else {
        setRazorpaySupport('❌ Razorpay instance creation failed');
      }
    } catch (error) {
      setRazorpaySupport(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testPayment = async () => {
    try {
      // Create a test order
      const orderResponse = await fetch('/api/razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 100 }),
      });

      const orderData = await orderResponse.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Browser Test',
        description: 'Testing browser compatibility',
        order_id: orderData.id,
        handler: (response: { razorpay_payment_id: string }) => {
          alert(`Success! Payment ID: ${response.razorpay_payment_id}`);
        },
        prefill: {
          name: 'Test User',
          email: 'test@example.com',
        },
        theme: {
          color: '#3399cc',
        },
        modal: {
          ondismiss: () => {
            console.log('Modal dismissed');
          },
        },
      };

      console.log('Creating Razorpay instance with:', options);
      const paymentObject = new window.Razorpay(options);
      console.log('Opening payment modal...');
      paymentObject.open();
    } catch (error) {
      console.error('Test payment error:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Razorpay Browser Compatibility Test</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Browser Information:
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Browser: {browserInfo}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            User Agent:{' '}
            {typeof window !== 'undefined' ? navigator.userAgent.substring(0, 80) + '...' : 'N/A'}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Razorpay Support Test:
          </Typography>
          <Typography variant="body2">{razorpaySupport}</Typography>
        </Box>

        <Alert severity="info" sx={{ mb: 2 }}>
          If you see "browser not supported", try:
          <ul>
            <li>Disable ad blockers</li>
            <li>Enable cookies and JavaScript</li>
            <li>Try incognito mode</li>
            <li>Use Chrome or Firefox</li>
          </ul>
        </Alert>

        <Button variant="contained" onClick={testPayment} fullWidth sx={{ mt: 2 }}>
          Test Payment Modal
        </Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default RazorpayTestModal;
