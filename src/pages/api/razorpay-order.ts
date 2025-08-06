// pages/api/razorpay-order.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { amount } = req.body; // amount in INR * 100

    try {
      const order = await razorpay.orders.create({
        amount, // e.g., 50000 for ₹500
        currency: 'INR',
        receipt: 'receipt_order_74394',
      });

      res.status(200).json(order);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Order creation failed' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
