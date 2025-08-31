import Link from 'next/link';
import { useState } from 'react';

export default function PricingPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Razorpay handler
  const handleUpgrade = async () => {
    setLoading(true);
    setError(null);
    try {
      // Call backend to create subscription/order
      const res = await fetch('/api/payments/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType: 'premium', billingCycle: 'monthly', roomTier: 'tier_21_50' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create order');

      // Load Razorpay script if not present
      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,
        name: 'Bello Hotel Concierge',
        description: 'Premium Plan Subscription',
        handler: async function (response: any) {
          // Verify payment
          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            })
          });
          const verifyData = await verifyRes.json();
          if (verifyRes.ok) {
            window.location.href = '/dashboard';
          } else {
            setError(verifyData.error || 'Payment verification failed');
          }
        },
        prefill: {},
        theme: { color: '#FFD700' },
      };
      // @ts-ignore
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-yellow-50">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-yellow-600 mb-4">Choose Your Plan</h1>
        <div className="mb-6">
          <div className="bg-yellow-100 rounded-lg p-4 mb-4">
            <h2 className="text-xl font-bold text-yellow-700">Free</h2>
            <p className="text-gray-700">1 room, 1 staff user</p>
            <p className="text-gray-500 text-xs">Upgrade anytime</p>
          </div>
          <div className="bg-yellow-200 rounded-lg p-4 mb-4">
            <h2 className="text-xl font-bold text-yellow-800">Premium</h2>
            <p className="text-gray-700">Up to 50 rooms, 10 staff users</p>
            <button
              onClick={handleUpgrade}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-xl w-full mt-2 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Upgrade with Razorpay'}
            </button>
          </div>
        </div>
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <Link href="/dashboard">
          <span className="text-blue-500 hover:underline">Back to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
