// Test API to debug Razorpay integration
import Razorpay from 'razorpay';

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Check environment variables
      const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;

      console.log('Key ID exists:', !!keyId);
      console.log('Key Secret exists:', !!keySecret);
      console.log('Key ID starts with:', keyId?.substring(0, 8));

      if (!keyId || !keySecret) {
        return res.status(500).json({
          error: 'Missing credentials',
          keyIdExists: !!keyId,
          keySecretExists: !!keySecret,
        });
      }

      // Initialize Razorpay
      const razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });

      // Test order creation with minimal amount
      const testOrder = await razorpay.orders.create({
        amount: 500, // ₹5.00 in paise
        currency: 'INR',
        receipt: `test_receipt_${Date.now()}`,
      });

      res.status(200).json({
        success: true,
        message: 'Razorpay integration working!',
        testOrder: {
          id: testOrder.id,
          amount: testOrder.amount,
          currency: testOrder.currency,
          status: testOrder.status,
        },
        config: {
          keyIdValid: !!keyId,
          keySecretValid: !!keySecret,
        },
      });
    } catch (error: unknown) {
      console.error('Razorpay test error:', error);
      res.status(500).json({
        error: 'Razorpay test failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
