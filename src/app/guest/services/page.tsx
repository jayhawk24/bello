"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import toast from 'react-hot-toast';
import GuestNav from "@/components/GuestNav";
import LogoMark from "@/components/LogoMark";

interface Service {
    id: string;
    name: string;
    description: string;
    category: string;
    icon: string;
}

interface ServiceRequestForm {
    serviceId: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
}

function ServiceRequestComponent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session, status } = useSession();
    const bookingId = searchParams.get('bookingId');
    const roomId = searchParams.get('roomId');
    const hotelId = searchParams.get('hotelId');
    const serviceCategory = searchParams.get('category');

    const [services, setServices] = useState<Service[]>([]);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [formData, setFormData] = useState<ServiceRequestForm>({
        serviceId: '',
        title: '',
        description: '',
        priority: 'medium'
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [step, setStep] = useState<'select' | 'form'>('select');
    const [currentUrl, setCurrentUrl] = useState('');

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

    // Get current URL for login redirect
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setCurrentUrl(window.location.href);
        }
    }, []);

    useEffect(() => {
        if (!bookingId && (!roomId || !hotelId)) {
            router.push('/guest');
            return;
        }

        fetchServices();
    }, [bookingId, roomId, hotelId, router]);

    const fetchServices = async () => {
        try {
            let url;
            if (bookingId) {
                url = `/api/guest/services?bookingId=${bookingId}`;
            } else if (hotelId) {
                url = `/api/guest/services?hotelId=${hotelId}`;
            } else {
                setError('Missing required parameters');
                setIsLoading(false);
                return;
            }

            const response = await fetch(url);
            const result = await response.json();

            if (response.ok) {
                setServices(result.services);

                // Auto-select service if category is provided
                if (serviceCategory) {
                    const service = result.services.find((s: Service) => s.category === serviceCategory);
                    if (service) {
                        setSelectedService(service);
                        setFormData(prev => ({ ...prev, serviceId: service.id }));
                        setStep('form');
                    }
                }
            } else {
                setError(result.error || 'Failed to load services');
            }
        } catch (error) {
            setError('Failed to load services');
        } finally {
            setIsLoading(false);
        }
    };

    const handleServiceSelect = (service: Service) => {
        setSelectedService(service);
        setFormData(prev => ({ ...prev, serviceId: service.id }));
        setStep('form');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            let apiUrl, requestBody;

            if (bookingId) {
                // Booking-based request
                apiUrl = '/api/guest/service-requests';
                requestBody = {
                    bookingId,
                    ...formData
                };
            } else if (roomId && hotelId) {
                // Room-based request
                apiUrl = '/api/guest/room-service-requests';
                requestBody = {
                    roomId,
                    hotelId,
                    ...formData,
                    guestName: 'Room Guest' // Default name for room-based requests
                };
            } else {
                setError('Missing required parameters for service request');
                setIsSubmitting(false);
                return;
            }

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            const result = await response.json();

            if (response.ok) {
                // Redirect based on access method
                if (bookingId) {
                    router.push(`/guest/dashboard?bookingId=${bookingId}&success=Service request submitted successfully`);
                } else {
                    toast.success(`Service request submitted successfully! Request ID: ${result.serviceRequest.id.slice(-8)}`);
                    // Go back to room page
                    router.back();
                }
            } else {
                setError(result.error || 'Failed to submit service request');
            }
        } catch (error) {
            setError('Network error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100">
            <GuestNav
                title="Service Request"
                subtitle={session?.user ? `Welcome, ${session.user.name}!` : 'Request hotel services'}
                iconSrc="/icons/room-service.svg"
                actions={
                    !bookingId && !session?.user ? (
                        <>
                            <Link
                                href={`/guest-register?returnUrl=${encodeURIComponent(currentUrl)}&hotelId=${hotelId}`}
                                className="btn-minion px-3 py-2 text-sm"
                            >
                                Sign Up
                            </Link>
                            <Link
                                href={`/login?returnUrl=${encodeURIComponent(currentUrl)}`}
                                className="btn-minion-secondary px-3 py-2 text-sm"
                            >
                                Sign In
                            </Link>
                        </>
                    ) : session?.user ? (
                        <div className="flex items-center space-x-2 text-gray-600">
                            <LogoMark size={24} src="/icons/guest.svg" alt="Guest" rounded={false} />
                            <span className="font-medium text-sm">{session.user.name}</span>
                        </div>
                    ) : null
                }
                backLink={{
                    href: bookingId ? `/guest/dashboard?bookingId=${bookingId}` : '/guest/qr-scan',
                    label: `← Back to ${bookingId ? 'Dashboard' : 'Room Access'}`
                }}
            />

            <main className="max-w-4xl mx-auto px-6 py-8">
                {step === 'select' ? (
                    <div>
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-800 mb-4">Select a Service</h2>
                            <p className="text-gray-600">Choose the type of service you need</p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {services.map((service) => (
                                <div
                                    key={service.id}
                                    className="card-minion text-center cursor-pointer hover:shadow-lg transition-shadow"
                                    onClick={() => handleServiceSelect(service)}
                                >
                                    <div className="flex justify-center mb-4">
                                        <LogoMark
                                            size={48}
                                            src={getIconSrc(service.icon, service.category)}
                                            alt={`${service.name} icon`}
                                            rounded={false}
                                        />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
                                    <p className="text-gray-600 mb-4">{service.description}</p>
                                    <p className="text-sm text-gray-500 capitalize">
                                        {service.category.replace('_', ' ')}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {!bookingId && !session?.user && (
                            <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 text-center">
                                <div className="flex justify-center mb-3">
                                    <LogoMark size={48} src="/icons/guest.svg" alt="Create account" rounded={false} />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Want to track your requests?</h3>
                                <p className="text-gray-600 mb-4">
                                    Create an account to track service requests, save preferences, and get updates.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <Link
                                        href={`/guest-register?returnUrl=${encodeURIComponent(currentUrl)}&hotelId=${hotelId}`}
                                        className="btn-minion"
                                    >
                                        Create Account
                                    </Link>
                                    <Link
                                        href={`/login?returnUrl=${encodeURIComponent(currentUrl)}`}
                                        className="btn-minion-secondary"
                                    >
                                        Sign In
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        <div className="text-center mb-8">
                            <div className="flex justify-center mb-4">
                                <LogoMark
                                    size={64}
                                    src={getIconSrc(selectedService?.icon, selectedService?.category || undefined)}
                                    alt={`${selectedService?.name} icon`}
                                    rounded={false}
                                />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">
                                {selectedService?.name}
                            </h2>
                            <p className="text-gray-600">{selectedService?.description}</p>
                        </div>

                        <div className="card-minion max-w-2xl mx-auto">
                            {error && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="form-group">
                                    <label htmlFor="title" className="form-label">
                                        Request Title *
                                    </label>
                                    <input
                                        type="text"
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="Brief description of what you need"
                                        className="input-minion"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="description" className="form-label">
                                        Additional Details
                                    </label>
                                    <textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Any specific instructions or details..."
                                        className="input-minion"
                                        rows={4}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="priority" className="form-label">
                                        Priority Level
                                    </label>
                                    <select
                                        id="priority"
                                        value={formData.priority}
                                        onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                                        className="input-minion"
                                    >
                                        <option value="low">Low - No rush</option>
                                        <option value="medium">Medium - Normal</option>
                                        <option value="high">High - Soon as possible</option>
                                        <option value="urgent">Urgent - Immediate attention</option>
                                    </select>
                                </div>

                                {!bookingId && !session?.user && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <div className="flex items-start space-x-3">
                                            <div className="flex-shrink-0">
                                                <LogoMark size={32} src="/icons/info.svg" alt="Information" rounded={false} />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-blue-800 font-medium mb-2">Want to track your requests?</h4>
                                                <p className="text-blue-700 text-sm mb-3">
                                                    Create an account or sign in to track service requests and get updates.
                                                </p>
                                                <div className="flex flex-col sm:flex-row gap-2">
                                                    <Link
                                                        href={`/guest-register?returnUrl=${encodeURIComponent(currentUrl)}&hotelId=${hotelId}`}
                                                        className="inline-block bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
                                                    >
                                                        Create Account
                                                    </Link>
                                                    <Link
                                                        href={`/login?returnUrl=${encodeURIComponent(currentUrl)}`}
                                                        className="inline-block bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                                                    >
                                                        Sign In
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex space-x-4">
                                    <button
                                        type="button"
                                        onClick={() => setStep('select')}
                                        className="btn-minion-secondary flex-1"
                                    >
                                        ← Change Service
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-minion flex-1"
                                        disabled={isSubmitting || !formData.title.trim()}
                                    >
                                        {isSubmitting ? "Submitting..." : "Submit Request"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default function ServiceRequestPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ServiceRequestComponent />
        </Suspense>
    );
}