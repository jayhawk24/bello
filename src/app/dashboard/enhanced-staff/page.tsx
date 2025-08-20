"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import StaffWorkloadManager from "@/components/advanced-service-requests/StaffWorkloadManager";
import ServiceAnalyticsDashboard from "@/components/advanced-service-requests/ServiceAnalyticsDashboard";

interface ServiceRequest {
    id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
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

type TabType = 'overview' | 'workload' | 'analytics' | 'requests';

export default function EnhancedStaffDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (status === "loading") return;
        
        if (!session?.user || !['hotel_staff', 'hotel_admin'].includes(session.user.role)) {
            router.push("/dashboard");
            return;
        }
        
        fetchData();
    }, [session, status, router]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            
            const response = await fetch('/api/staff/service-requests');
            if (response.ok) {
                const data = await response.json();
                setServiceRequests(data.serviceRequests || []);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
            case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'in_progress': return 'bg-blue-100 text-blue-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const updateRequestStatus = async (requestId: string, newStatus: string) => {
        try {
            const response = await fetch('/api/staff/service-requests', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    requestId, 
                    status: newStatus,
                    assignedStaffId: newStatus === 'in_progress' ? session?.user.id : undefined
                })
            });

            if (response.ok) {
                fetchData(); // Refresh the data
            }
        } catch (error) {
            console.error('Error updating request:', error);
        }
    };

    if (status === "loading" || isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center">
                <div className="card-minion text-center">
                    <div className="animate-bounce-slow mb-4">
                        <span className="text-4xl">🏨</span>
                    </div>
                    <p className="text-gray-600">Loading enhanced dashboard...</p>
                </div>
            </div>
        );
    }

    if (!session?.user || !['hotel_staff', 'hotel_admin'].includes(session.user.role)) {
        return null;
    }

    const pendingRequests = serviceRequests.filter(req => req.status === 'pending');
    const inProgressRequests = serviceRequests.filter(req => req.status === 'in_progress');
    const completedToday = serviceRequests.filter(req => 
        req.status === 'completed' && 
        new Date(req.requestedAt).toDateString() === new Date().toDateString()
    );

    const tabs = [
        { key: 'overview', label: 'Overview', icon: '📊' },
        { key: 'workload', label: 'Workload Manager', icon: '👥' },
        { key: 'analytics', label: 'Analytics', icon: '📈' },
        { key: 'requests', label: 'All Requests', icon: '📋' }
    ];

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
                                Enhanced Staff Dashboard
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">
                                Welcome back, {session.user.name}
                            </span>
                            <div className="w-8 h-8 bg-minion-yellow rounded-full flex items-center justify-center text-minion-dark font-semibold">
                                {session.user.name?.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tab Navigation */}
                <div className="mb-8">
                    <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key as TabType)}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    activeTab === tab.key
                                        ? 'bg-minion-yellow text-minion-dark shadow-sm'
                                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                                }`}
                            >
                                <span>{tab.icon}</span>
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="card-minion text-center">
                                <div className="text-3xl mb-2">⏳</div>
                                <div className="text-2xl font-bold text-minion-blue">{pendingRequests.length}</div>
                                <div className="text-gray-600">Pending Requests</div>
                            </div>
                            <div className="card-minion text-center">
                                <div className="text-3xl mb-2">🔄</div>
                                <div className="text-2xl font-bold text-minion-blue">{inProgressRequests.length}</div>
                                <div className="text-gray-600">In Progress</div>
                            </div>
                            <div className="card-minion text-center">
                                <div className="text-3xl mb-2">✅</div>
                                <div className="text-2xl font-bold text-minion-blue">{completedToday.length}</div>
                                <div className="text-gray-600">Completed Today</div>
                            </div>
                            <div className="card-minion text-center">
                                <div className="text-3xl mb-2">📊</div>
                                <div className="text-2xl font-bold text-minion-blue">{serviceRequests.length}</div>
                                <div className="text-gray-600">Total Requests</div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="card-minion">
                            <h3 className="text-lg font-semibold mb-4">Recent Service Requests</h3>
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {serviceRequests.slice(0, 10).map((request) => (
                                    <div key={request.id} className="border rounded-lg p-3 hover:shadow-sm">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <h4 className="font-semibold text-gray-800">{request.title}</h4>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                                                        {request.priority}
                                                    </span>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                                        {request.status.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                    <span>🏨 Room {request.room.roomNumber}</span>
                                                    <span>👤 {request.guest.name}</span>
                                                    <span>🕐 {new Date(request.requestedAt).toLocaleString()}</span>
                                                </div>
                                                <div className="mt-2 text-sm text-gray-600">
                                                    <span className="font-medium">Service:</span> {request.service.name} ({request.service.category})
                                                </div>
                                            </div>
                                            <div className="flex flex-col space-y-2 ml-4">
                                                {request.status === 'pending' && (
                                                    <button
                                                        onClick={() => updateRequestStatus(request.id, 'in_progress')}
                                                        className="btn-minion text-sm px-3 py-1"
                                                    >
                                                        Start Work
                                                    </button>
                                                )}
                                                {request.status === 'in_progress' && (
                                                    <button
                                                        onClick={() => updateRequestStatus(request.id, 'completed')}
                                                        className="bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1 rounded transition-colors"
                                                    >
                                                        Mark Complete
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'workload' && <StaffWorkloadManager />}
                
                {activeTab === 'analytics' && <ServiceAnalyticsDashboard />}

                {activeTab === 'requests' && (
                    <div className="card-minion">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold">All Service Requests</h3>
                            <Link href="/dashboard/staff-requests" className="btn-minion text-sm">
                                View Legacy Dashboard
                            </Link>
                        </div>
                        
                        <div className="space-y-4 max-h-[600px] overflow-y-auto">
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
                                                        className="btn-minion text-sm px-3 py-1"
                                                    >
                                                        Start Work
                                                    </button>
                                                )}
                                                {request.status === 'in_progress' && (
                                                    <button
                                                        onClick={() => updateRequestStatus(request.id, 'completed')}
                                                        className="bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1 rounded transition-colors"
                                                    >
                                                        Mark Complete
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
