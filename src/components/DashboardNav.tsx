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
        <nav className="nav-minion px-6 py-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
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
        </nav>
    );
};

export default DashboardNav;
