'use client';

import Link from "next/link";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

interface PlanOption {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    roomLimit: number;
    features: string[];
    period: "monthly" | "yearly";
    tier: "free" | "basic" | "premium" | "enterprise";
}

interface RegisterFormClientProps {
    plans: PlanOption[];
    defaultPlanId: string;
    fallbackMessage?: string | null;
}

const formatPrice = (plan?: PlanOption) => {
    if (!plan) return "";

    const formatter = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: plan.currency || "INR",
        minimumFractionDigits: 0
    });

    return `${formatter.format(Math.round(plan.price / 100))}/${plan.period === "monthly" ? "month" : "year"
        }`;
};

export default function RegisterFormClient({
    plans,
    defaultPlanId,
    fallbackMessage
}: RegisterFormClientProps) {
    const planMap = useMemo(
        () => new Map(plans.map((plan) => [plan.id, plan])),
        [plans]
    );

    const safeDefaultPlanId = planMap.has(defaultPlanId)
        ? defaultPlanId
        : plans[0]?.id ?? "";
    const defaultTier = planMap.get(safeDefaultPlanId)?.tier ?? "free";

    const [formData, setFormData] = useState({
        hotelName: "",
        email: "",
        password: "",
        confirmPassword: "",
        firstName: "",
        lastName: "",
        phone: "",
        plan: defaultTier
    });
    const [selectedPlanId, setSelectedPlanId] = useState(safeDefaultPlanId);
    const [isLoading, setIsLoading] = useState(false);

    const currentPlan = planMap.get(selectedPlanId) || plans[0];

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handlePlanChange = (planId: string) => {
        setSelectedPlanId(planId);
        const tier = planMap.get(planId)?.tier ?? "free";
        setFormData((prev) => ({ ...prev, plan: tier }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords don't match!");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(
                    "Account created successfully! Please sign in to continue."
                );
                window.location.href = "/login";
            } else {
                toast.error(data.error || "Registration failed. Please try again.");
            }
        } catch (error) {
            console.error("Registration error:", error);
            toast.error("Network error. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!plans.length) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center">
                <div className="text-center text-gray-700">
                    <p>No subscription plans are currently available.</p>
                    <Link href="/" className="text-minion-blue hover:underline">
                        Return home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 py-12 px-6">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block">
                        <div className="w-12 h-12 bg-minion-yellow rounded-full flex items-center justify-center mb-4">
                            <span className="text-2xl">🏨</span>
                        </div>
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-800">
                        Create Your Hotel Account
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Start your free trial with the {currentPlan?.name} plan
                    </p>
                </div>

                <div className="card-minion mb-6">
                    <div className="text-center p-4 bg-minion-yellow-light rounded-lg mb-6">
                        <h3 className="font-semibold text-gray-800">
                            {currentPlan?.name} Plan Selected
                        </h3>
                        <p className="text-gray-600">
                            {formatPrice(currentPlan)} • {currentPlan?.description}
                        </p>
                        {fallbackMessage && (
                            <p className="text-sm text-red-600 mt-2">
                                {fallbackMessage}
                            </p>
                        )}
                        <Link
                            href="/pricing"
                            className="text-minion-blue hover:underline text-sm"
                        >
                            Change plan
                        </Link>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="form-group">
                            <label htmlFor="planSelection" className="form-label">
                                Choose Plan
                            </label>
                            <select
                                id="planSelection"
                                className="input-minion"
                                value={selectedPlanId}
                                onChange={(e) => handlePlanChange(e.target.value)}
                            >
                                {plans.map((plan) => (
                                    <option key={plan.id} value={plan.id}>
                                        {plan.name} ({plan.description})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label htmlFor="firstName" className="form-label">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="input-minion"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="lastName" className="form-label">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="input-minion"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="hotelName" className="form-label">
                                Hotel Name
                            </label>
                            <input
                                type="text"
                                id="hotelName"
                                name="hotelName"
                                value={formData.hotelName}
                                onChange={handleChange}
                                placeholder="Grand Palace Hotel"
                                className="input-minion"
                                required
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label htmlFor="email" className="form-label">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="admin@grandpalace.com"
                                    className="input-minion"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="phone" className="form-label">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+1 (555) 123-4567"
                                    className="input-minion"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label htmlFor="password" className="form-label">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="input-minion"
                                    minLength={8}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="confirmPassword" className="form-label">
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="input-minion"
                                    minLength={8}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="flex items-start">
                                <input type="checkbox" className="mr-3 mt-1" required />
                                <span className="text-sm text-gray-600">
                                    I agree to the{" "}
                                    <Link
                                        href="/terms"
                                        className="text-minion-blue hover:underline"
                                    >
                                        Terms of Service
                                    </Link>
                                    {" "}and{" "}
                                    <Link
                                        href="/privacy"
                                        className="text-minion-blue hover:underline"
                                    >
                                        Privacy Policy
                                    </Link>
                                </span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="btn-minion w-full text-lg py-4"
                            disabled={isLoading}
                        >
                            {isLoading
                                ? "🔄 Creating Account..."
                                : "🚀 Start Free Trial"}
                        </button>
                    </form>
                </div>

                <div className="text-center">
                    <p className="text-gray-600">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="text-minion-blue hover:underline font-semibold"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>

                <div className="mt-6 text-center">
                    <Link href="/" className="text-gray-500 hover:underline">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
