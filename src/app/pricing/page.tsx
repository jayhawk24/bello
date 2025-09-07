"use client"
import Link from 'next/link';
import { useState, useEffect } from 'react';
import type { SubscriptionPlan } from '@/types/subscription';
import { Switch } from '@headlessui/react';
import DashboardNav from '@/components/DashboardNav';

export default function PricingPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAnnual, setIsAnnual] = useState(false);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const interval = isAnnual ? 'yearly' : 'monthly';
        const res = await fetch(`/api/subscription-plans?interval=${interval}`);
        if (!res.ok) throw new Error('Failed to fetch plans');
        const data = await res.json();
        setPlans(data.plans);
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchPlans();
  }, [isAnnual]);

  // Function to determine if a plan is popular (Growth plan)
  const isPopularPlan = (plan: SubscriptionPlan): boolean => {
    return plan.roomLimit > 20 && plan.roomLimit <= 50;
  };

  // Get price in display format
  const getPrice = (plan: SubscriptionPlan) => {
    return Math.floor(plan.price / 100);
  };

  // Razorpay subscription handler
  const handleUpgrade = async (selectedPlan: SubscriptionPlan) => {
    setLoading(true);
    setError(null);
    try {
      const billingCycle = isAnnual ? 'yearly' : 'monthly';

      // Create subscription
      const res = await fetch('/api/payments/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: selectedPlan.id, billingCycle })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create subscription');

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
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: data.subscriptionId,
        name: data.name,
        description: data.description,
        handler: function () {
          // Subscription is confirmed, redirect to dashboard
          window.location.href = '/dashboard';
        },
        prefill: data.prefill,
        theme: { color: '#FFD700' },
        modal: {
          ondismiss: function () {
            setLoading(false);
          }
        }
      };

      // @ts-ignore - Razorpay types are not available
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
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
                  ${isPopularPlan(plan) ? 'border-minion-yellow border-2' : ''}`}
              >
                {isPopularPlan(plan) && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-minion-yellow text-gray-800 px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                <div className="flex-grow">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="text-sm text-gray-500 mb-4">{plan.description}</div>
                  <div className="text-3xl font-bold text-minion-yellow mb-4">
                    ${getPrice(plan)}<span className="text-base text-gray-500">/month</span>
                  </div>
                  <ul className="text-left space-y-2 mb-6 text-sm px-6">
                    {plan.features.map((feature: string, idx: number) => (
                      <li key={idx}>✅ {feature}</li>
                    ))}
                  </ul>
                </div>
                {plan.price === 0 ? (
                  <Link href="/register" className="btn-minion w-full">
                    Get Started Free
                  </Link>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan)}
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
