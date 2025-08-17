"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const returnUrl = searchParams.get('returnUrl');
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return;

        setIsLoading(true);

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                alert('Invalid email or password. Please try again.');
            } else {
                // Get the updated session to check user role
                const session = await getSession();
                if (session?.user?.role === 'guest') {
                    // Redirect guests back to the page they came from or guest area
                    const returnUrl = searchParams.get('returnUrl');
                    router.push(returnUrl || '/guest');
                } else {
                    // Redirect staff/admins to dashboard
                    router.push('/dashboard');
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Login failed. Please try again.');
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
                            <span className="text-2xl">🏨</span>
                        </div>
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-800">Welcome Back</h1>
                    <p className="text-gray-600 mt-2">
                        Sign in to your account
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="hotel@example.com"
                            className="input-minion"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="input-minion"
                            required
                        />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center">
                            <input type="checkbox" className="mr-2" />
                            Remember me
                        </label>
                        <Link href="/forgot-password" className="text-minion-blue hover:underline">
                            Forgot password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        className="btn-minion w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? "🔄 Signing in..." : "🔑 Sign In"}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-600 mb-4">
                        New to Bello?
                    </p>
                    <div className="space-y-2">
                        <Link 
                            href={returnUrl ? `/guest-register?returnUrl=${encodeURIComponent(returnUrl)}` : '/guest-register'} 
                            className="btn-minion w-full inline-block text-center"
                        >
                            ✨ Create Guest Account
                        </Link>
                        <div className="text-sm text-gray-500">or</div>
                        <Link 
                            href="/register" 
                            className="btn-minion-secondary w-full inline-block text-center"
                        >
                            🏨 Create Hotel Account
                        </Link>
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                    <Link href="/" className="text-gray-500 hover:underline">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginForm />
        </Suspense>
    );
}
