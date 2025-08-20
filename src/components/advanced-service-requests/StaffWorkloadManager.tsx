"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface StaffMember {
    id: string;
    name: string;
    email: string;
    activeRequests: number;
    maxConcurrentRequests: number;
    isAvailable: boolean;
    currentWorkload: ServiceRequest[];
}

interface ServiceRequest {
    id: string;
    title: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'pending' | 'in_progress' | 'completed';
    requestedAt: string;
    room: {
        roomNumber: string;
    };
    service: {
        name: string;
        category: string;
    };
}

export default function StaffWorkloadManager() {
    const { data: session } = useSession();
    const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
    const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
    const [pendingRequests, setPendingRequests] = useState<ServiceRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
    const [bulkAction, setBulkAction] = useState<'assign' | 'reassign' | ''>('');

    useEffect(() => {
        if (session?.user) {
            fetchData();
        }
    }, [session]);

    const fetchData = async () => {
        try {
            setIsLoading(true);

            // Fetch staff workloads
            const staffResponse = await fetch('/api/staff/assignment');
            if (staffResponse.ok) {
                const staffData = await staffResponse.json();
                
                // Fetch detailed workload for each staff member
                const staffWithWorkload = await Promise.all(
                    staffData.availableStaff.map(async (staff: any) => {
                        const workloadResponse = await fetch(`/api/staff/service-requests?assignedTo=${staff.staffId}&status=in_progress`);
                        const workloadData = workloadResponse.ok ? await workloadResponse.json() : { serviceRequests: [] };
                        
                        return {
                            ...staff,
                            currentWorkload: workloadData.serviceRequests || []
                        };
                    })
                );
                
                setStaffMembers(staffWithWorkload);
            }

            // Fetch pending requests
            const pendingResponse = await fetch('/api/staff/service-requests?status=pending');
            if (pendingResponse.ok) {
                const pendingData = await pendingResponse.json();
                setPendingRequests(pendingData.serviceRequests || []);
            }

        } catch (error) {
            console.error('Error fetching workload data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBulkAssign = async () => {
        if (!selectedStaff || selectedRequests.length === 0) {
            alert('Please select staff and requests');
            return;
        }

        try {
            const response = await fetch('/api/staff/bulk-operations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requestIds: selectedRequests,
                    action: 'assign',
                    data: {
                        assignedStaffId: selectedStaff.id
                    }
                })
            });

            const result = await response.json();
            
            if (response.ok) {
                alert(`Successfully assigned ${result.summary.successful} requests`);
                setSelectedRequests([]);
                fetchData();
            } else {
                alert(`Error: ${result.error}`);
            }
        } catch (error) {
            console.error('Bulk assignment error:', error);
            alert('Network error occurred');
        }
    };

    const handleAutoAssign = async (requestId: string) => {
        try {
            const response = await fetch('/api/staff/assignment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requestId })
            });

            if (response.ok) {
                fetchData(); // Refresh data
            }
        } catch (error) {
            console.error('Auto assignment error:', error);
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

    const getWorkloadColor = (activeRequests: number, maxRequests: number) => {
        const percentage = (activeRequests / maxRequests) * 100;
        if (percentage >= 90) return 'bg-red-500';
        if (percentage >= 70) return 'bg-orange-500';
        if (percentage >= 50) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-minion-yellow"></div>
                <span className="ml-2">Loading workload data...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Staff Workload Manager</h2>
                <button
                    onClick={fetchData}
                    className="btn-minion flex items-center space-x-2"
                >
                    <span>🔄</span>
                    <span>Refresh</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Staff Workload Overview */}
                <div className="card-minion">
                    <h3 className="text-lg font-semibold mb-4">Staff Workload Overview</h3>
                    
                    <div className="space-y-4">
                        {staffMembers.map((staff) => (
                            <div
                                key={staff.id}
                                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                    selectedStaff?.id === staff.id 
                                        ? 'border-minion-yellow bg-yellow-50' 
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                                onClick={() => setSelectedStaff(staff)}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <h4 className="font-medium text-gray-800">{staff.name}</h4>
                                        <p className="text-sm text-gray-600">{staff.email}</p>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            staff.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {staff.isAvailable ? 'Available' : 'Busy'}
                                        </div>
                                        <span className="text-sm text-gray-500">
                                            {staff.activeRequests}/{staff.maxConcurrentRequests}
                                        </span>
                                    </div>
                                </div>

                                {/* Workload bar */}
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                        className={`h-2 rounded-full transition-all ${getWorkloadColor(staff.activeRequests, staff.maxConcurrentRequests)}`}
                                        style={{ width: `${(staff.activeRequests / staff.maxConcurrentRequests) * 100}%` }}
                                    ></div>
                                </div>

                                {/* Current requests summary */}
                                {staff.currentWorkload.length > 0 && (
                                    <div className="mt-2">
                                        <p className="text-xs text-gray-500 mb-1">Current requests:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {staff.currentWorkload.slice(0, 3).map((request) => (
                                                <span
                                                    key={request.id}
                                                    className={`px-2 py-1 rounded text-xs ${getPriorityColor(request.priority)}`}
                                                >
                                                    Room {request.room.roomNumber}
                                                </span>
                                            ))}
                                            {staff.currentWorkload.length > 3 && (
                                                <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
                                                    +{staff.currentWorkload.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pending Requests & Assignment */}
                <div className="card-minion">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Pending Requests ({pendingRequests.length})</h3>
                        {selectedRequests.length > 0 && (
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={handleBulkAssign}
                                    disabled={!selectedStaff}
                                    className="btn-minion text-sm disabled:opacity-50"
                                >
                                    Assign to {selectedStaff?.name || 'Staff'}
                                </button>
                                <button
                                    onClick={() => setSelectedRequests([])}
                                    className="text-sm text-gray-600 hover:text-gray-800"
                                >
                                    Clear
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {pendingRequests.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="text-4xl mb-2">✅</div>
                                <p className="text-gray-600">No pending requests</p>
                            </div>
                        ) : (
                            pendingRequests.map((request) => (
                                <div key={request.id} className="border rounded-lg p-3 hover:shadow-sm">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center space-x-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedRequests.includes(request.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedRequests([...selectedRequests, request.id]);
                                                    } else {
                                                        setSelectedRequests(selectedRequests.filter(id => id !== request.id));
                                                    }
                                                }}
                                                className="rounded border-gray-300 text-minion-yellow focus:ring-minion-yellow"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <h4 className="font-medium text-gray-800">{request.title}</h4>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                                                        {request.priority}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    <span>🏨 Room {request.room.roomNumber}</span>
                                                    <span className="ml-3">🛎️ {request.service.name}</span>
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {new Date(request.requestedAt).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleAutoAssign(request.id)}
                                            className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded transition-colors"
                                        >
                                            Auto Assign
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Selected Staff Details */}
            {selectedStaff && (
                <div className="card-minion">
                    <h3 className="text-lg font-semibold mb-4">
                        {selectedStaff.name}'s Current Workload
                    </h3>
                    
                    {selectedStaff.currentWorkload.length === 0 ? (
                        <div className="text-center py-6">
                            <div className="text-3xl mb-2">🆓</div>
                            <p className="text-gray-600">No active requests</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {selectedStaff.currentWorkload.map((request) => (
                                <div key={request.id} className="border rounded-lg p-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center space-x-2 mb-1">
                                                <h4 className="font-medium text-gray-800">{request.title}</h4>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                                                    {request.priority}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                <span>🏨 Room {request.room.roomNumber}</span>
                                                <span className="ml-3">🛎️ {request.service.name}</span>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Started: {new Date(request.requestedAt).toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="text-sm">
                                            <span className="px-2 py-1 rounded bg-blue-100 text-blue-800">
                                                {request.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
