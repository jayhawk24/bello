"use client"
import Link from 'next/link';
import { useState } from 'react';
import { Switch } from '@headlessui/react';
import DashboardNav from '@/components/DashboardNav';

export default function PricingPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: 'Free',
      description: '1-2 Rooms',
      monthlyPrice: 0,
      features: [
        'Up to 2 rooms',
        'Up to 2 staff users',
        'QR code access',
        'Basic service requests',
        'Notifications'
      ],
      type: 'free'
    },
    {
      name: 'Starter',
      description: '1-20 Rooms',
      monthlyPrice: 49,
      features: [
        'Up to 20 rooms',
        'QR code access',
        'Basic service requests',
        'Email support',
        'Basic analytics'
      ],
      type: 'basic'
    },
    {
      name: 'Growth',
      description: '21-50 Rooms',
      monthlyPrice: 129,
      features: [
        'Up to 50 rooms',
        'QR code access',
        'Full service requests',
        'Priority support',
        'Advanced analytics',
        'Custom branding'
      ],
      popular: true,
      type: 'premium'
    },
    {
      name: 'Professional',
      description: '51-100 Rooms',
      monthlyPrice: 249,
      features: [
        'Up to 100 rooms',
        'QR code access',
        'Premium service suite',
        'Phone & chat support',
        'Full analytics dashboard',
        'Multi-location support',
        'API access'
      ],
      type: 'enterprise'
    }
  ];

  // Calculate annual price with 20% discount
  const getPrice = (monthlyPrice: number) => {
    if (isAnnual) {
      const annualPrice = monthlyPrice * 12;
      const discount = annualPrice * 0.2;
      return Math.floor((annualPrice - discount) / 12);
    }
    return monthlyPrice;
  };

  // Razorpay handler
  const handleUpgrade = async (planType: string) => {
    setLoading(true);
    setError(null);
    try {
      const billingCycle = isAnnual ? 'yearly' : 'monthly';
      let roomTier = 'tier_1_20';
      if (planType === 'premium') roomTier = 'tier_21_50';
      if (planType === 'enterprise') roomTier = 'tier_51_100';

      const res = await fetch('/api/payments/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType, billingCycle, roomTier })
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
        description: `${planType.charAt(0).toUpperCase() + planType.slice(1)} Plan Subscription`,
        handler: async function (response: any) {
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
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100">
      <DashboardNav title="Subscription Plans" showNotifications={true} />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600 mb-8">Pay only for the rooms you manage - perfect for hotels of any size</p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className={`text-sm ${!isAnnual ? 'font-bold text-yellow-600' : 'text-gray-500'}`}>Monthly</span>
            <Switch
              checked={isAnnual}
              onChange={setIsAnnual}
              className={`${isAnnual ? 'bg-yellow-600' : 'bg-gray-400'}
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
            >
              <span
                className={`${isAnnual ? 'translate-x-6' : 'translate-x-1'}
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </Switch>
            <span className={`text-sm ${isAnnual ? 'font-bold text-yellow-600' : 'text-gray-500'}`}>
              Annual <span className="text-green-500 text-xs">(Save 20%)</span>
            </span>
          </div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <div key={plan.name} 
                className={`card-minion text-center flex flex-col h-full relative
                  ${plan.popular ? 'border-minion-yellow border-2' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-minion-yellow text-gray-800 px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                <div className="flex-grow">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="text-sm text-gray-500 mb-4">{plan.description}</div>
                  <div className="text-3xl font-bold text-minion-yellow mb-4">
                    ${getPrice(plan.monthlyPrice)}<span className="text-base text-gray-500">/month</span>
                  </div>
                  <ul className="text-left space-y-2 mb-6 text-sm px-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx}>✅ {feature}</li>
                    ))}
                  </ul>
                </div>
                {plan.type === 'free' ? (
                  <Link href="/register" className="btn-minion w-full">
                    Get Started Free
                  </Link>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan.type)}
                    disabled={loading}
                    className="btn-minion w-full disabled:opacity-60"
                  >
                    {loading ? 'Processing...' : 'Upgrade Now'}
                  </button>
                )}
              </div>
            ))}
          </div>

          {error && (
            <div className="mt-6 text-red-500 text-sm bg-red-50 p-3 rounded-lg max-w-md mx-auto">
              {error}
            </div>
          )}

          <div className="mt-8">
            <Link href="/dashboard">
              <span className="text-blue-500 hover:underline">← Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
