import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { orderId, amount, key } = req.body;

    // Create a simple HTML page that opens Razorpay
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>RainbowMedia Payment</title>
    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
</head>
<body>
    <div style="text-align: center; padding: 50px; font-family: Arial;">
        <h2>Processing Payment...</h2>
        <p>Please wait while we redirect you to the payment page.</p>
    </div>
    
    <script>
        window.onload = function() {
            const options = {
                key: "${key}",
                amount: ${amount},
                currency: "INR",
                name: "RainbowMedia",
                description: "Music Track Purchase",
                order_id: "${orderId}",
                handler: function(response) {
                    // Redirect back to success page
                    window.location.href = "/payment-success?payment_id=" + response.razorpay_payment_id;
                },
                prefill: {
                    name: "User",
                    email: "user@example.com"
                },
                theme: {
                    color: "#1976d2"
                }
            };
            
            const razorpay = new Razorpay(options);
            razorpay.open();
        };
    </script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
