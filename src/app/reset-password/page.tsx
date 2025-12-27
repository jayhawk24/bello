'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { ResetPasswordForm } from '@/components/auth';

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-yellow-600 mb-2">StayScan</h1>
                    <p className="text-gray-600">Hotel Concierge Service</p>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                        Reset Password
                    </h2>

                    <Suspense fallback={<div>Loading...</div>}>
                        <ResetPasswordForm />
                    </Suspense>
                </div>

                <div className="text-center">
                    <Link href="/login" className="text-sm text-minion-blue hover:underline">
                        Remember your password? Sign in
                    </Link>
                </div>

                <div className="text-center">
                    <Link href="/" className="text-gray-500 hover:underline">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
