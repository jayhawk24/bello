"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface GuestDashboardData {
    booking: {
        id: string;
        bookingReference: string;
        checkInDate: string;
        checkOutDate: string;
        status: string;
        guestName: string;
        guestEmail: string;
        room: {
            id: string;
            roomNumber: string;
            roomType: string;
            hotel: {
                id: string;
                name: string;
                contactEmail: string;
                contactPhone: string;
            };
        };
    };
    serviceRequests: any[];
}

export default function GuestDashboardPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const bookingId = searchParams.get('bookingId');
    const successMessage = searchParams.get('success');
    
    const [dashboardData, setDashboardData] = useState<GuestDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!bookingId) {
            router.push('/guest');
            return;
        }
        
        fetchDashboardData();
        fetchServiceRequests();
    }, [bookingId, router]);

    const fetchDashboardData = async () => {
        try {
            const response = await fetch('/api/guest/booking-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId })
            });

            const result = await response.json();

            if (response.ok) {
                setDashboardData({
                    booking: result.booking,
                    serviceRequests: [] // Will be fetched separately
                });
            } else {
                setError(result.error || 'Failed to load booking information');
            }
        } catch (error) {
            setError('Network error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchServiceRequests = async () => {
        try {
            const response = await fetch(`/api/guest/service-requests?bookingId=${bookingId}`);
            const result = await response.json();

            if (response.ok) {
                setDashboardData(prev => prev ? {
                    ...prev,
                    serviceRequests: result.serviceRequests
                } : null);
            }
        } catch (error) {
            console.error('Failed to fetch service requests:', error);
        }
    };    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center">
                <div className="card-minion text-center">
                    <div className="animate-bounce-slow mb-4">
                        <span className="text-4xl">🛎️</span>
                    </div>
                    <p className="text-gray-600">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (error || !dashboardData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center">
                <div className="card-minion text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Unable to Load Dashboard</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Link href="/guest" className="btn-minion">
                        Back to Guest Access
                    </Link>
                </div>
            </div>
        );
    }

    const { booking } = dashboardData;

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-minion-yellow rounded-full flex items-center justify-center">
                                <span className="text-2xl">🏨</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">{booking.room.hotel.name}</h1>
                                <p className="text-gray-600">Guest Dashboard</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600">Room {booking.room.roomNumber}</p>
                            <p className="text-xs text-gray-500">{booking.bookingReference}</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-8">
                {/* Success Message */}
                {successMessage && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-8">
                        {successMessage}
                    </div>
                )}

                {/* Welcome Section */}
                <div className="card-minion text-center mb-8">
                    <div className="text-6xl mb-4">👋</div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">
                        Welcome, {booking.guestName}!
                    </h2>
                    <p className="text-xl text-gray-600 mb-2">
                        {booking.room.roomType} - Room {booking.room.roomNumber}
                    </p>
                    <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
                        <span>📅 Check-in: {new Date(booking.checkInDate).toLocaleDateString()}</span>
                        <span>📅 Check-out: {new Date(booking.checkOutDate).toLocaleDateString()}</span>
                    </div>
                </div>

                {/* Quick Service Access */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {/* Room Service */}
                    <div className="card-minion text-center">
                        <div className="text-4xl mb-4">🍽️</div>
                        <h3 className="text-xl font-semibold mb-2">Room Service</h3>
                        <p className="text-gray-600 mb-4">
                            Order food and beverages directly to your room
                        </p>
                        <Link 
                            href={`/guest/services?bookingId=${booking.id}&category=room_service`}
                            className="btn-minion w-full"
                        >
                            Order Now
                        </Link>
                    </div>

                    {/* Housekeeping */}
                    <div className="card-minion text-center">
                        <div className="text-4xl mb-4">🧹</div>
                        <h3 className="text-xl font-semibold mb-2">Housekeeping</h3>
                        <p className="text-gray-600 mb-4">
                            Request cleaning, towels, or other amenities
                        </p>
                        <Link 
                            href={`/guest/services?bookingId=${booking.id}&category=housekeeping`}
                            className="btn-minion w-full"
                        >
                            Request Service
                        </Link>
                    </div>

                    {/* Concierge */}
                    <div className="card-minion text-center">
                        <div className="text-4xl mb-4">🎩</div>
                        <h3 className="text-xl font-semibold mb-2">Concierge</h3>
                        <p className="text-gray-600 mb-4">
                            Local recommendations and assistance
                        </p>
                        <Link 
                            href={`/guest/services?bookingId=${booking.id}&category=concierge`}
                            className="btn-minion w-full"
                        >
                            Get Help
                        </Link>
                    </div>

                    {/* Maintenance */}
                    <div className="card-minion text-center">
                        <div className="text-4xl mb-4">🔧</div>
                        <h3 className="text-xl font-semibold mb-2">Maintenance</h3>
                        <p className="text-gray-600 mb-4">
                            Report issues or request repairs
                        </p>
                        <Link 
                            href={`/guest/services?bookingId=${booking.id}&category=maintenance`}
                            className="btn-minion w-full"
                        >
                            Report Issue
                        </Link>
                    </div>
                </div>

                {/* Service Request History */}
                <div className="card-minion mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Service Request History</h2>
                        <Link 
                            href={`/guest/services?bookingId=${booking.id}`}
                            className="text-minion-blue hover:underline"
                        >
                            New Request
                        </Link>
                    </div>

                    {dashboardData.serviceRequests.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="text-4xl mb-4">📝</div>
                            <p className="text-gray-600">No service requests yet</p>
                            <p className="text-sm text-gray-500 mt-2">
                                When you request services, they'll appear here
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {dashboardData.serviceRequests.slice(0, 3).map((request: any) => (
                                <div key={request.id} className="border rounded-lg p-4 bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-semibold text-gray-800">{request.title}</h4>
                                            <p className="text-sm text-gray-600">{request.description}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Requested: {new Date(request.requestedAt).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                request.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                                request.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {request.status.replace('_', ' ')}
                                            </span>
                                            <p className="text-xs text-gray-500 mt-1 capitalize">
                                                {request.priority} priority
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {dashboardData.serviceRequests.length > 3 && (
                                <div className="text-center">
                                    <Link 
                                        href={`/guest/requests?bookingId=${booking.id}`}
                                        className="text-minion-blue hover:underline"
                                    >
                                        View all {dashboardData.serviceRequests.length} requests
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Hotel Information */}
                <div className="card-minion">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Hotel Information</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold text-gray-800 mb-2">Contact Information</h3>
                            <div className="space-y-2 text-gray-600">
                                <p>📧 {booking.room.hotel.contactEmail}</p>
                                <p>📞 {booking.room.hotel.contactPhone}</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800 mb-2">Quick Services</h3>
                            <div className="space-y-2">
                                <button className="btn-minion-secondary w-full text-sm">
                                    📺 TV Guide
                                </button>
                                <button className="btn-minion-secondary w-full text-sm">
                                    📶 WiFi Info
                                </button>
                                <button className="btn-minion-secondary w-full text-sm">
                                    🚗 Valet Parking
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Emergency Contact */}
                <div className="mt-8 p-4 bg-red-50 rounded-lg border border-red-200 text-center">
                    <p className="text-red-800 font-medium">
                        🚨 For emergencies, call hotel security or dial 911
                    </p>
                    <p className="text-red-600 text-sm mt-1">
                        Front desk: {booking.room.hotel.contactPhone}
                    </p>
                </div>
            </main>
        </div>
    );
}
