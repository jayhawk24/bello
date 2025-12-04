"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Suspense, useState } from "react";

interface Room {
    id: string;
    roomNumber: string;
    roomType: string;
    hotel: {
        id: string;
        name: string;
        contactEmail: string;
        contactPhone: string;
    };
}

interface Booking {
    id: string;
    bookingReference: string;
    guestName: string;
}

interface Service {
    id: string;
    name: string;
    description: string;
    category: string;
    icon: string;
    price: number;
}

function GuestRoomComponent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [room, setRoom] = useState<Room | null>(null);
    const [booking, setBooking] = useState<Booking | null>(null);
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const hotelId = searchParams.get('hotelId');
    const roomNumber = searchParams.get('roomNumber');
    const accessCode = searchParams.get('accessCode');

    useEffect(() => {
        if (!hotelId || !roomNumber || !accessCode) {
            setError("Invalid QR code. Missing room information.");
            setIsLoading(false);
            return;
        }
        
        fetchRoomInfo();
    }, [hotelId, roomNumber, accessCode]);

    const fetchRoomInfo = async () => {
        try {
            const response = await fetch(`/api/guest/room-access?hotelId=${hotelId}&roomNumber=${roomNumber}&accessCode=${accessCode}`);
            if (response.ok) {
                const data = await response.json();
                setRoom(data.room);
                setBooking(data.booking);
                
                // Fetch available services for this hotel
                const servicesResponse = await fetch(`/api/guest/services?hotelId=${hotelId}`);
                if (servicesResponse.ok) {
                    const servicesData = await servicesResponse.json();
                    setServices(servicesData.services || []);
                }
            } else {
                setError("Invalid access code or room not found");
            }
        } catch (error) {
            setError("Network error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const handleServiceRequest = (service: Service) => {
        const queryParts = new URLSearchParams();
        if (booking) {
            queryParts.set('bookingId', booking.id);
        } else if (room) {
            queryParts.set('roomId', room.id);
            if (room.hotel?.id) {
                queryParts.set('hotelId', room.hotel.id);
            }
        }

        queryParts.set('serviceId', service.id);
        if (service.category) {
            queryParts.set('category', service.category);
        }

        if (booking) {
            // If there's an active booking, redirect to service request with booking context
            router.push(`/guest/services?${queryParts.toString()}`);
        } else if (room) {
            // If no booking but have room access, redirect to services page with room context
            router.push(`/guest/services?${queryParts.toString()}`);
        } else {
            // If no room access, redirect to booking ID entry
            router.push(`/guest/booking-id?message=Please enter your booking reference to request services`);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center">
                <div className="card-minion text-center">
                    <div className="animate-bounce-slow mb-4">
                        <span className="text-4xl">🛏️</span>
                    </div>
                    <p className="text-gray-600">Verifying room access...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center">
                <div className="card-minion text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <p className="text-sm text-gray-500">
                        Please contact hotel staff for assistance.
                    </p>
                </div>
            </div>
        );
    }

    if (!room) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center">
                <div className="card-minion text-center">
                    <div className="text-6xl mb-4">🔍</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Room Not Found</h2>
                    <p className="text-gray-600 mb-6">The requested room could not be found.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-minion-yellow rounded-full flex items-center justify-center">
                            <span className="text-2xl">🏨</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">{room.hotel.name}</h1>
                            <p className="text-gray-600">Guest Services Portal</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-8">
                {/* Welcome Section */}
                <div className="card-minion text-center mb-8">
                    <div className="text-6xl mb-4">🛏️</div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">
                        Welcome to Room {room.roomNumber}
                    </h2>
                    {booking && (
                        <p className="text-lg text-gray-700 mb-2">
                            Hello, {booking.guestName}!
                        </p>
                    )}
                    <p className="text-xl text-gray-600 mb-2">
                        {room.roomType}
                    </p>
                    <p className="text-gray-600">
                        We're here to make your stay comfortable and memorable
                    </p>
                </div>

                {/* Service Categories */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {services.length > 0 ? (
                        services.map((service) => (
                            <div key={service.id} className="card-minion text-center">
                                <div className="text-4xl mb-4">{service.icon || '🏨'}</div>
                                <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
                                <p className="text-gray-600 mb-4">
                                    {service.description}
                                </p>
                                {service.price > 0 && (
                                    <p className="text-sm text-gray-500 mb-4">
                                        Starting from ${service.price}
                                    </p>
                                )}
                                <button 
                                    className="btn-minion w-full"
                                    onClick={() => handleServiceRequest(service)}
                                >
                                    Request {service.name}
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-2 text-center py-8">
                            <p className="text-gray-500">Loading services...</p>
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
                                <p>📧 {room.hotel.contactEmail}</p>
                                <p>📞 {room.hotel.contactPhone}</p>
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
                        Front desk: {room.hotel.contactPhone}
                    </p>
                </div>
            </main>
        </div>
    );
}

export default function GuestRoomPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <GuestRoomComponent />
        </Suspense>
    );
}