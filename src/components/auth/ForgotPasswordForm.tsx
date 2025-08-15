import React, { useState } from 'react';
import { Button, Input } from '@/components/ui';
import { ForgotPasswordFormData } from '@/types';

export const ForgotPasswordForm: React.FC = () => {
    const [formData, setFormData] = useState<ForgotPasswordFormData>({
        email: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');
        setError('');

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok) {
                setMessage('Password reset instructions have been sent to your email.');
                setFormData({ email: '' });
            } else {
                setError(result.error || 'Failed to send reset email');
            }
        } catch (error) {
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
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
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password</h2>
                <p className="text-gray-600">
                    Enter your email address and we'll send you instructions to reset your password.
                </p>
            </div>

            <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(value) => setFormData({ email: value })}
                required
                placeholder="Enter your email"
            />

            <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isLoading}
                className="w-full"
            >
                Send Reset Instructions
            </Button>
        </form>
    );
};
