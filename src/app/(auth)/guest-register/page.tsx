"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function GuestRegisterPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const returnUrl = searchParams.get('returnUrl');
    const hotelId = searchParams.get('hotelId');
    
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        hotelId: hotelId || ""
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords don't match!");
            return;
        }

        if (formData.password.length < 8) {
            setError("Password must be at least 8 characters long!");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/guest-register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    phone: formData.phone,
                    password: formData.password,
                    hotelId: formData.hotelId
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert('Guest account created successfully! Please sign in to continue.');
                // Redirect to login page with return URL
                const loginUrl = returnUrl 
                    ? `/login?returnUrl=${encodeURIComponent(returnUrl)}`
                    : '/login';
                router.push(loginUrl);
            } else {
                setError(data.error || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Registration error:', error);
            setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center p-6">
            <div className="card-minion max-w-md w-full">
                <div className="text-center mb-6">
                    <Link href="/" className="inline-block">
                        <div className="w-12 h-12 bg-minion-yellow rounded-full flex items-center justify-center mb-4">
                            <span className="text-2xl">👤</span>
                        </div>
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-800">Create Guest Account</h1>
                    <p className="text-gray-600 mt-2">
                        Register to track your service requests and preferences
                    </p>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group">
                            <label htmlFor="firstName" className="form-label">
                                First Name *
                            </label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                placeholder="John"
                                className="input-minion"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="lastName" className="form-label">
                                Last Name *
                            </label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                placeholder="Doe"
                                className="input-minion"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="email" className="form-label">
                            Email Address *
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john.doe@example.com"
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
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            Password *
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
                        <p className="text-xs text-gray-500 mt-1">
                            Must be at least 8 characters long
                        </p>
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword" className="form-label">
                            Confirm Password *
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

                    <div className="form-group">
                        <label className="flex items-start">
                            <input type="checkbox" className="mr-3 mt-1" required />
                            <span className="text-sm text-gray-600">
                                I agree to the{" "}
                                <Link href="/terms" className="text-minion-blue hover:underline">Terms of Service</Link>
                                {" "}and{" "}
                                <Link href="/privacy" className="text-minion-blue hover:underline">Privacy Policy</Link>
                            </span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="btn-minion w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? "🔄 Creating Account..." : "✨ Create Account"}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-600">
                        Already have an account?{" "}
                        <Link 
                            href={returnUrl ? `/login?returnUrl=${encodeURIComponent(returnUrl)}` : '/login'}
                            className="text-minion-blue hover:underline font-semibold"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>

                <div className="mt-4 text-center">
                    <Link 
                        href={returnUrl || '/guest'}
                        className="text-gray-500 hover:underline text-sm"
                    >
                        ← Continue without account
                    </Link>
                </div>
            </div>
        </div>
    );
}
