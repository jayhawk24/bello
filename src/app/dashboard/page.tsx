"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "loading") return; // Still loading
        if (!session) {
            router.push("/login");
        }
    }, [session, status, router]);

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center">
                <div className="card-minion text-center">
                    <div className="animate-bounce-slow mb-4">
                        <span className="text-4xl">🏨</span>
                    </div>
                    <p className="text-gray-600">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (!session) {
        return null; // Will redirect via useEffect
    }

    const handleSignOut = async () => {
        await signOut({ callbackUrl: "/", redirect: true });
        // Extra: force reload to clear all client state
        window.location.replace("/");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100">
            {/* Navigation */}
            <nav className="nav-minion px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-minion-yellow rounded-full flex items-center justify-center">
                            <span className="text-2xl">🏨</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">Bello Dashboard</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-gray-600">Welcome, {session.user.name}</span>
                        <button onClick={handleSignOut} className="btn-minion-secondary">
                            Sign Out
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">
                        Welcome to Your Dashboard! 🎉
                    </h1>
                    <p className="text-xl text-gray-600">
                        {session.user.role === "hotel_admin" ? "Manage your hotel and provide excellent guest experiences." :
                            session.user.role === "hotel_staff" ? `Help guests with their service requests at ${session.user.hotel?.name || 'your hotel'}.` :
                                "Enjoy our premium concierge services."}
                    </p>
                </div>

                {/* Dashboard Cards */}
                <div className={`grid gap-6 mb-8 ${session.user.role === "hotel_admin" ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-3"}`}>
                    {session.user.role === "hotel_admin" && (
                        <div className="card-minion text-center">
                            <div className="text-4xl mb-4">🏨</div>
                            <h3 className="text-xl font-semibold mb-2">Hotel Profile</h3>
                            <p className="text-gray-600 mb-4">
                                {session.user.hotel?.name || "Setup your hotel details"}
                            </p>
                            <Link href="/dashboard/hotel" className="btn-minion">
                                Manage Hotel
                            </Link>
                        </div>
                    )}

                    <div className="card-minion text-center">
                        <div className="text-4xl mb-4">🛏️</div>
                        <h3 className="text-xl font-semibold mb-2">Rooms & QR Codes</h3>
                        <p className="text-gray-600 mb-4">
                            {session.user.role === "hotel_admin" 
                                ? "Configure rooms and generate QR codes for guests"
                                : "View rooms and download QR codes for guest access"
                            }
                        </p>
                        <Link href="/dashboard/rooms" className="btn-minion">
                            {session.user.role === "hotel_admin" ? "Manage Rooms" : "View Rooms"}
                        </Link>
                    </div>

                    {(session.user.role === "hotel_staff" || session.user.role === "hotel_admin") && (
                        <>
                            <div className="card-minion text-center">
                                <div className="text-4xl mb-4">📋</div>
                                <h3 className="text-xl font-semibold mb-2">Service Requests</h3>
                                <p className="text-gray-600 mb-4">
                                    Basic view and manage guest service requests
                                </p>
                                <Link href="/dashboard/staff-requests" className="btn-minion">
                                    Legacy Dashboard
                                </Link>
                            </div>
                            
                            <div className="card-minion text-center">
                                <div className="text-4xl mb-4">🚀</div>
                                <h3 className="text-xl font-semibold mb-2">Enhanced Staff Dashboard</h3>
                                <p className="text-gray-600 mb-4">
                                    Advanced workload management and analytics
                                </p>
                                <Link href="/dashboard/enhanced-staff" className="btn-minion">
                                    New Dashboard
                                </Link>
                            </div>
                        </>
                    )}

                    {session.user.role === "hotel_admin" && (
                        <>
                            <div className="card-minion text-center">
                                <div className="text-4xl mb-4">🛎️</div>
                                <h3 className="text-xl font-semibold mb-2">Services Management</h3>
                                <p className="text-gray-600 mb-4">
                                    Basic service configuration
                                </p>
                                <Link href="/dashboard/services" className="btn-minion">
                                    Legacy Services
                                </Link>
                            </div>
                            
                            <div className="card-minion text-center">
                                <div className="text-4xl mb-4">⚙️</div>
                                <h3 className="text-xl font-semibold mb-2">Advanced Service Catalog</h3>
                                <p className="text-gray-600 mb-4">
                                    Create custom services and manage catalog
                                </p>
                                <Link href="/dashboard/service-management" className="btn-minion">
                                    Manage Catalog
                                </Link>
                            </div>
                            
                            <div className="card-minion text-center">
                                <div className="text-4xl mb-4">👥</div>
                                <h3 className="text-xl font-semibold mb-2">Staff Management</h3>
                                <p className="text-gray-600 mb-4">
                                    Add and manage your hotel staff members
                                </p>
                                <Link href="/dashboard/staff" className="btn-minion">
                                    Manage Staff
                                </Link>
                            </div>
                        </>
                    )}
                </div>

                {/* Quick Stats */}
                <div className="grid md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                        <div className="text-2xl font-bold text-minion-yellow">0</div>
                        <div className="text-gray-600">Total Rooms</div>
                    </div>
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                        <div className="text-2xl font-bold text-minion-blue">0</div>
                        <div className="text-gray-600">Active Requests</div>
                    </div>
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                        <div className="text-2xl font-bold text-success">0</div>
                        <div className="text-gray-600">Staff Members</div>
                    </div>
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                        <div className="text-2xl font-bold text-warning">
                            {session.user.hotel?.subscriptionPlan || "N/A"}
                        </div>
                        <div className="text-gray-600">Current Plan</div>
                    </div>
                </div>

                {/* Getting Started */}
                <div className="mt-12 card-minion">
                    <h2 className="text-2xl font-bold mb-4">🚀 Getting Started</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold mb-2">1. Complete Hotel Setup</h3>
                            <p className="text-gray-600 mb-4">Add your hotel details, address, and contact information.</p>
                            <Link href="/dashboard/hotel/setup" className="btn-minion">
                                Complete Setup
                            </Link>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">2. Add Rooms</h3>
                            <p className="text-gray-600 mb-4">Configure your rooms and generate QR codes for guest access.</p>
                            <Link href="/dashboard/rooms/add" className="btn-minion">
                                Add Rooms
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
