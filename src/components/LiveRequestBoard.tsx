"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ServiceRequest {
    id: string;
    serviceType: string;
    status: string;
    room: {
        roomNumber: string;
    };
    createdAt: string;
    estimatedTime?: number;
}

const getServiceIcon = (serviceType: string): string => {
    const icons: Record<string, string> = {
        "Room Service": "🍽️",
        "Housekeeping": "🧺",
        "Maintenance": "🔧",
        "Transport": "✈️",
        "Concierge": "🛎️",
        "Laundry": "👔",
        "Wake Up Call": "⏰",
        "Extra Amenities": "🎁",
    };
    return icons[serviceType] || "📋";
};

const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { text: string; className: string }> = {
        pending: { text: "Pending", className: "bg-yellow-100 text-yellow-800" },
        in_progress: { text: "In progress", className: "bg-minion-yellow/40 text-gray-900" },
        completed: { text: "Completed", className: "bg-green-100 text-green-800" },
        cancelled: { text: "Cancelled", className: "bg-red-100 text-red-800" },
    };
    return statusConfig[status] || statusConfig.pending;
};

const calculateETA = (createdAt: string, estimatedTime?: number): string => {
    if (!estimatedTime) return "TBD";
    const created = new Date(createdAt);
    const now = new Date();
    const elapsedMinutes = Math.floor((now.getTime() - created.getTime()) / 60000);
    const remainingMinutes = Math.max(0, estimatedTime - elapsedMinutes);

    if (remainingMinutes === 0) return "Soon";
    return `${remainingMinutes}m`;
};

export default function LiveRequestBoard({ maxItems = 3, showHeader = true }: { maxItems?: number; showHeader?: boolean }) {
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await fetch("/api/service-requests?status=pending,in_progress&limit=" + maxItems);
                if (response.ok) {
                    const data = await response.json();
                    setRequests(data.requests || []);
                }
            } catch (error) {
                console.error("Failed to fetch service requests:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
        const interval = setInterval(fetchRequests, 10000); // Refresh every 10 seconds

        return () => clearInterval(interval);
    }, [maxItems]);

    if (loading) {
        return (
            <div className="card-minion relative overflow-hidden bg-white/90">
                {showHeader && (
                    <>
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-minion-yellow via-amber-400 to-minion-blue" aria-hidden />
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-minion-blue/10 rounded-2xl flex items-center justify-center text-2xl">🧭</div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-600">Live request board</p>
                                    <p className="text-lg font-bold text-gray-900">Loading...</p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
                <div className="space-y-4">
                    {[1, 2, 3].slice(0, maxItems).map((i) => (
                        <div key={i} className="animate-pulse rounded-2xl border border-gray-100 bg-gray-50/80 px-4 py-3 h-16" />
                    ))}
                </div>
            </div>
        );
    }

    if (requests.length === 0) {
        return (
            <div className="card-minion relative overflow-hidden bg-white/90">
                {showHeader && (
                    <>
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-minion-yellow via-amber-400 to-minion-blue" aria-hidden />
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-minion-blue/10 rounded-2xl flex items-center justify-center text-2xl">🧭</div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-600">Live request board</p>
                                    <p className="text-lg font-bold text-gray-900">Today, {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>
                            <span className="rounded-full bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 w-fit">Online</span>
                        </div>
                    </>
                )}
                <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">No active requests at the moment</p>
                    <p className="text-gray-400 text-xs mt-1">New requests will appear here in real-time</p>
                </div>
            </div>
        );
    }

    return (
        <div className="card-minion relative overflow-hidden bg-white/90 cursor-pointer hover:shadow-xl transition-shadow" onClick={() => router.push('/dashboard/staff-requests')}>
            {showHeader && (
                <>
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-minion-yellow via-amber-400 to-minion-blue" aria-hidden />
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-minion-blue/10 rounded-2xl flex items-center justify-center text-2xl">🧭</div>
                            <div>
                                <p className="text-sm font-semibold text-gray-600">Live request board</p>
                                <p className="text-lg font-bold text-gray-900">Today, {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                        </div>
                        <span className="rounded-full bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 w-fit">Online</span>
                    </div>
                </>
            )}

            <div className="space-y-4">
                {requests.map((request) => {
                    const statusBadge = getStatusBadge(request.status);
                    return (
                        <div key={request.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-gray-100 bg-gray-50/80 px-4 py-3 hover:bg-gray-100/80 transition-colors">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                <span className="text-xl flex-shrink-0">{getServiceIcon(request.serviceType)}</span>
                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-gray-800 truncate">{request.serviceType}</p>
                                    <p className="text-xs text-gray-500">Room {request.room.roomNumber}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600 flex-shrink-0">
                                <span className="rounded-full bg-white px-2 py-1">ETA {calculateETA(request.createdAt, 15)}</span>
                                <span className={`rounded-full px-2 py-1 font-semibold ${statusBadge.className}`}>
                                    {statusBadge.text}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {requests.length >= maxItems && (
                <div className="mt-4 text-center">
                    <p className="text-xs text-gray-500">Click to view all requests</p>
                </div>
            )}
        </div>
    );
}
