import { Button, Container, Typography, Box, Alert, CircularProgress } from '@mui/material';
import { useState, useEffect } from 'react';
import { RazorpayOptions } from '../types/razorpay';
import RazorpayTestModal from '../components/RazorpayTestModal';
import Script from 'next/script';

export default function TestPayment() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);

  useEffect(() => {
    // Check if Razorpay is already loaded
    if (window.Razorpay) {
      setRazorpayLoaded(true);
      return;
    }

    // If not loaded, wait for it
    const checkRazorpay = setInterval(() => {
      if (window.Razorpay) {
        setRazorpayLoaded(true);
        clearInterval(checkRazorpay);
      }
    }, 100);

    // Clean up interval after 10 seconds
    const timeout = setTimeout(() => {
      clearInterval(checkRazorpay);
      if (!window.Razorpay) {
        setError('❌ Razorpay script failed to load after 10 seconds');
      }
    }, 10000);

    return () => {
      clearInterval(checkRazorpay);
      clearTimeout(timeout);
    };
  }, []);

  const testRazorpayAPI = async () => {
    try {
      setLoading(true);
      setMessage('');
      setError('');

      const response = await fetch('/api/test-razorpay');
      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ API Test Successful! Order ID: ${data.testOrder.id}`);
      } else {
        setError(`❌ API Test Failed: ${data.error}`);
      }
    } catch (err) {
      setError(`❌ Network Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testRazorpayModal = async () => {
    try {
      setLoading(true);
      setMessage('');
      setError('');

      // Check if Razorpay script is loaded
      if (!window.Razorpay) {
        setError('❌ Razorpay script not loaded. Please refresh the page.');
        return;
      }

      // Create test order
      const orderResponse = await fetch('/api/razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 500 }), // ₹5
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        setError(`❌ Order Creation Failed: ${errorData.error}`);
        return;
      }

      const orderData = await orderResponse.json();

      // Open Razorpay modal
      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'RainbowMedia Test',
        description: 'Test Payment',
        order_id: orderData.id,
        handler: function (response: any) {
          setMessage(`✅ Payment Successful! Payment ID: ${response.razorpay_payment_id}`);
          setLoading(false);
        },
        prefill: {
          name: 'Test User',
          email: 'test@example.com',
        },
        theme: {
          color: '#1976d2',
        },
        modal: {
          ondismiss: () => {
            setMessage('Payment cancelled by user');
            setLoading(false);
          },
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      setError(`❌ Modal Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
       <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="beforeInteractive"
        />
      <Typography variant="h4" gutterBottom>
        Razorpay Payment Test
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Environment Check:
        </Typography>
        <Typography variant="body2">
          Razorpay Key: {process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ? '✅ Configured' : '❌ Missing'}
        </Typography>
        <Typography variant="body2">
          Razorpay Script: {razorpayLoaded ? '✅ Loaded' : '❌ Not Loaded'}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button variant="outlined" onClick={testRazorpayAPI} disabled={loading}>
          {loading ? <CircularProgress size={20} /> : 'Test API'}
        </Button>

        <Button variant="contained" onClick={testRazorpayModal} disabled={loading}>
          {loading ? <CircularProgress size={20} /> : 'Test Payment Modal'}
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={() => setShowTestModal(true)}
          sx={{ ml: 1 }}
        >
          Browser Test
        </Button>
      </Box>

      {message && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Typography variant="body2" color="text.secondary">
        Open browser console to see detailed logs.
      </Typography>
      
      <RazorpayTestModal 
        open={showTestModal} 
        onClose={() => setShowTestModal(false)} 
      />
    </Container>
  );
}
