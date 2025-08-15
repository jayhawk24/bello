import React, { useState } from 'react';
import { Button, Input, Select } from '@/components/ui';
import { StaffFormData } from '@/types';

interface StaffFormProps {
    initialData?: Partial<StaffFormData>;
    onSubmit: (data: StaffFormData) => Promise<void>;
    submitLabel?: string;
    loading?: boolean;
    isEdit?: boolean;
}

export const StaffForm: React.FC<StaffFormProps> = ({
    initialData = {},
    onSubmit,
    submitLabel = 'Save Staff Member',
    loading = false,
    isEdit = false
}) => {
    const [formData, setFormData] = useState<StaffFormData>({
        name: initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        password: initialData.password || '',
        role: initialData.role || 'hotel_staff'
    });

    const [errors, setErrors] = useState<Partial<Record<keyof StaffFormData, string>>>({});

    const roleOptions = [
        { value: 'hotel_staff', label: 'Hotel Staff' },
        { value: 'hotel_admin', label: 'Hotel Admin' }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        // Basic validation
        const newErrors: Partial<Record<keyof StaffFormData, string>> = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
        if (!isEdit && !formData.password.trim()) newErrors.password = 'Password is required';
        if (!formData.role) newErrors.role = 'Role is required';

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.email && !emailRegex.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Password validation (only for new staff)
        if (!isEdit && formData.password && formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters long';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            await onSubmit(formData);
        } catch (error) {
            console.error('Form submission error:', error);
        }
    };

    const updateField = (field: keyof StaffFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Input
                label="Full Name"
                value={formData.name}
                onChange={(value) => updateField('name', value)}
                error={errors.name}
                required
                placeholder="Enter full name"
            />

            <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(value) => updateField('email', value)}
                error={errors.email}
                required
                placeholder="Enter email address"
            />

            <Input
                label="Phone Number"
                type="tel"
                value={formData.phone}
                onChange={(value) => updateField('phone', value)}
                error={errors.phone}
                required
                placeholder="Enter phone number"
            />

            <Select
                label="Role"
                options={roleOptions}
                value={formData.role}
                onChange={(value) => updateField('role', value as any)}
                error={errors.role}
                required
                placeholder="Select role"
            />

            {!isEdit && (
                <Input
                    label="Password"
                    type="password"
                    value={formData.password}
                    onChange={(value) => updateField('password', value)}
                    error={errors.password}
                    required
                    placeholder="Enter password"
                />
            )}

            <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full"
            >
                {submitLabel}
            </Button>
        </form>
    );
};
