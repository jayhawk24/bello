import React, { useState } from 'react';
import { Button, Input } from '@/components/ui';
import { HotelFormData } from '@/types';

interface HotelFormProps {
    initialData?: Partial<HotelFormData>;
    onSubmit: (data: HotelFormData) => Promise<void>;
    submitLabel?: string;
    loading?: boolean;
}

export const HotelForm: React.FC<HotelFormProps> = ({
    initialData = {},
    onSubmit,
    submitLabel = 'Save Hotel',
    loading = false
}) => {
    const [formData, setFormData] = useState<HotelFormData>({
        name: initialData.name || '',
        address: initialData.address || '',
        city: initialData.city || '',
        state: initialData.state || '',
        country: initialData.country || '',
        contactEmail: initialData.contactEmail || '',
        contactPhone: initialData.contactPhone || '',
        totalRooms: initialData.totalRooms || 0
    });

    const [errors, setErrors] = useState<Partial<Record<keyof HotelFormData, string>>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        // Basic validation
        const newErrors: Partial<Record<keyof HotelFormData, string>> = {};
        if (!formData.name.trim()) newErrors.name = 'Hotel name is required';
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.state.trim()) newErrors.state = 'State is required';
        if (!formData.country.trim()) newErrors.country = 'Country is required';
        if (!formData.contactEmail.trim()) newErrors.contactEmail = 'Contact email is required';
        if (!formData.contactPhone.trim()) newErrors.contactPhone = 'Contact phone is required';
        if (formData.totalRooms <= 0) newErrors.totalRooms = 'Total rooms must be greater than 0';

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

    const updateField = (field: keyof HotelFormData, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Input
                label="Hotel Name"
                value={formData.name}
                onChange={(value) => updateField('name', value)}
                error={errors.name}
                required
                placeholder="Enter hotel name"
            />

            <Input
                label="Address"
                value={formData.address}
                onChange={(value) => updateField('address', value)}
                error={errors.address}
                required
                placeholder="Enter hotel address"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                    label="City"
                    value={formData.city}
                    onChange={(value) => updateField('city', value)}
                    error={errors.city}
                    required
                    placeholder="Enter city"
                />

                <Input
                    label="State"
                    value={formData.state}
                    onChange={(value) => updateField('state', value)}
                    error={errors.state}
                    required
                    placeholder="Enter state"
                />

                <Input
                    label="Country"
                    value={formData.country}
                    onChange={(value) => updateField('country', value)}
                    error={errors.country}
                    required
                    placeholder="Enter country"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    label="Contact Email"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(value) => updateField('contactEmail', value)}
                    error={errors.contactEmail}
                    required
                    placeholder="Enter contact email"
                />

                <Input
                    label="Contact Phone"
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(value) => updateField('contactPhone', value)}
                    error={errors.contactPhone}
                    required
                    placeholder="Enter contact phone"
                />
            </div>

            <Input
                label="Total Rooms"
                type="number"
                value={formData.totalRooms.toString()}
                onChange={(value) => updateField('totalRooms', parseInt(value) || 0)}
                error={errors.totalRooms}
                required
                placeholder="Enter total number of rooms"
            />

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
