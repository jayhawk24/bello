"use client"
import Link from 'next/link';
import { useState, useEffect } from 'react';
import type { SubscriptionPlan } from '@/types/subscription';
// Local type aliases to avoid prisma coupling on the client
type BillingCycle = 'monthly' | 'yearly';
type SubscriptionTier = 'free' | 'basic' | 'premium' | 'enterprise';
import { Switch } from '@headlessui/react';

interface CurrentSubscription {
    id: string;
    planType: SubscriptionTier;
    planId: string;
    billingCycle: BillingCycle;
    roomTier: string;
    status: string;
    amount: number;
    currency: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    createdAt: string;
};
import DashboardNav from '@/components/DashboardNav';

export default function PricingPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAnnual, setIsAnnual] = useState(false);
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch plans
                const interval = isAnnual ? 'yearly' : 'monthly';
                const plansRes = await fetch(`/api/subscription-plans?interval=${interval}`);
                if (!plansRes.ok) throw new Error('Failed to fetch plans');
                const plansData = await plansRes.json();
                setPlans(plansData.plans);

                // Fetch current subscription
                const subsRes = await fetch('/api/subscription/current');
                if (subsRes.ok) {
                    const subsData = await subsRes.json();
                    setCurrentSubscription(subsData);
                }
            } catch (err: unknown) {
                setError((err as Error).message);
            }
        };
        fetchData();
    }, [isAnnual]);

    // Function to determine if a plan is popular (Growth plan)
    const isPopularPlan = (plan: SubscriptionPlan): boolean => {
        return plan.roomLimit > 20 && plan.roomLimit <= 50;
    };

    const formatPrice = (plan: SubscriptionPlan) => {
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: plan.currency || 'USD',
            minimumFractionDigits: 0
        });
        return formatter.format(Math.round(plan.price / 100));
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
            if (!(window as any).Razorpay) {
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
                    // Show capturing state
                    setIsCapturing(true);
                    setLoading(false);

                    // Hold for 10 seconds with loading message
                    setTimeout(() => {
                        // Subscription is confirmed, redirect to dashboard
                        alert('Subscription successful! Redirecting to dashboard...');
                        window.location.href = '/dashboard';
                    }, 10000);
                },
                prefill: data.prefill,
                theme: { color: '#FFD700' },
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                    }
                },
                callback_url: `${window.location.origin}/api/razorpay/webhook`
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err: unknown) {
            setError((err as Error).message || 'Something went wrong');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100">
            {/* Payment Capturing Loading Screen */}
            {isCapturing && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-600 mx-auto mb-4"></div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Payment is being captured</h3>
                        <p className="text-gray-600">Please wait while we process your payment...</p>
                    </div>
                </div>
            )}

            <DashboardNav title="Subscription Plans" iconSrc="/icons/subscription.svg" showNotifications={true} />
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
                    <div className="grid md:grid-cols-3 gap-6">
                        {plans.map((plan) => (
                            <div key={plan.id}
                                className={`card-minion text-center flex flex-col h-full relative
                  ${isPopularPlan(plan) ? 'border-minion-yellow border-2' : ''}
                  ${currentSubscription && (
                                        currentSubscription.planId === plan.id
                                    ) ? 'ring-2 ring-green-500 ring-offset-2' : ''}`}
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
                                        {formatPrice(plan)}<span className="text-base text-gray-500">/{plan.period === 'monthly' ? 'month' : 'year'}</span>
                                    </div>
                                    <ul className="text-left space-y-2 mb-6 text-sm px-6">
                                        {plan.features.map((feature: string, idx: number) => (
                                            <li key={idx}>✅ {feature}</li>
                                        ))}
                                    </ul>
                                </div>
                                {currentSubscription && (
                                    currentSubscription.planId === plan.id
                                ) ? (
                                    <button
                                        disabled
                                        className="btn-minion w-full disabled:opacity-60 bg-green-100 text-green-800"
                                    >
                                        {currentSubscription.billingCycle === (isAnnual ? 'yearly' : 'monthly')
                                            ? 'Current Plan'
                                            : `Current Plan (${currentSubscription.billingCycle})`}
                                    </button>
                                ) : plan.price === 0 ? (
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
