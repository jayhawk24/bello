"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface ServiceRequest {
    id: string;
    title: string;
    description: string | null;
    priority: string;
    status: string;
    serviceId: string;
    requestedAt: string;
    startedAt: string | null;
    completedAt: string | null;
    assignedStaff: {
        id: string;
        name: string;
    } | null;
}

export default function GuestRequestsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const bookingId = searchParams.get('bookingId');
    
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!bookingId) {
            router.push('/guest');
            return;
        }
        
        fetchRequests();
    }, [bookingId, router]);

    const fetchRequests = async () => {
        try {
            const response = await fetch(`/api/guest/service-requests?bookingId=${bookingId}`);
            const result = await response.json();

            if (response.ok) {
                setRequests(result.serviceRequests);
            } else {
                setError(result.error || 'Failed to load service requests');
            }
        } catch (error) {
            setError('Network error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'in_progress': return 'bg-blue-100 text-blue-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'bg-red-100 text-red-800';
            case 'high': return 'bg-orange-100 text-orange-800';
            case 'medium': return 'bg-blue-100 text-blue-800';
            case 'low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center">
                <div className="card-minion text-center">
                    <div className="animate-bounce-slow mb-4">
                        <span className="text-4xl">📋</span>
                    </div>
                    <p className="text-gray-600">Loading your requests...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-minion-yellow rounded-full flex items-center justify-center">
                                <span className="text-2xl">📋</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">Service Requests</h1>
                                <p className="text-gray-600">Your request history</p>
                            </div>
                        </div>
                        <Link 
                            href={`/guest/dashboard?bookingId=${bookingId}`}
                            className="text-minion-blue hover:underline"
                        >
                            ← Back to Dashboard
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-8">
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {requests.length === 0 ? (
                    <div className="card-minion text-center">
                        <div className="text-6xl mb-4">📝</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">No Service Requests</h2>
                        <p className="text-gray-600 mb-6">
                            You haven't made any service requests yet.
                        </p>
                        <Link 
                            href={`/guest/services?bookingId=${bookingId}`}
                            className="btn-minion"
                        >
                            Request a Service
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-800">
                                All Requests ({requests.length})
                            </h2>
                            <Link 
                                href={`/guest/services?bookingId=${bookingId}`}
                                className="btn-minion-secondary"
                            >
                                + New Request
                            </Link>
                        </div>

                        <div className="grid gap-6">
                            {requests.map((request) => (
                                <div key={request.id} className="card-minion">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                                {request.title}
                                            </h3>
                                            {request.description && (
                                                <p className="text-gray-600 mb-3">{request.description}</p>
                                            )}
                                        </div>
                                        <div className="flex space-x-2 ml-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                                {request.status.replace('_', ' ').toUpperCase()}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                                                {request.priority.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                                        <div>
                                            <p><strong>Requested:</strong> {new Date(request.requestedAt).toLocaleString()}</p>
                                            {request.startedAt && (
                                                <p><strong>Started:</strong> {new Date(request.startedAt).toLocaleString()}</p>
                                            )}
                                            {request.completedAt && (
                                                <p><strong>Completed:</strong> {new Date(request.completedAt).toLocaleString()}</p>
                                            )}
                                        </div>
                                        <div>
                                            {request.assignedStaff ? (
                                                <p><strong>Assigned to:</strong> {request.assignedStaff.name}</p>
                                            ) : (
                                                <p><strong>Status:</strong> Waiting for assignment</p>
                                            )}
                                            <p><strong>Service ID:</strong> {request.serviceId}</p>
                                        </div>
                                    </div>

                                    {request.status === 'completed' && (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">How was our service?</span>
                                                <div className="flex space-x-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button
                                                            key={star}
                                                            className="text-yellow-400 hover:text-yellow-500 text-lg"
                                                        >
                                                            ⭐
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
