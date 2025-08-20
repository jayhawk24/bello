"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import NotificationBell from "@/components/NotificationBell";

interface ServiceRequest {
    id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    status: 'pending' | 'in_progress' | 'completed';
    requestedAt: string;
    guest: {
        id: string;
        name: string;
        email: string;
        phone?: string;
    };
    room: {
        id: string;
        roomNumber: string;
        roomType: string;
    };
    service: {
        id: string;
        name: string;
        category: string;
        description: string;
    };
    assignedStaff?: {
        id: string;
        name: string;
    };
}

interface Room {
    id: string;
    roomNumber: string;
    roomType: string;
    status: string;
    isActive: boolean;
}

export default function StaffDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const [selectedPriority, setSelectedPriority] = useState<string>('');
    const [updatingRequests, setUpdatingRequests] = useState<Set<string>>(new Set());
    const [deletingRequests, setDeletingRequests] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (status === "loading") return;
        
        if (!session?.user || !['hotel_staff', 'hotel_admin'].includes(session.user.role)) {
            router.push("/dashboard");
            return;
        }
        
        fetchData();
    }, [session, status, router, selectedStatus, selectedPriority]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            
            // Fetch service requests
            const params = new URLSearchParams();
            if (selectedStatus) params.append('status', selectedStatus);
            if (selectedPriority) params.append('priority', selectedPriority);
            
            const requestsResponse = await fetch(`/api/staff/service-requests?${params.toString()}`);
            if (requestsResponse.ok) {
                const requestsData = await requestsResponse.json();
                setServiceRequests(requestsData.serviceRequests);
            }
            
            // Fetch rooms
            const roomsResponse = await fetch('/api/rooms');
            if (roomsResponse.ok) {
                const roomsData = await roomsResponse.json();
                setRooms(roomsData.rooms || []);
            }
            
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateRequestStatus = async (requestId: string, newStatus: string) => {
        try {
            // Add request to updating set
            setUpdatingRequests(prev => new Set(prev.add(requestId)));

            // Find the current request to update optimistically
            const requestToUpdate = serviceRequests.find(req => req.id === requestId);
            if (!requestToUpdate) return;

            // Optimistically update the UI state first
            setServiceRequests(prevRequests => 
                prevRequests.map(request => 
                    request.id === requestId 
                        ? { 
                            ...request, 
                            status: newStatus as 'pending' | 'in_progress' | 'completed',
                            assignedStaff: newStatus === 'in_progress' ? {
                                id: session?.user.id || '',
                                name: session?.user.name || ''
                            } : request.assignedStaff
                        }
                        : request
                )
            );

            const response = await fetch('/api/staff/service-requests', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    requestId, 
                    status: newStatus,
                    assignedStaffId: newStatus === 'in_progress' ? session?.user.id : undefined
                })
            });

            if (!response.ok) {
                // Revert the optimistic update if the request failed
                setServiceRequests(prevRequests => 
                    prevRequests.map(request => 
                        request.id === requestId ? requestToUpdate : request
                    )
                );
                console.error('Failed to update request status');
            }
        } catch (error) {
            console.error('Error updating request:', error);
            // Revert the optimistic update on error
            setServiceRequests(prevRequests => 
                prevRequests.map(request => 
                    request.id === requestId ? serviceRequests.find(r => r.id === requestId) || request : request
                )
            );
        } finally {
            // Remove request from updating set
            setUpdatingRequests(prev => {
                const newSet = new Set(prev);
                newSet.delete(requestId);
                return newSet;
            });
        }
    };

    const deleteServiceRequest = async (requestId: string) => {
        if (!confirm('Are you sure you want to delete this service request? This action cannot be undone.')) {
            return;
        }

        try {
            // Add request to deleting set
            setDeletingRequests(prev => new Set(prev.add(requestId)));

            const response = await fetch(`/api/staff/service-requests?requestId=${requestId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                // Remove the request from the UI
                setServiceRequests(prevRequests => 
                    prevRequests.filter(request => request.id !== requestId)
                );
            } else {
                const errorData = await response.json();
                console.error('Failed to delete request:', errorData.error);
                alert('Failed to delete the service request. Please try again.');
            }
        } catch (error) {
            console.error('Error deleting request:', error);
            alert('Failed to delete the service request. Please try again.');
        } finally {
            // Remove request from deleting set
            setDeletingRequests(prev => {
                const newSet = new Set(prev);
                newSet.delete(requestId);
                return newSet;
            });
        }
    };

    const deleteRoomRequests = async (roomNumber: string) => {
        if (!confirm(`Are you sure you want to delete ALL service requests for Room ${roomNumber}? This action cannot be undone.`)) {
            return;
        }

        try {
            // Find the room ID
            const room = rooms.find(r => r.roomNumber === roomNumber);
            if (!room) {
                alert('Room not found');
                return;
            }

            const response = await fetch(`/api/staff/service-requests?roomId=${room.id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                const result = await response.json();
                // Remove all requests for this room from the UI
                setServiceRequests(prevRequests => 
                    prevRequests.filter(request => request.room.id !== room.id)
                );
                alert(result.message);
            } else {
                const errorData = await response.json();
                console.error('Failed to delete room requests:', errorData.error);
                alert('Failed to delete room requests. Please try again.');
            }
        } catch (error) {
            console.error('Error deleting room requests:', error);
            alert('Failed to delete room requests. Please try again.');
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
            {/* Navigation */}
            <nav className="nav-minion px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-minion-yellow rounded-full flex items-center justify-center">
                            <span className="text-2xl">🏨</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">Staff Dashboard</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <NotificationBell />
                        <span className="text-gray-600">Welcome, {session.user.name}</span>
                        <Link href="/dashboard" className="btn-minion-secondary">
                            Main Dashboard
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-8">
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
                                                <h3 className="font-semibold text-gray-800">{request.title}</h3>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                                                    {request.priority}
                                                </span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                                    {request.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 mb-2">{request.description}</p>
                                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                <span>🏨 Room {request.room.roomNumber}</span>
                                                <span>👤 {request.guest.name}</span>
                                                <span>📱 {request.guest.phone}</span>
                                                <span>🕐 {new Date(request.requestedAt).toLocaleString()}</span>
                                            </div>
                                            <div className="mt-2 text-sm text-gray-600">
                                                <span className="font-medium">Service:</span> {request.service.name} ({request.service.category})
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
                                                    disabled={updatingRequests.has(request.id)}
                                                    className="btn-minion text-sm px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {updatingRequests.has(request.id) ? '⏳ Starting...' : '▶️ Start Work'}
                                                </button>
                                            )}
                                            {request.status === 'in_progress' && (
                                                <button
                                                    onClick={() => updateRequestStatus(request.id, 'completed')}
                                                    disabled={updatingRequests.has(request.id)}
                                                    className="btn-minion-success text-sm px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {updatingRequests.has(request.id) ? '⏳ Completing...' : '✅ Mark Complete'}
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
                                                    disabled={deletingRequests.has(request.id)}
                                                    className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Delete this service request"
                                                >
                                                    {deletingRequests.has(request.id) ? '⏳ Deleting...' : '🗑️ Delete'}
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
                                        className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded mt-2 w-full transition-colors"
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
