// pages/api/razorpay-order.ts
import Razorpay from 'razorpay';

import type { NextApiRequest, NextApiResponse } from 'next';

// Validate environment variables
if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error('Razorpay credentials are not configured properly');
}

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { amount } = req.body; // amount in INR * 100

    // Validate amount
    if (!amount || amount < 100) {
      return res.status(400).json({ error: 'Invalid amount. Minimum amount is ₹1 (100 paise)' });
    }

    try {
      const order = await razorpay.orders.create({
        amount: parseInt(amount), // Ensure it's a number
        currency: 'INR',
        receipt: `receipt_${Date.now()}`, // Dynamic receipt ID
        notes: {
          app: 'RainbowMedia',
          timestamp: new Date().toISOString(),
        },
      });

      console.log('Order created successfully:', order.id);
      res.status(200).json(order);
    } catch (error) {
      console.error('Razorpay order creation error:', error);
      res.status(500).json({
        error: 'Order creation failed',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
