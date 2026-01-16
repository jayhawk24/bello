'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

declare global {
    interface Window {
        Razorpay: any;
    }
}

interface SubscriptionPlan {
    id: string;
    name: string;
    description: string;
    price: number;
    period: 'monthly' | 'yearly';
    currency: string;
    roomLimit: number;
    features: string[];
}


export default function SubscriptionPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [selectedBilling, setSelectedBilling] = useState<'monthly' | 'yearly'>('monthly');
    const [loading, setLoading] = useState(false);
    const [plansLoading, setPlansLoading] = useState(false);
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [planError, setPlanError] = useState<string | null>(null);
    const [currentSubscription, setCurrentSubscription] = useState<any>(null);
    const [hotelData, setHotelData] = useState<any>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    useEffect(() => {
        fetchSubscriptionData();
    }, []);

    useEffect(() => {
        fetchPlans();
    }, [selectedBilling]);

    const fetchSubscriptionData = async () => {
        try {
            const response = await fetch('/api/subscription/current');
            if (response.ok) {
                const data = await response.json();
                setCurrentSubscription(data);
                setHotelData(
                    session?.user?.hotel
                );
            }
        } catch (error) {
            console.error('Error fetching subscription:', error);
        }
    };

    const fetchPlans = async () => {
        setPlansLoading(true);
        setPlanError(null);
        try {
            const response = await fetch(`/api/subscription-plans?interval=${selectedBilling}`);
            if (!response.ok) {
                throw new Error('Failed to fetch subscription plans');
            }
            const data = await response.json();
            setPlans(data.plans || []);
        } catch (error) {
            console.error('Error fetching subscription plans:', error);
            setPlanError('Unable to load plans. Please try again later.');
        } finally {
            setPlansLoading(false);
        }
    };

    const handleSubscribe = async (planId: string) => {
        setLoading(true);

        try {
            const response = await fetch('/api/payments/create-subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    planId,
                    billingCycle: selectedBilling
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Load Razorpay script if not already loaded
                if (!window.Razorpay) {
                    const script = document.createElement('script');
                    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                    script.async = true;
                    document.body.appendChild(script);

                    script.onload = () => {
                        initiatePayment(data);
                    };
                } else {
                    initiatePayment(data);
                }
            } else {
                alert(data.error || 'Failed to create subscription');
            }
        } catch (error) {
            console.error('Subscription error:', error);
            alert('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };


    const initiatePayment = (subscriptionData: any) => {
        const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            subscription_id: subscriptionData.subscriptionId,
            name: subscriptionData.name,
            description: subscriptionData.description,
            prefill: subscriptionData.prefill,
            theme: subscriptionData.theme,
            handler: async function () {
                alert('Subscription activated successfully!');
                fetchSubscriptionData(); // Refresh subscription data
            },
            modal: {
                ondismiss: function () {
                    setLoading(false);
                }
            }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
    };

    if (status === 'loading') {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    if (!session) {
        return null;
    }

    const formatPrice = (plan: SubscriptionPlan) => {
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: plan.currency || 'USD',
            minimumFractionDigits: 0
        });
        return formatter.format(Math.round(plan.price / 100));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
                    <p className="text-xl text-gray-600 mb-8">
                        Select the perfect plan for your hotel
                    </p>

                    {/* Billing Toggle */}
                    <div className="flex justify-center items-center space-x-4 mb-8">
                        <button
                            onClick={() => setSelectedBilling('monthly')}
                            className={`px-6 py-2 rounded-full font-medium transition-colors ${selectedBilling === 'monthly'
                                ? 'bg-amber-600 text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setSelectedBilling('yearly')}
                            className={`px-6 py-2 rounded-full font-medium transition-colors ${selectedBilling === 'yearly'
                                ? 'bg-amber-600 text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            Yearly (Save 20%)
                        </button>
                    </div>
                </div>

                {/* Current Subscription Status */}
                {currentSubscription && (
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Current Subscription</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Plan</p>
                                <p className="font-semibold capitalize">{currentSubscription.planType}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Status</p>
                                <p className={`font-semibold capitalize ${currentSubscription.status === 'active' ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                    {currentSubscription.status}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Next Billing</p>
                                <p className="font-semibold">
                                    {new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Hotel Info */}
                {hotelData && (
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">{hotelData.name}</h2>
                        <p className="text-gray-600">
                            Total Rooms: <span className="font-semibold">{hotelData.totalRooms}</span>
                        </p>
                    </div>
                )}

                {/* Pricing Plans */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plansLoading && (
                        <div className="col-span-full text-center text-gray-600">Loading plans…</div>
                    )}
                    {!plansLoading && planError && (
                        <div className="col-span-full text-center text-red-600">{planError}</div>
                    )}
                    {!plansLoading && !planError && plans.length === 0 && (
                        <div className="col-span-full text-center text-gray-600">No plans available.</div>
                    )}
                    {!plansLoading && !planError && plans.map((plan) => {
                        const isCurrentPlan = currentSubscription?.planId === plan.id;
                        return (
                            <div
                                key={plan.id}
                                className={`bg-white rounded-xl shadow-lg overflow-hidden transform transition-transform hover:scale-105 ${isCurrentPlan ? 'ring-4 ring-amber-500' : ''}`}
                            >
                                <div className="p-8">
                                    <div className="text-center mb-6">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                        <p className="text-gray-600 mb-4">{plan.description}</p>
                                        <div className="text-4xl font-bold text-amber-600 mb-2">
                                            {formatPrice(plan)}
                                            <span className="text-lg text-gray-500">
                                                /{selectedBilling === 'monthly' ? 'month' : 'year'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500">Up to {plan.roomLimit} rooms</p>
                                    </div>

                                    <ul className="space-y-3 mb-8">
                                        {plan.features.map((feature, index) => (
                                            <li key={index} className="flex items-start">
                                                <svg
                                                    className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                                <span className="text-gray-700">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <button
                                        onClick={() => handleSubscribe(plan.id)}
                                        disabled={loading || isCurrentPlan}
                                        className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${isCurrentPlan
                                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                            : 'bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50'
                                            }`}
                                    >
                                        {loading ? 'Processing...' : isCurrentPlan ? 'Current Plan' : 'Subscribe Now'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Features Comparison */}
                <div className="mt-16 bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-8">
                        <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
                            Feature Comparison
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-4 px-6 font-semibold text-gray-900">Features</th>
                                        <th className="text-center py-4 px-6 font-semibold text-gray-900">Basic</th>
                                        <th className="text-center py-4 px-6 font-semibold text-gray-900">Premium</th>
                                        <th className="text-center py-4 px-6 font-semibold text-gray-900">Enterprise</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-4 px-6 text-gray-700">Room Limit</td>
                                        <td className="py-4 px-6 text-center text-gray-600">20</td>
                                        <td className="py-4 px-6 text-center text-gray-600">50</td>
                                        <td className="py-4 px-6 text-center text-gray-600">Unlimited</td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-4 px-6 text-gray-700">QR Code Access</td>
                                        <td className="py-4 px-6 text-center">✅</td>
                                        <td className="py-4 px-6 text-center">✅</td>
                                        <td className="py-4 px-6 text-center">✅</td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-4 px-6 text-gray-700">Service Requests</td>
                                        <td className="py-4 px-6 text-center">Basic</td>
                                        <td className="py-4 px-6 text-center">Full</td>
                                        <td className="py-4 px-6 text-center">Premium</td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-4 px-6 text-gray-700">Support</td>
                                        <td className="py-4 px-6 text-center">Email</td>
                                        <td className="py-4 px-6 text-center">Priority</td>
                                        <td className="py-4 px-6 text-center">24/7</td>
                                    </tr>
                                    <tr>
                                        <td className="py-4 px-6 text-gray-700">Analytics</td>
                                        <td className="py-4 px-6 text-center">Basic</td>
                                        <td className="py-4 px-6 text-center">Advanced</td>
                                        <td className="py-4 px-6 text-center">Custom</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
