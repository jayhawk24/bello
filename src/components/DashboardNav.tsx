"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import NotificationBell from "./NotificationBell";

interface DashboardNavProps {
    title: string;
    icon?: string;
    showNotifications?: boolean;
}

const DashboardNav = ({ 
    title, 
    icon = "🏨", 
    showNotifications = false 
}: DashboardNavProps) => {
    const { data: session } = useSession();

    const handleSignOut = async () => {
        await signOut({ callbackUrl: "/", redirect: true });
        window.location.replace("/");
    };

    return (
        <nav className="nav-minion px-4 py-3">
            <div className="max-w-7xl mx-auto">
                {/* Mobile Layout */}
                <div className="flex flex-col space-y-3 sm:hidden">
                    <div className="flex justify-between items-center">
                        <Link href="/dashboard" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                            <div className="w-8 h-8 bg-minion-yellow rounded-full flex items-center justify-center">
                                <span className="text-lg">{icon}</span>
                            </div>
                            <h1 className="text-xl font-bold text-gray-800 truncate">{title}</h1>
                        </Link>
                        {showNotifications && <NotificationBell />}
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 truncate">Welcome, {session?.user?.name}</span>
                        <button onClick={handleSignOut} className="btn-minion-secondary text-sm px-3 py-2">
                            Sign Out
                        </button>
                    </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden sm:flex justify-between items-center">
                    <Link href="/dashboard" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                        <div className="w-10 h-10 bg-minion-yellow rounded-full flex items-center justify-center">
                            <span className="text-2xl">{icon}</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
                    </Link>
                    <div className="flex items-center space-x-4">
                        {showNotifications && <NotificationBell />}
                        <span className="text-gray-600">Welcome, {session?.user?.name}</span>
                        <button onClick={handleSignOut} className="btn-minion-secondary">
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default DashboardNav;
