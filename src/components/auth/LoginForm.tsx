import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/components/ui';
import { LoginFormData } from '@/types';
import { userLoginSchema } from '@/lib/validations';

export const LoginForm: React.FC = () => {
    const router = useRouter();
    const [formData, setFormData] = useState<LoginFormData>({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState<Partial<LoginFormData>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [generalError, setGeneralError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});
        setGeneralError('');

        try {
            // Validate form data
            const validatedData = userLoginSchema.parse(formData);

            const result = await signIn('credentials', {
                email: validatedData.email,
                password: validatedData.password,
                redirect: false
            });

            if (result?.error) {
                setGeneralError('Invalid email or password');
            } else if (result?.ok) {
                router.push('/dashboard');
                router.refresh();
            }
        } catch (error: any) {
            if (error.errors) {
                const fieldErrors: Partial<LoginFormData> = {};
                error.errors.forEach((err: any) => {
                    if (err.path[0]) {
                        fieldErrors[err.path[0] as keyof LoginFormData] = err.message;
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

    const updateField = (field: keyof LoginFormData, value: string) => {
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
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(value) => updateField('email', value)}
                error={errors.email}
                required
                placeholder="Enter your email"
            />

            <Input
                label="Password"
                type="password"
                value={formData.password}
                onChange={(value) => updateField('password', value)}
                error={errors.password}
                required
                placeholder="Enter your password"
            />

            <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isLoading}
                className="w-full"
            >
                Sign In
            </Button>
        </form>
    );
};
