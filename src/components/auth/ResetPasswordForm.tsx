import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input } from '@/components/ui';
import { ResetPasswordFormData } from '@/types';

export const ResetPasswordForm: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [formData, setFormData] = useState<ResetPasswordFormData>({
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState<Partial<ResetPasswordFormData>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    if (!token) {
        return (
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Reset Link</h2>
                <p className="text-gray-600 mb-4">
                    This password reset link is invalid or has expired.
                </p>
                <Button
                    variant="primary"
                    onClick={() => router.push('/forgot-password')}
                >
                    Request New Reset Link
                </Button>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});
        setMessage('');
        setError('');

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setErrors({ confirmPassword: 'Passwords do not match' });
            setIsLoading(false);
            return;
        }

        // Validate password strength
        if (formData.password.length < 8) {
            setErrors({ password: 'Password must be at least 8 characters long' });
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    password: formData.password
                })
            });

            const result = await response.json();

            if (response.ok) {
                setMessage('Password has been reset successfully. Redirecting to login...');
                setTimeout(() => {
                    router.push('/login?message=Password reset successful. Please sign in with your new password.');
                }, 2000);
            } else {
                setError(result.error || 'Failed to reset password');
            }
        } catch (error) {
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const updateField = (field: keyof ResetPasswordFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {message && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
                    {message}
                </div>
            )}

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h2>
                <p className="text-gray-600">
                    Enter your new password below.
                </p>
            </div>

            <Input
                label="New Password"
                type="password"
                value={formData.password}
                onChange={(value) => updateField('password', value)}
                error={errors.password}
                required
                placeholder="Enter your new password"
            />

            <Input
                label="Confirm New Password"
                type="password"
                value={formData.confirmPassword}
                onChange={(value) => updateField('confirmPassword', value)}
                error={errors.confirmPassword}
                required
                placeholder="Confirm your new password"
            />

            <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isLoading}
                className="w-full"
            >
                Reset Password
            </Button>
        </form>
    );
};
