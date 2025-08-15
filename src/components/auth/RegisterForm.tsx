import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Select } from '@/components/ui';
import { RegisterFormData } from '@/types';
import { userRegistrationSchema } from '@/lib/validations';

export const RegisterForm: React.FC = () => {
    const router = useRouter();
    const [formData, setFormData] = useState<RegisterFormData>({
        hotelName: '',
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phone: '',
        plan: 'basic'
    });
    const [errors, setErrors] = useState<Partial<RegisterFormData>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [generalError, setGeneralError] = useState('');

    const planOptions = [
        { value: 'basic', label: 'Basic Plan - $29/month' },
        { value: 'premium', label: 'Premium Plan - $99/month' },
        { value: 'enterprise', label: 'Enterprise Plan - $299/month' }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});
        setGeneralError('');

        try {
            // Validate form data
            const validatedData = userRegistrationSchema.parse(formData);

            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(validatedData)
            });

            const result = await response.json();

            if (response.ok) {
                router.push('/login?message=Registration successful. Please sign in.');
            } else {
                setGeneralError(result.error || 'Registration failed');
            }
        } catch (error: any) {
            if (error.errors) {
                const fieldErrors: Partial<RegisterFormData> = {};
                error.errors.forEach((err: any) => {
                    if (err.path[0]) {
                        fieldErrors[err.path[0] as keyof RegisterFormData] = err.message;
                    }
                });
                setErrors(fieldErrors);
            } else {
                setGeneralError('An unexpected error occurred');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const updateField = (field: keyof RegisterFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {generalError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                    {generalError}
                </div>
            )}

            <Input
                label="Hotel Name"
                value={formData.hotelName}
                onChange={(value) => updateField('hotelName', value)}
                error={errors.hotelName}
                required
                placeholder="Enter your hotel name"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    label="First Name"
                    value={formData.firstName}
                    onChange={(value) => updateField('firstName', value)}
                    error={errors.firstName}
                    required
                    placeholder="Enter your first name"
                />

                <Input
                    label="Last Name"
                    value={formData.lastName}
                    onChange={(value) => updateField('lastName', value)}
                    error={errors.lastName}
                    required
                    placeholder="Enter your last name"
                />
            </div>

            <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(value) => updateField('email', value)}
                error={errors.email}
                required
                placeholder="Enter your email"
            />

            <Input
                label="Phone Number"
                type="tel"
                value={formData.phone}
                onChange={(value) => updateField('phone', value)}
                error={errors.phone}
                required
                placeholder="Enter your phone number"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    label="Password"
                    type="password"
                    value={formData.password}
                    onChange={(value) => updateField('password', value)}
                    error={errors.password}
                    required
                    placeholder="Enter your password"
                />

                <Input
                    label="Confirm Password"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(value) => updateField('confirmPassword', value)}
                    error={errors.confirmPassword}
                    required
                    placeholder="Confirm your password"
                />
            </div>

            <Select
                label="Subscription Plan"
                options={planOptions}
                value={formData.plan}
                onChange={(value) => updateField('plan', value as any)}
                error={errors.plan}
                required
            />

            <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isLoading}
                className="w-full"
            >
                Create Account
            </Button>
        </form>
    );
};
