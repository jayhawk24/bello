"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from 'react-hot-toast';

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
                toast.error('Invalid email or password. Please try again.');
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
            toast.error('Login failed. Please try again.');
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
                    <h1 className="text-2xl font-bold text-gray-800">StayScan Hotels</h1>
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

                <div className="mt-6">
                    <button
                        type="button"
                        onClick={() => signIn('google', { callbackUrl: returnUrl || '/dashboard' })}
                        className="cursor-pointer mt-4 w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 transition-colors"
                        disabled={isLoading}
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        <span className="text-gray-700 font-medium">Sign in with Google</span>
                    </button>
                </div>

                <div className="mt-6 text-center">
                    <p className="text-gray-600 mb-4">
                        New to StayScan?
                    </p>
                    <div className="space-y-2">
                        {/* <Link
                            href={returnUrl ? `/guest-register?returnUrl=${encodeURIComponent(returnUrl)}` : '/guest-register'}
                            className="btn-minion w-full inline-block text-center"
                        >
                            ✨ Create Guest Account
                        </Link>
                        <div className="text-sm text-gray-500">or</div> */}
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
