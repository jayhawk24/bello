'use client';

import React from 'react';
import Link from 'next/link';
import { ResetPasswordForm } from '@/components/auth';

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-yellow-600 mb-2">Bello</h1>
                    <p className="text-gray-600">Hotel Concierge Service</p>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-8">
                    <ResetPasswordForm />

                    <div className="mt-6 text-center">
                        <Link
                            href="/login"
                            className="text-yellow-600 hover:text-yellow-700 font-medium"
                        >
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
