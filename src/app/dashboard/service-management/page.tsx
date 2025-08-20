"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import ServiceCatalogManager from "@/components/advanced-service-requests/ServiceCatalogManager";

export default function ServiceManagementPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "loading") return;
        
        if (!session?.user || session.user.role !== 'hotel_admin') {
            router.push("/dashboard");
            return;
        }
    }, [session, status, router]);

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center">
                <div className="card-minion text-center">
                    <div className="animate-bounce-slow mb-4">
                        <span className="text-4xl">🛎️</span>
                    </div>
                    <p className="text-gray-600">Loading service management...</p>
                </div>
            </div>
        );
    }

    if (!session?.user || session.user.role !== 'hotel_admin') {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <Link href="/dashboard" className="text-minion-blue hover:text-minion-dark">
                                ← Back to Dashboard
                            </Link>
                            <div className="h-6 border-l border-gray-300"></div>
                            <h1 className="text-xl font-semibold text-gray-800">
                                Service Catalog Management
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">
                                {session.user.name} • Hotel Admin
                            </span>
                            <div className="w-8 h-8 bg-minion-yellow rounded-full flex items-center justify-center text-minion-dark font-semibold">
                                {session.user.name?.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Introduction */}
                <div className="mb-8">
                    <div className="card-minion">
                        <div className="flex items-start space-x-4">
                            <div className="text-4xl">🛎️</div>
                            <div className="flex-1">
                                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                    Manage Your Hotel Services
                                </h2>
                                <p className="text-gray-600 mb-4">
                                    Customize the services available to your guests. Create custom services, manage existing ones, 
                                    and track their usage. Default services are provided by the system and available to all hotels.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-blue-500">🔹</span>
                                        <span>Create custom services specific to your hotel</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-green-500">✅</span>
                                        <span>Activate/deactivate services as needed</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-orange-500">📊</span>
                                        <span>Track service usage and performance</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Service Catalog Manager Component */}
                <ServiceCatalogManager />

                {/* Help Section */}
                <div className="mt-8">
                    <div className="card-minion">
                        <h3 className="text-lg font-semibold mb-4">Need Help?</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                            <div>
                                <h4 className="font-medium text-gray-800 mb-2">Service Types</h4>
                                <ul className="space-y-1 text-gray-600">
                                    <li><strong>Default Services:</strong> Pre-built services available to all hotels</li>
                                    <li><strong>Custom Services:</strong> Services you create specific to your hotel</li>
                                    <li><strong>Active Services:</strong> Available to guests for booking</li>
                                    <li><strong>Inactive Services:</strong> Hidden from guests but preserved for later use</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-800 mb-2">Best Practices</h4>
                                <ul className="space-y-1 text-gray-600">
                                    <li>• Use clear, descriptive service names</li>
                                    <li>• Provide detailed descriptions for staff clarity</li>
                                    <li>• Set realistic estimated durations</li>
                                    <li>• Review service usage regularly to optimize offerings</li>
                                    <li>• Consider seasonal services for special occasions</li>
                                </ul>
                            </div>
                        </div>
                        
                        <div className="mt-6 pt-4 border-t border-gray-200 flex items-center space-x-4">
                            <Link 
                                href="/dashboard/enhanced-staff" 
                                className="btn-minion text-sm"
                            >
                                View Staff Dashboard
                            </Link>
                            <Link 
                                href="/dashboard/services" 
                                className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded transition-colors"
                            >
                                Legacy Service Management
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
