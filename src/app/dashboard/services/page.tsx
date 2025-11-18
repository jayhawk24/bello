"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DashboardNav from "@/components/DashboardNav";
import LogoMark from "@/components/LogoMark";

interface Service {
    id: string;
    name: string;
    description: string;
    category: string;
    icon: string;
    isActive: boolean;
    createdAt: string;
}

interface ServiceFormData {
    name: string;
    description: string;
    category: string;
    icon: string;
    isActive: boolean;
}

const categoryIconMap: Record<string, string> = {
    room_service: "/icons/room-service.svg",
    housekeeping: "/icons/housekeeping.svg",
    concierge: "/icons/concierge.svg",
    transportation: "/icons/valet.svg",
    laundry: "/icons/laundry.svg",
    maintenance: "/icons/maintenance.svg",
    restaurant: "/icons/dining.svg",
    spa: "/icons/spa.svg",
    other: "/icons/document.svg"
};

const categories = [
    { value: 'room_service', label: 'Room Service' },
    { value: 'housekeeping', label: 'Housekeeping' },
    { value: 'concierge', label: 'Concierge' },
    { value: 'transportation', label: 'Transportation' },
    { value: 'laundry', label: 'Laundry' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'spa', label: 'Spa & Wellness' },
    { value: 'other', label: 'Other' }
];

const iconFallbackMap: Record<string, string> = {
    '🏨': "/icons/hotel.svg",
    '🍽️': "/icons/room-service.svg",
    '🧹': "/icons/housekeeping.svg",
    '🎩': "/icons/concierge.svg",
    '🚗': "/icons/valet.svg",
    '👔': "/icons/laundry.svg",
    '🔧': "/icons/maintenance.svg",
    '🍜': "/icons/dining.svg",
    '💆': "/icons/spa.svg",
    '📋': "/icons/document.svg",
    '🛎️': "/icons/bell.svg",
    '🌟': "/icons/star.svg",
    '💼': "/icons/business.svg",
    '🎯': "/icons/target.svg"
};

const iconOptions = [
    { value: "/icons/room-service.svg", label: "Room Service" },
    { value: "/icons/housekeeping.svg", label: "Housekeeping" },
    { value: "/icons/concierge.svg", label: "Concierge" },
    { value: "/icons/valet.svg", label: "Transportation" },
    { value: "/icons/laundry.svg", label: "Laundry" },
    { value: "/icons/maintenance.svg", label: "Maintenance" },
    { value: "/icons/dining.svg", label: "Restaurant" },
    { value: "/icons/spa.svg", label: "Spa & Wellness" },
    { value: "/icons/document.svg", label: "Other" },
    { value: "/icons/bell.svg", label: "Concierge Bell" },
    { value: "/icons/star.svg", label: "Premium" },
    { value: "/icons/business.svg", label: "Business" },
    { value: "/icons/target.svg", label: "Targeted" }
];

export default function ServicesManagementPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [formData, setFormData] = useState<ServiceFormData>({
        name: '',
        description: '',
        category: 'room_service',
        icon: categoryIconMap['room_service'],
        isActive: true
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");


    const getIconSrc = (iconValue?: string, category?: string) => {
        if (iconValue?.startsWith("/")) {
            return iconValue;
        }
        if (iconValue && iconFallbackMap[iconValue]) {
            return iconFallbackMap[iconValue];
        }
        if (category && categoryIconMap[category]) {
            return categoryIconMap[category];
        }
        return "/icon.png";
    };

    useEffect(() => {
        if (status === "loading") return;
        if (!session) {
            router.push("/login");
            return;
        }
        if (session.user.role !== "hotel_admin") {
            router.push("/dashboard");
            return;
        }
        fetchServices();
    }, [session, status, router]);

    const fetchServices = async () => {
        try {
            const response = await fetch("/api/hotel/services");
            if (response.ok) {
                const data = await response.json();
                setServices(data.services);
            } else {
                setError("Failed to load services");
            }
        } catch (error) {
            setError("Network error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            const url = editingService
                ? `/api/hotel/services/${editingService.id}`
                : "/api/hotel/services";

            const method = editingService ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(editingService ? "Service updated successfully!" : "Service created successfully!");
                setShowForm(false);
                setEditingService(null);
                resetForm();
                fetchServices();
            } else {
                setError(data.error || "Failed to save service");
            }
        } catch (error) {
            setError("Network error occurred");
        }
    };

    const handleEdit = (service: Service) => {
        setEditingService(service);
        setFormData({
            name: service.name,
            description: service.description,
            category: service.category,
            icon: getIconSrc(service.icon, service.category),
            isActive: service.isActive
        });
        setShowForm(true);
    };

    const handleDelete = async (service: Service) => {
        if (!confirm(`Are you sure you want to delete "${service.name}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const response = await fetch(`/api/hotel/services/${service.id}`, {
                method: "DELETE"
            });

            if (response.ok) {
                setSuccess("Service deleted successfully!");
                fetchServices();
            } else {
                const data = await response.json();
                setError(data.error || "Failed to delete service");
            }
        } catch (error) {
            setError("Network error occurred");
        }
    };

    const toggleServiceStatus = async (service: Service) => {
        try {
            const response = await fetch(`/api/hotel/services/${service.id}`, {
                method: "PUT",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !service.isActive })
            });

            if (response.ok) {
                fetchServices();
            } else {
                const data = await response.json();
                setError(data.error || "Failed to update service status");
            }
        } catch (error) {
            setError("Network error occurred");
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            category: 'room_service',
            icon: categoryIconMap['room_service'],
            isActive: true
        });
        setEditingService(null);
    };

    const getCategoryInfo = (category: string) => {
        const match = categories.find(c => c.value === category);
        return {
            label: match?.label || category,
            iconSrc: categoryIconMap[category] || "/icon.png"
        };
    };

    if (status === "loading" || isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center">
                <div className="card-minion text-center">
                    <div className="animate-bounce-slow mb-4 inline-flex">
                        <LogoMark size={56} src="/icons/services.svg" alt="Loading services" rounded={false} />
                    </div>
                    <p className="text-gray-600">Loading services...</p>
                </div>
            </div>
        );
    }

    if (!session || session.user.role !== "hotel_admin") {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100">
            <DashboardNav title="Service Management" iconSrc="/icons/services.svg" />

            <main className="max-w-7xl mx-auto px-6 py-12">{/* Navigation updated to use component */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-800 mb-4">
                            Services Management
                        </h1>
                        <p className="text-xl text-gray-600">
                            Manage the services your hotel offers to guests
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            resetForm();
                            setShowForm(true);
                        }}
                        className="btn-minion flex items-center gap-2"
                    >
                        <LogoMark size={20} src="/icons/bell.svg" alt="Add service" rounded={false} />
                        Add New Service
                    </button>
                </div>

                {/* Messages */}
                {error && (
                    <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
                        {success}
                    </div>
                )}

                {/* Service Form */}
                {showForm && (
                    <div className="card-minion mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">
                            {editingService ? 'Edit Service' : 'Add New Service'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Service Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-minion-yellow"
                                        placeholder="e.g., Room Service"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Category *
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-minion-yellow"
                                        required
                                    >
                                        {categories.map(category => (
                                            <option key={category.value} value={category.value}>
                                                {category.label}
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-minion-yellow"
                                    rows={3}
                                    placeholder="Describe what this service includes..."
                                    required
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Icon
                                    </label>
                                    <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-md">
                                        {iconOptions.map(option => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, icon: option.value }))}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-md border text-sm transition-colors ${formData.icon === option.value
                                                    ? 'bg-minion-yellow border-minion-yellow'
                                                    : 'border-transparent hover:bg-gray-100'
                                                    }`}
                                            >
                                                <LogoMark size={28} src={option.value} alt={option.label} rounded={false} />
                                                <span>{option.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                            className="mr-2"
                                        />
                                        <span className="text-sm font-medium text-gray-700">
                                            Service is active and available to guests
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingService(null);
                                        resetForm();
                                    }}
                                    className="btn-minion-secondary"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-minion">
                                    {editingService ? 'Update Service' : 'Create Service'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Services List */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service) => {
                        const categoryInfo = getCategoryInfo(service.category);
                        return (
                            <div key={service.id} className="card-minion">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center space-x-3">
                                        <LogoMark
                                            size={40}
                                            rounded={false}
                                            src={getIconSrc(service.icon, service.category)}
                                            alt={`${service.name} icon`}
                                        />
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-800">{service.name}</h3>
                                            <span className="text-sm text-gray-500">{categoryInfo.label}</span>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${service.isActive
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {service.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>

                                <p className="text-gray-600 mb-4 text-sm">{service.description}</p>

                                <div className="flex justify-between items-center">
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEdit(service)}
                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => toggleServiceStatus(service)}
                                            className={`text-sm font-medium ${service.isActive
                                                ? 'text-orange-600 hover:text-orange-800'
                                                : 'text-green-600 hover:text-green-800'
                                                }`}
                                        >
                                            {service.isActive ? 'Deactivate' : 'Activate'}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(service)}
                                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {services.length === 0 && !showForm && (
                    <div className="card-minion text-center">
                        <div className="flex justify-center mb-4">
                            <LogoMark size={72} src="/icons/bell.svg" alt="No services" rounded={false} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">No Services Added Yet</h2>
                        <p className="text-gray-600 mb-6">
                            Start by adding services that your hotel offers to guests
                        </p>
                        <button
                            onClick={() => {
                                resetForm();
                                setShowForm(true);
                            }}
                            className="btn-minion"
                        >
                            Add Your First Service
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
