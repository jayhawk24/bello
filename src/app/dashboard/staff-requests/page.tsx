"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import NotificationBell from "@/components/NotificationBell";
import DashboardNav from "@/components/DashboardNav";
import {
    useStaffServiceRequests,
    useUpdateServiceRequest,
    useDeleteServiceRequest
} from "@/hooks/useServiceRequests";
import { useRooms } from "@/hooks/useRooms";

export default function StaffDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const [selectedPriority, setSelectedPriority] = useState<string>('');

    // Use React Query hooks
    const {
        data: serviceRequestsData,
        isLoading: requestsLoading,
        error: requestsError
    } = useStaffServiceRequests({
        status: selectedStatus || undefined,
        priority: selectedPriority || undefined
    });

    const {
        data: roomsData,
        isLoading: roomsLoading
    } = useRooms();

    const updateRequestMutation = useUpdateServiceRequest();
    const deleteRequestMutation = useDeleteServiceRequest();

    const isLoading = requestsLoading || roomsLoading;
    const rooms = roomsData?.rooms || [];
    const serviceRequests = serviceRequestsData?.serviceRequests || [];

    // Simple delete room requests function (for now just show alert)
    const deleteRoomRequests = (roomNumber: string) => {
        alert(`Delete all service requests for Room ${roomNumber} - This feature needs to be implemented`);
    };

    useEffect(() => {
        if (status === "loading") return;

        if (!session?.user || !['hotel_staff', 'hotel_admin'].includes(session.user.role)) {
            router.push("/dashboard");
            return;
        }
    }, [session, status, router]);

    const updateRequestStatus = (requestId: string, newStatus: string) => {
        updateRequestMutation.mutate({
            requestId,
            status: newStatus as 'pending' | 'in_progress' | 'completed',
            assignedStaffId: newStatus === 'in_progress' ? session?.user.id : undefined
        });
    };

    const deleteServiceRequest = (requestId: string) => {
        if (confirm('Are you sure you want to delete this request?')) {
            deleteRequestMutation.mutate(requestId);
        }
    };

    if (status === "loading" || isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center">
                <div className="card-minion text-center">
                    <div className="animate-bounce-slow mb-4">
                        <span className="text-4xl">🏨</span>
                    </div>
                    <p className="text-gray-600">Loading staff dashboard...</p>
                </div>
            </div>
        );
    }

    if (!session?.user || !['hotel_staff', 'hotel_admin'].includes(session.user.role)) {
        return null;
    }

    const pendingRequests = serviceRequests.filter(req => req.status === 'pending');
    const inProgressRequests = serviceRequests.filter(req => req.status === 'in_progress');
    const completedRequests = serviceRequests.filter(req => req.status === 'completed');

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'text-red-600 bg-red-100';
            case 'medium': return 'text-yellow-600 bg-yellow-100';
            case 'low': return 'text-green-600 bg-green-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'text-orange-600 bg-orange-100';
            case 'in_progress': return 'text-blue-600 bg-blue-100';
            case 'completed': return 'text-green-600 bg-green-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100">
            <DashboardNav title="Staff Dashboard" showNotifications={true} />

            <main className="max-w-7xl mx-auto px-6 py-8">{/* Navigation removed, now using component */}
                {/* Stats Cards */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <div className="card-minion text-center">
                        <div className="text-3xl mb-2">📋</div>
                        <div className="text-2xl font-bold text-orange-600">{pendingRequests.length}</div>
                        <div className="text-gray-600">Pending Requests</div>
                    </div>
                    <div className="card-minion text-center">
                        <div className="text-3xl mb-2">🔄</div>
                        <div className="text-2xl font-bold text-blue-600">{inProgressRequests.length}</div>
                        <div className="text-gray-600">In Progress</div>
                    </div>
                    <div className="card-minion text-center">
                        <div className="text-3xl mb-2">✅</div>
                        <div className="text-2xl font-bold text-green-600">{completedRequests.length}</div>
                        <div className="text-gray-600">Completed Today</div>
                    </div>
                    <div className="card-minion text-center">
                        <div className="text-3xl mb-2">🛏️</div>
                        <div className="text-2xl font-bold text-minion-blue">{rooms.length}</div>
                        <div className="text-gray-600">Total Rooms</div>
                    </div>
                </div>

                {/* Service Requests Section */}
                <div className="card-minion mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Service Requests</h2>
                        <div className="flex space-x-4">
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-minion-yellow"
                            >
                                <option value="">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                            </select>
                            <select
                                value={selectedPriority}
                                onChange={(e) => setSelectedPriority(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-minion-yellow"
                            >
                                <option value="">All Priority</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {serviceRequests.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="text-4xl mb-4">📝</div>
                                <p className="text-gray-600">No service requests found</p>
                            </div>
                        ) : (
                            serviceRequests.map((request) => (
                                <div key={request.id} className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <h3 className="font-semibold text-gray-800">{request.type}</h3>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                                                    {request.priority}
                                                </span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                                    {request.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 mb-2">{request.description}</p>
                                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                <span>🏨 Room {request.room?.roomNumber}</span>
                                                <span>👤 {request.guest?.name}</span>
                                                <span>📱 {request.guest?.phone || 'N/A'}</span>
                                                <span>🕐 {new Date(request.requestedAt).toLocaleString()}</span>
                                            </div>
                                            <div className="mt-2 text-sm text-gray-600">
                                                <span className="font-medium">Description:</span> {request.description}
                                            </div>
                                            {request.assignedStaff && (
                                                <div className="mt-1 text-sm text-blue-600">
                                                    <span className="font-medium">Assigned to:</span> {request.assignedStaff.name}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col space-y-2 ml-4">
                                            {request.status === 'pending' && (
                                                <button
                                                    onClick={() => updateRequestStatus(request.id, 'in_progress')}
                                                    disabled={updateRequestMutation.isPending}
                                                    className="btn-minion text-sm px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {updateRequestMutation.isPending ? '⏳ Starting...' : '▶️ Start Work'}
                                                </button>
                                            )}
                                            {request.status === 'in_progress' && (
                                                <button
                                                    onClick={() => updateRequestStatus(request.id, 'completed')}
                                                    disabled={updateRequestMutation.isPending}
                                                    className="btn-minion-success text-sm px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {updateRequestMutation.isPending ? '⏳ Completing...' : '✅ Mark Complete'}
                                                </button>
                                            )}
                                            {request.status === 'completed' && (
                                                <div className="text-sm text-green-600 font-medium px-3 py-1">
                                                    ✅ Completed
                                                </div>
                                            )}
                                            {/* Admin-only delete button */}
                                            {session?.user.role === 'hotel_admin' && (
                                                <button
                                                    onClick={() => deleteServiceRequest(request.id)}
                                                    disabled={deleteRequestMutation.isPending}
                                                    className="btn-minion-danger text-sm px-3 py-1"
                                                    title="Delete this service request"
                                                >
                                                    {deleteRequestMutation.isPending ? '⏳ Deleting...' : '🗑️ Delete'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Room Management Section */}
                <div className="card-minion">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Room Management</h2>
                        <Link href="/dashboard/rooms" className="btn-minion">
                            Manage All Rooms
                        </Link>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {rooms.slice(0, 8).map((room) => (
                            <div key={room.id} className="border rounded-lg p-4 bg-white">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold text-gray-800">Room {room.roomNumber}</h3>
                                    <span className={`w-3 h-3 rounded-full ${room.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                </div>
                                <p className="text-gray-600 text-sm mb-2">{room.roomType}</p>
                                <p className="text-xs text-gray-500">Status: {room.status || 'Available'}</p>
                                <Link
                                    href={`/dashboard/rooms/${room.id}`}
                                    className="btn-minion-secondary w-full text-sm mt-3 block text-center"
                                >
                                    View Details
                                </Link>
                                {/* Admin-only: Delete all requests for this room */}
                                {session?.user.role === 'hotel_admin' && (
                                    <button
                                        onClick={() => deleteRoomRequests(room.roomNumber)}
                                        className="btn-minion-danger text-xs px-2 py-1 w-full mt-2"
                                        title={`Delete all service requests for Room ${room.roomNumber}`}
                                    >
                                        🗑️ Clear Requests
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {rooms.length > 8 && (
                        <div className="text-center mt-6">
                            <Link href="/dashboard/rooms" className="text-minion-blue hover:underline">
                                View all {rooms.length} rooms
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
