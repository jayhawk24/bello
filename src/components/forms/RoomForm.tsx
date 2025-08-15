import React, { useState } from 'react';
import { Button, Input, Select } from '@/components/ui';
import { RoomFormData } from '@/types';

interface RoomFormProps {
    initialData?: Partial<RoomFormData>;
    onSubmit: (data: RoomFormData) => Promise<void>;
    submitLabel?: string;
    loading?: boolean;
}

export const RoomForm: React.FC<RoomFormProps> = ({
    initialData = {},
    onSubmit,
    submitLabel = 'Save Room',
    loading = false
}) => {
    const [formData, setFormData] = useState<RoomFormData>({
        roomNumber: initialData.roomNumber || '',
        roomType: initialData.roomType || ''
    });

    const [errors, setErrors] = useState<Partial<Record<keyof RoomFormData, string>>>({});

    const roomTypeOptions = [
        { value: 'single', label: 'Single Room' },
        { value: 'double', label: 'Double Room' },
        { value: 'twin', label: 'Twin Room' },
        { value: 'suite', label: 'Suite' },
        { value: 'deluxe', label: 'Deluxe Room' },
        { value: 'family', label: 'Family Room' },
        { value: 'presidential', label: 'Presidential Suite' }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        // Basic validation
        const newErrors: Partial<Record<keyof RoomFormData, string>> = {};
        if (!formData.roomNumber.trim()) newErrors.roomNumber = 'Room number is required';
        if (!formData.roomType.trim()) newErrors.roomType = 'Room type is required';

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

    const updateField = (field: keyof RoomFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Input
                label="Room Number"
                value={formData.roomNumber}
                onChange={(value) => updateField('roomNumber', value)}
                error={errors.roomNumber}
                required
                placeholder="Enter room number (e.g., 101, 2A, etc.)"
            />

            <Select
                label="Room Type"
                options={roomTypeOptions}
                value={formData.roomType}
                onChange={(value) => updateField('roomType', value)}
                error={errors.roomType}
                required
                placeholder="Select room type"
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
