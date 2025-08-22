"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface HotelData {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    contactEmail: string;
    contactPhone: string;
    subscriptionPlan: string;
    subscriptionStatus: string;
    totalRooms: number;
    createdAt: string;
}

export default function HotelProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [hotel, setHotel] = useState<HotelData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

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
        fetchHotelData();
    }, [session, status, router]);

    const fetchHotelData = async () => {
        try {
            const response = await fetch("/api/hotel/profile");
            if (response.ok) {
                const data = await response.json();
                setHotel(data.hotel);
            } else {
                setError("Failed to load hotel data");
            }
        } catch (error) {
            setError("Network error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    if (status === "loading" || isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center">
                <div className="card-minion text-center">
                    <div className="animate-bounce-slow mb-4">
                        <span className="text-4xl">🏨</span>
                    </div>
                    <p className="text-gray-600">Loading hotel profile...</p>
                </div>
            </div>
        );
    }

    if (!session || session.user.role !== "hotel_admin") {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100">
            {/* Navigation */}
            <nav className="nav-minion px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-minion-yellow rounded-full flex items-center justify-center">
                            <span className="text-2xl">🏨</span>
                        </div>
                        <Link href="/dashboard" className="text-2xl font-bold text-gray-800 hover:text-minion-blue transition-colors">
                            Bello Dashboard
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-gray-600">Welcome, {session.user.name}</span>
                        <Link href="/dashboard" className="btn-minion-secondary">
                            ← Back to Dashboard
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-6 py-12">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">
                        Hotel Profile 🏨
                    </h1>
                    <p className="text-xl text-gray-600">
                        Manage your hotel information and settings
                    </p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {hotel ? (
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Hotel Info Card */}
                        <div className="lg:col-span-2">
                            <div className="card-minion">
                                <div className="flex justify-between items-start mb-6">
                                    <h2 className="text-2xl font-bold text-gray-800">Hotel Information</h2>
                                    <Link href="/dashboard/hotel/edit" className="btn-minion">
                                        ✏️ Edit Details
                                    </Link>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="font-semibold text-gray-800 mb-2">Basic Information</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-600">Hotel Name</label>
                                                <p className="text-gray-800 font-medium">{hotel.name}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-600">Total Rooms</label>
                                                <p className="text-gray-800 font-medium">{hotel.totalRooms}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-gray-800 mb-2">Contact Information</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-600">Email</label>
                                                <p className="text-gray-800">{hotel.contactEmail}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-600">Phone</label>
                                                <p className="text-gray-800">{hotel.contactPhone}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <h3 className="font-semibold text-gray-800 mb-2">Address</h3>
                                    <div className="text-gray-800">
                                        {hotel.address ? (
                                            <div>
                                                <p>{hotel.address}</p>
                                                <p>{hotel.city}, {hotel.state}</p>
                                                <p>{hotel.country}</p>
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 italic">Address not set</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Subscription Card */}
                        <div>
                            <div className="card-minion">
                                <h2 className="text-xl font-bold text-gray-800 mb-4">Subscription</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Current Plan</label>
                                        <div className="flex items-center">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${hotel.subscriptionPlan === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                                                    hotel.subscriptionPlan === 'premium' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-green-100 text-green-800'
                                                }`}>
                                                {hotel.subscriptionPlan.charAt(0).toUpperCase() + hotel.subscriptionPlan.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${hotel.subscriptionStatus === 'active' ? 'bg-green-100 text-green-800' :
                                                hotel.subscriptionStatus === 'trial' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                            }`}>
                                            {hotel.subscriptionStatus.charAt(0).toUpperCase() + hotel.subscriptionStatus.slice(1)}
                                        </span>
                                    </div>
                                    <div className="pt-4">
                                        <Link href="/dashboard/subscription" className="btn-minion w-full">
                                            Manage Subscription
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="card-minion mt-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
                                <div className="space-y-3">
                                    <Link href="/dashboard/hotel/setup" className="block btn-minion w-full text-center">
                                        🛠️ Hotel Setup
                                    </Link>
                                    <Link href="/dashboard/rooms" className="block btn-minion-secondary w-full text-center">
                                        🛏️ Manage Rooms
                                    </Link>
                                    {session.user.role === "hotel_admin" && (
                                        <Link href="/dashboard/staff" className="block btn-minion-secondary w-full text-center">
                                            👥 Manage Staff
                                        </Link>
                                    )}
                                    <Link href="/dashboard/requests" className="block btn-minion-secondary w-full text-center">
                                        🛎️ Service Requests
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="card-minion text-center">
                        <div className="text-6xl mb-4">🏨</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Hotel Setup Required</h2>
                        <p className="text-gray-600 mb-6">
                            Complete your hotel setup to start using all features
                        </p>
                        <Link href="/dashboard/hotel/setup" className="btn-minion">
                            Complete Setup
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
}
