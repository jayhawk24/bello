"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardNav from "@/components/DashboardNav";
import DashboardCard from "@/components/dashboard/DashboardCard";
import LogoMark from "@/components/LogoMark";
import LiveRequestBoard from "@/components/LiveRequestBoard";

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [hotelName, setHotelName] = useState<string>("");
    const [totalRooms, setTotalRooms] = useState<number>(0);
    const [currentSubscription, setCurrentSubscription] = useState<any>(null);

    useEffect(() => {
        if (status === "loading") return; // Still loading

        if (!session) {
            router.push("/login");
            return;
        }

        // Role-based access control
        if (session.user?.role === 'guest') {
            router.push("/guest/services");
            return;
        }

        if (session.user?.role === 'super_admin') {
            router.push("/dashboard/super-admin");
            return;
        }

        // Allow hotel_admin and hotel_staff to access this dashboard
        if (session.user?.role !== 'hotel_admin' && session.user?.role !== 'hotel_staff') {
            router.push("/login");
            return;
        }
    }, [session, status, router]);

    useEffect(() => {
        const fetchHotelInfo = async () => {
            if (session?.user) {
                try {
                    const response = await fetch('/api/hotel/profile');
                    if (response.ok) {
                        const data = await response.json();
                        setHotelName(data.hotel?.name || "Dashboard");
                        setTotalRooms(data.hotel?.totalRooms || 0);
                    } else {
                        setHotelName("Dashboard");
                    }
                } catch (error) {
                    console.error('Failed to fetch hotel info:', error);
                    setHotelName("Dashboard");
                }
            }
        };
        const fetchSubscriptionData = async () => {
            try {
                const response = await fetch('/api/subscription/current');
                if (response.ok) {
                    const data = await response.json();
                    setCurrentSubscription(data);
                }
            } catch (error) {
                console.error('Error fetching subscription:', error);
            }
        };

        if (session) {
            fetchHotelInfo();
            fetchSubscriptionData()
        }
    }, [session]);

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center">
                <div className="card-minion text-center">
                    <div className="animate-bounce-slow mb-4">
                        <LogoMark size={56} />
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
            <DashboardNav title={hotelName || "Dashboard"} iconSrc="/icons/hotel.svg" showNotifications={true} />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="mb-8">
                    <h4 className="text-xl md:text-4xl font-bold text-gray-800 mb-4">
                        Welcome to Your Dashboard!
                    </h4>
                    <p className="text-xl text-gray-600">
                        {session.user.role === "hotel_admin" ? "Manage your hotel and provide excellent guest experiences." :
                            session.user.role === "hotel_staff" ? `Help guests with their service requests at ${session.user.hotel?.name || 'your hotel'}.` :
                                "Enjoy our premium concierge services."}
                    </p>
                </div>

                {/* Dashboard Cards */}
                <div className={`grid gap-6 mb-8 ${session.user.role === "hotel_admin" ? "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3" :
                    session.user.role === "super_admin" ? "md:grid-cols-2 lg:grid-cols-2" :
                        "md:grid-cols-3"
                    }`}>
                    {session.user.role === "hotel_admin" && (
                        <DashboardCard
                            iconSrc="/icons/hotel.svg"
                            title="Hotel Profile"
                            description={session.user.hotel?.name || "Setup your hotel details"}
                            buttonText="Manage Hotel"
                            href="/dashboard/hotel"
                        />
                    )}

                    <DashboardCard
                        iconSrc="/icons/rooms.svg"
                        title="Rooms & QR Codes"
                        description={
                            session.user.role === "hotel_admin"
                                ? "Configure rooms and generate QR codes for guests"
                                : "View rooms and download QR codes for guest access"
                        }
                        buttonText={session.user.role === "hotel_admin" ? "Manage Rooms" : "View Rooms"}
                        href="/dashboard/rooms"
                    />

                    {(session.user.role === "hotel_staff" || session.user.role === "hotel_admin") && (
                        <DashboardCard
                            iconSrc="/icons/requests.svg"
                            title="Service Requests"
                            description="View and manage incoming guest service requests"
                            buttonText="View Requests"
                            href="/dashboard/staff-requests"
                        />
                    )}

                    {session.user.role === "hotel_admin" && (
                        <>
                            <DashboardCard
                                iconSrc="/icons/services.svg"
                                title="Services Management"
                                description="Configure services offered to your guests"
                                buttonText="Manage Services"
                                href="/dashboard/services"
                            />
                            <DashboardCard
                                iconSrc="/icons/staff.svg"
                                title="Staff Management"
                                description="Add and manage your hotel staff members"
                                buttonText="Manage Staff"
                                href="/dashboard/staff"
                            />
                            <DashboardCard
                                iconSrc="/icons/subscription.svg"
                                title="Subscription"
                                description="Manage your subscription plan and billing"
                                buttonText="Manage Plan"
                                href="/pricing"
                            />
                        </>
                    )}

                    {session.user.role === "super_admin" && (
                        <div>
                            <div className="card-minion text-center">
                                <div className="w-12 h-12 mx-auto mb-4">
                                    <LogoMark size={48} src="/icons/super-admin.svg" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Super Admin</h3>
                                <p className="text-gray-600 mb-4">
                                    Manage all hotels and subscriptions
                                </p>
                                <Link href="/dashboard/super-admin" className="btn-minion">
                                    Admin Dashboard
                                </Link>
                            </div>
                            <div className="card-minion text-center">
                                <div className="w-12 h-12 mx-auto mb-4">
                                    <LogoMark size={48} src="/icons/subscription.svg" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Subscription</h3>
                                <p className="text-gray-600 mb-4">
                                    Manage your subscription plan and billing
                                </p>
                                <Link href="/dashboard/subscription" className="btn-minion">
                                    View Plans
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick Stats */}
                <div className="grid md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                        <div className="text-2xl font-bold text-minion-yellow">
                            {totalRooms}
                        </div>
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
                            {currentSubscription?.planType.toUpperCase() || "N/A"}
                        </div>
                        <div className="text-gray-600">Current Plan</div>
                    </div>
                </div>

                {/* Live Request Board */}
                {(session.user.role === "hotel_staff" || session.user.role === "hotel_admin") && (
                    <div className="mb-8">
                        <LiveRequestBoard maxItems={5} showHeader={true} />
                    </div>
                )}

                {/* Getting Started */}
                <div className="mt-12">
                    <h2 className="text-2xl font-bold mb-6">Getting Started</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <DashboardCard
                            iconSrc="/icons/hotel.svg"
                            title="Complete Hotel Setup"
                            description="Add your hotel details, address, and contact information."
                            buttonText="Complete Setup"
                            href="/dashboard/hotel/setup"
                        />
                        <DashboardCard
                            iconSrc="/icons/rooms.svg"
                            title="Add Rooms"
                            description="Configure your rooms and generate QR codes for guest access."
                            buttonText="Add Rooms"
                            href="/dashboard/rooms/add"
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}
