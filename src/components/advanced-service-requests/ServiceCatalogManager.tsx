"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Modal } from '@/components/ui/Modal';

interface Service {
    id: string;
    name: string;
    description: string;
    category: string;
    icon: string;
    isActive: boolean;
    isCustom: boolean;
    hotelName?: string;
    usageCount: number;
}

interface ServiceFormData {
    name: string;
    description: string;
    category: string;
    icon: string;
    estimatedDuration: number;
    requiredStaffCount: number;
    instructions: string;
    price: number;
}

const serviceCategories = [
    { value: 'room_service', label: '🍽️ Room Service' },
    { value: 'housekeeping', label: '🧹 Housekeeping' },
    { value: 'concierge', label: '🛎️ Concierge' },
    { value: 'transportation', label: '🚗 Transportation' },
    { value: 'laundry', label: '👕 Laundry' },
    { value: 'maintenance', label: '🔧 Maintenance' },
    { value: 'restaurant', label: '🍴 Restaurant' },
    { value: 'spa', label: '💆 Spa' },
    { value: 'other', label: '🔹 Other' }
];

const defaultIcons = ['🛎️', '🍽️', '🧹', '🚗', '👕', '🔧', '🍴', '💆', '🏨', '🎯', '⭐', '🌟'];

export default function ServiceCatalogManager() {
    const { data: session } = useSession();
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [showInactiveServices, setShowInactiveServices] = useState(false);
    
    const [formData, setFormData] = useState<ServiceFormData>({
        name: '',
        description: '',
        category: 'other',
        icon: '🛎️',
        estimatedDuration: 30,
        requiredStaffCount: 1,
        instructions: '',
        price: 0
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (session?.user) {
            fetchServices();
        }
    }, [session]);

    const fetchServices = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/admin/services?includeDefault=true');
            if (response.ok) {
                const data = await response.json();
                setServices(data.services || []);
            }
        } catch (error) {
            console.error('Error fetching services:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Service name is required';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        }

        if (formData.estimatedDuration < 1) {
            newErrors.estimatedDuration = 'Duration must be at least 1 minute';
        }

        if (formData.requiredStaffCount < 1) {
            newErrors.requiredStaffCount = 'At least 1 staff member is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        try {
            const url = editingService ? '/api/admin/services' : '/api/admin/services';
            const method = editingService ? 'PUT' : 'POST';
            const body = editingService 
                ? { serviceId: editingService.id, ...formData }
                : formData;

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const result = await response.json();

            if (response.ok) {
                alert(editingService ? 'Service updated successfully!' : 'Service created successfully!');
                setShowCreateModal(false);
                setEditingService(null);
                resetForm();
                fetchServices();
            } else {
                alert(`Error: ${result.error}`);
            }
        } catch (error) {
            console.error('Service operation error:', error);
            alert('Network error occurred');
        }
    };

    const handleEdit = (service: Service) => {
        setEditingService(service);
        setFormData({
            name: service.name,
            description: service.description,
            category: service.category,
            icon: service.icon,
            estimatedDuration: 30, // Default since we don't store this yet
            requiredStaffCount: 1,  // Default since we don't store this yet
            instructions: '',       // Default since we don't store this yet
            price: 0               // Default since we don't store this yet
        });
        setShowCreateModal(true);
    };

    const handleToggleActive = async (service: Service) => {
        try {
            const response = await fetch('/api/admin/services', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serviceId: service.id,
                    isActive: !service.isActive
                })
            });

            if (response.ok) {
                fetchServices();
            } else {
                const result = await response.json();
                alert(`Error: ${result.error}`);
            }
        } catch (error) {
            console.error('Toggle service error:', error);
            alert('Network error occurred');
        }
    };

    const handleDelete = async (service: Service) => {
        if (!confirm(`Are you sure you want to delete "${service.name}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/services?serviceId=${service.id}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (response.ok) {
                alert('Service deleted successfully!');
                fetchServices();
            } else {
                alert(`Error: ${result.error}`);
            }
        } catch (error) {
            console.error('Delete service error:', error);
            alert('Network error occurred');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            category: 'other',
            icon: '🛎️',
            estimatedDuration: 30,
            requiredStaffCount: 1,
            instructions: '',
            price: 0
        });
        setErrors({});
    };

    const filteredServices = services.filter(service => {
        if (!showInactiveServices && !service.isActive) return false;
        if (selectedCategory && service.category !== selectedCategory) return false;
        return true;
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-minion-yellow"></div>
                <span className="ml-2">Loading services...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Service Catalog Management</h2>
                <button
                    onClick={() => {
                        setEditingService(null);
                        resetForm();
                        setShowCreateModal(true);
                    }}
                    className="btn-minion flex items-center space-x-2"
                >
                    <span>➕</span>
                    <span>Create Service</span>
                </button>
            </div>

            {/* Filters */}
            <div className="card-minion">
                <div className="flex flex-wrap items-center gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="input-minion min-w-[200px]"
                        >
                            <option value="">All Categories</option>
                            {serviceCategories.map(cat => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="showInactive"
                            checked={showInactiveServices}
                            onChange={(e) => setShowInactiveServices(e.target.checked)}
                            className="rounded border-gray-300 text-minion-yellow focus:ring-minion-yellow mr-2"
                        />
                        <label htmlFor="showInactive" className="text-sm text-gray-700">
                            Show inactive services
                        </label>
                    </div>
                    <button
                        onClick={fetchServices}
                        className="ml-auto text-sm bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded transition-colors"
                    >
                        🔄 Refresh
                    </button>
                </div>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service) => (
                    <div key={service.id} className="card-minion relative">
                        {/* Service Type Badge */}
                        <div className="absolute top-4 right-4">
                            {service.isCustom ? (
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                    Custom
                                </span>
                            ) : (
                                <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                                    Default
                                </span>
                            )}
                        </div>

                        {/* Service Icon */}
                        <div className="text-4xl mb-3">{service.icon}</div>

                        {/* Service Info */}
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">{service.name}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{service.description}</p>
                        
                        {/* Category */}
                        <div className="flex items-center mb-3">
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                {serviceCategories.find(cat => cat.value === service.category)?.label || service.category}
                            </span>
                        </div>

                        {/* Usage Stats */}
                        <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                            <span>Used {service.usageCount} times (30d)</span>
                            <span className={`px-2 py-1 rounded text-xs ${
                                service.isActive 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                            }`}>
                                {service.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between">
                            <div className="flex space-x-2">
                                {service.isCustom && (
                                    <button
                                        onClick={() => handleEdit(service)}
                                        className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded transition-colors"
                                    >
                                        Edit
                                    </button>
                                )}
                                <button
                                    onClick={() => handleToggleActive(service)}
                                    className={`text-sm px-3 py-1 rounded transition-colors ${
                                        service.isActive
                                            ? 'bg-red-100 hover:bg-red-200 text-red-700'
                                            : 'bg-green-100 hover:bg-green-200 text-green-700'
                                    }`}
                                >
                                    {service.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                            </div>
                            {service.isCustom && (
                                <button
                                    onClick={() => handleDelete(service)}
                                    className="text-sm text-red-600 hover:text-red-800 transition-colors"
                                >
                                    🗑️
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredServices.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">🛎️</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No services found</h3>
                    <p className="text-gray-600 mb-4">
                        {selectedCategory || !showInactiveServices
                            ? 'Try adjusting your filters or create a new service.'
                            : 'Create your first custom service to get started.'}
                    </p>
                    <button
                        onClick={() => {
                            setEditingService(null);
                            resetForm();
                            setShowCreateModal(true);
                        }}
                        className="btn-minion"
                    >
                        Create Service
                    </button>
                </div>
            )}

            {/* Create/Edit Service Modal */}
            <Modal 
                isOpen={showCreateModal} 
                onClose={() => {
                    setShowCreateModal(false);
                    setEditingService(null);
                    resetForm();
                }}
                title={editingService ? 'Edit Service' : 'Create New Service'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Service Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className={`input-minion ${errors.name ? 'border-red-500' : ''}`}
                                placeholder="e.g., Express Housekeeping"
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                className="input-minion"
                            >
                                {serviceCategories.map(cat => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description *
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            className={`input-minion ${errors.description ? 'border-red-500' : ''}`}
                            rows={3}
                            placeholder="Describe what this service provides..."
                        />
                        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={formData.icon}
                                    onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                                    className="input-minion flex-1"
                                    placeholder="🛎️"
                                />
                                <div className="text-2xl">{formData.icon}</div>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                                {defaultIcons.map(icon => (
                                    <button
                                        key={icon}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, icon }))}
                                        className="text-lg p-1 hover:bg-gray-100 rounded"
                                    >
                                        {icon}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Estimated Duration (minutes)
                            </label>
                            <input
                                type="number"
                                value={formData.estimatedDuration}
                                onChange={(e) => setFormData(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) || 0 }))}
                                className={`input-minion ${errors.estimatedDuration ? 'border-red-500' : ''}`}
                                min="1"
                            />
                            {errors.estimatedDuration && <p className="text-red-500 text-xs mt-1">{errors.estimatedDuration}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Required Staff Count
                            </label>
                            <input
                                type="number"
                                value={formData.requiredStaffCount}
                                onChange={(e) => setFormData(prev => ({ ...prev, requiredStaffCount: parseInt(e.target.value) || 1 }))}
                                className={`input-minion ${errors.requiredStaffCount ? 'border-red-500' : ''}`}
                                min="1"
                            />
                            {errors.requiredStaffCount && <p className="text-red-500 text-xs mt-1">{errors.requiredStaffCount}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Price (optional, in rupees)
                            </label>
                            <input
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                                className="input-minion"
                                min="0"
                                placeholder="0 for free"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Instructions for Staff (optional)
                        </label>
                        <textarea
                            value={formData.instructions}
                            onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                            className="input-minion"
                            rows={2}
                            placeholder="Special instructions for staff when handling this service..."
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={() => {
                                setShowCreateModal(false);
                                setEditingService(null);
                                resetForm();
                            }}
                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-minion"
                        >
                            {editingService ? 'Update Service' : 'Create Service'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
