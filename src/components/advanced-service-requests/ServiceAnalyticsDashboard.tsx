"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface ServiceMetrics {
    totalRequests: number;
    avgResponseTime: number; // in minutes
    avgCompletionTime: number; // in minutes
    completionRate: number; // percentage
    guestSatisfaction: number; // average rating 1-5
    requestsByPriority: {
        urgent: number;
        high: number;
        medium: number;
        low: number;
    };
    requestsByStatus: {
        pending: number;
        in_progress: number;
        completed: number;
        cancelled: number;
    };
    requestsByCategory: Array<{
        category: string;
        count: number;
        avgCompletionTime: number;
    }>;
    staffPerformance: Array<{
        staffId: string;
        staffName: string;
        completedRequests: number;
        avgCompletionTime: number;
        guestRating: number;
        currentWorkload: number;
    }>;
    hourlyDistribution: Array<{
        hour: number;
        count: number;
    }>;
    trends: {
        dailyRequests: Array<{
            date: string;
            count: number;
            completed: number;
        }>;
    };
}

interface DateRange {
    start: string;
    end: string;
}

export default function ServiceAnalyticsDashboard() {
    const { data: session } = useSession();
    const [metrics, setMetrics] = useState<ServiceMetrics | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [dateRange, setDateRange] = useState<DateRange>({
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
        end: new Date().toISOString().split('T')[0] // today
    });
    const [selectedMetric, setSelectedMetric] = useState<'requests' | 'performance' | 'satisfaction'>('requests');

    useEffect(() => {
        if (session?.user) {
            fetchAnalytics();
        }
    }, [session, dateRange]);

    const fetchAnalytics = async () => {
        try {
            setIsLoading(true);
            
            // For now, we'll simulate the analytics data since we haven't built the backend yet
            // In a real implementation, this would call /api/analytics/service-requests
            
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Mock data for demonstration
            const mockMetrics: ServiceMetrics = {
                totalRequests: 147,
                avgResponseTime: 8.5,
                avgCompletionTime: 45.2,
                completionRate: 94.5,
                guestSatisfaction: 4.3,
                requestsByPriority: {
                    urgent: 12,
                    high: 34,
                    medium: 78,
                    low: 23
                },
                requestsByStatus: {
                    pending: 8,
                    in_progress: 15,
                    completed: 119,
                    cancelled: 5
                },
                requestsByCategory: [
                    { category: 'room_service', count: 45, avgCompletionTime: 35.5 },
                    { category: 'housekeeping', count: 38, avgCompletionTime: 52.3 },
                    { category: 'concierge', count: 28, avgCompletionTime: 25.8 },
                    { category: 'maintenance', count: 18, avgCompletionTime: 85.2 },
                    { category: 'laundry', count: 12, avgCompletionTime: 120.5 },
                    { category: 'transportation', count: 6, avgCompletionTime: 15.0 }
                ],
                staffPerformance: [
                    { staffId: '1', staffName: 'Alice Johnson', completedRequests: 28, avgCompletionTime: 42.5, guestRating: 4.8, currentWorkload: 3 },
                    { staffId: '2', staffName: 'Bob Smith', completedRequests: 31, avgCompletionTime: 38.2, guestRating: 4.6, currentWorkload: 2 },
                    { staffId: '3', staffName: 'Carol Davis', completedRequests: 25, avgCompletionTime: 48.1, guestRating: 4.2, currentWorkload: 4 },
                    { staffId: '4', staffName: 'David Wilson', completedRequests: 35, avgCompletionTime: 51.8, guestRating: 4.4, currentWorkload: 1 }
                ],
                hourlyDistribution: Array.from({ length: 24 }, (_, i) => ({
                    hour: i,
                    count: Math.floor(Math.random() * 15) + 1
                })),
                trends: {
                    dailyRequests: Array.from({ length: 7 }, (_, i) => {
                        const date = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000);
                        const count = Math.floor(Math.random() * 30) + 10;
                        return {
                            date: date.toISOString().split('T')[0],
                            count: count,
                            completed: Math.floor(count * 0.9)
                        };
                    })
                }
            };
            
            setMetrics(mockMetrics);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (minutes: number): string => {
        if (minutes < 60) {
            return `${Math.round(minutes)}m`;
        }
        const hours = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        return `${hours}h ${mins}m`;
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'bg-red-500';
            case 'high': return 'bg-orange-500';
            case 'medium': return 'bg-yellow-500';
            case 'low': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-500';
            case 'in_progress': return 'bg-blue-500';
            case 'pending': return 'bg-yellow-500';
            case 'cancelled': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-minion-yellow"></div>
                <span className="ml-2">Loading analytics...</span>
            </div>
        );
    }

    if (!metrics) {
        return (
            <div className="text-center py-12">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No analytics data available</h3>
                <p className="text-gray-600">Analytics will appear once you have service requests.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Service Request Analytics</h2>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-sm">
                        <label>From:</label>
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                            className="border border-gray-300 rounded px-2 py-1"
                        />
                        <label>To:</label>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                            className="border border-gray-300 rounded px-2 py-1"
                        />
                    </div>
                    <button
                        onClick={fetchAnalytics}
                        className="btn-minion text-sm"
                    >
                        🔄 Refresh
                    </button>
                </div>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="card-minion text-center">
                    <div className="text-3xl mb-2">📈</div>
                    <div className="text-2xl font-bold text-minion-blue">{metrics.totalRequests}</div>
                    <div className="text-gray-600 text-sm">Total Requests</div>
                </div>
                
                <div className="card-minion text-center">
                    <div className="text-3xl mb-2">⚡</div>
                    <div className="text-2xl font-bold text-minion-blue">{formatTime(metrics.avgResponseTime)}</div>
                    <div className="text-gray-600 text-sm">Avg Response Time</div>
                </div>
                
                <div className="card-minion text-center">
                    <div className="text-3xl mb-2">⏱️</div>
                    <div className="text-2xl font-bold text-minion-blue">{formatTime(metrics.avgCompletionTime)}</div>
                    <div className="text-gray-600 text-sm">Avg Completion Time</div>
                </div>
                
                <div className="card-minion text-center">
                    <div className="text-3xl mb-2">✅</div>
                    <div className="text-2xl font-bold text-minion-blue">{metrics.completionRate.toFixed(1)}%</div>
                    <div className="text-gray-600 text-sm">Completion Rate</div>
                </div>
                
                <div className="card-minion text-center">
                    <div className="text-3xl mb-2">⭐</div>
                    <div className="text-2xl font-bold text-minion-blue">{metrics.guestSatisfaction.toFixed(1)}/5</div>
                    <div className="text-gray-600 text-sm">Guest Satisfaction</div>
                </div>
            </div>

            {/* Metric Selector */}
            <div className="card-minion">
                <div className="flex space-x-4 mb-6">
                    {[
                        { key: 'requests', label: 'Request Distribution', icon: '📊' },
                        { key: 'performance', label: 'Staff Performance', icon: '👥' },
                        { key: 'satisfaction', label: 'Service Categories', icon: '🛎️' }
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setSelectedMetric(tab.key as any)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                                selectedMetric === tab.key
                                    ? 'bg-minion-yellow text-minion-dark'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            }`}
                        >
                            <span>{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Request Distribution */}
                {selectedMetric === 'requests' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Priority Distribution */}
                        <div>
                            <h4 className="text-lg font-semibold mb-4">Requests by Priority</h4>
                            <div className="space-y-3">
                                {Object.entries(metrics.requestsByPriority).map(([priority, count]) => (
                                    <div key={priority} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-4 h-4 rounded ${getPriorityColor(priority)}`}></div>
                                            <span className="capitalize font-medium">{priority}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-32 bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className={`h-2 rounded-full ${getPriorityColor(priority)}`}
                                                    style={{ width: `${(count / metrics.totalRequests) * 100}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-medium w-8">{count}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Status Distribution */}
                        <div>
                            <h4 className="text-lg font-semibold mb-4">Requests by Status</h4>
                            <div className="space-y-3">
                                {Object.entries(metrics.requestsByStatus).map(([status, count]) => (
                                    <div key={status} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-4 h-4 rounded ${getStatusColor(status)}`}></div>
                                            <span className="capitalize font-medium">{status.replace('_', ' ')}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-32 bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className={`h-2 rounded-full ${getStatusColor(status)}`}
                                                    style={{ width: `${(count / metrics.totalRequests) * 100}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-medium w-8">{count}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Staff Performance */}
                {selectedMetric === 'performance' && (
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Staff Performance Overview</h4>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2">Staff Member</th>
                                        <th className="text-center py-2">Completed</th>
                                        <th className="text-center py-2">Avg Time</th>
                                        <th className="text-center py-2">Rating</th>
                                        <th className="text-center py-2">Current Load</th>
                                        <th className="text-center py-2">Performance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {metrics.staffPerformance
                                        .sort((a, b) => b.completedRequests - a.completedRequests)
                                        .map((staff) => {
                                            const performanceScore = (staff.guestRating / 5) * 100;
                                            return (
                                                <tr key={staff.staffId} className="border-b hover:bg-gray-50">
                                                    <td className="py-3">
                                                        <div className="font-medium">{staff.staffName}</div>
                                                    </td>
                                                    <td className="text-center py-3">
                                                        <span className="font-semibold">{staff.completedRequests}</span>
                                                    </td>
                                                    <td className="text-center py-3">
                                                        {formatTime(staff.avgCompletionTime)}
                                                    </td>
                                                    <td className="text-center py-3">
                                                        <div className="flex items-center justify-center space-x-1">
                                                            <span>{staff.guestRating.toFixed(1)}</span>
                                                            <span className="text-yellow-500">⭐</span>
                                                        </div>
                                                    </td>
                                                    <td className="text-center py-3">
                                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                                            staff.currentWorkload <= 2 ? 'bg-green-100 text-green-800' :
                                                            staff.currentWorkload <= 4 ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                        }`}>
                                                            {staff.currentWorkload}
                                                        </span>
                                                    </td>
                                                    <td className="text-center py-3">
                                                        <div className="w-16 bg-gray-200 rounded-full h-2 mx-auto">
                                                            <div 
                                                                className={`h-2 rounded-full ${
                                                                    performanceScore >= 90 ? 'bg-green-500' :
                                                                    performanceScore >= 80 ? 'bg-yellow-500' :
                                                                    'bg-red-500'
                                                                }`}
                                                                style={{ width: `${performanceScore}%` }}
                                                            ></div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Service Categories */}
                {selectedMetric === 'satisfaction' && (
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Service Category Performance</h4>
                        <div className="space-y-4">
                            {metrics.requestsByCategory
                                .sort((a, b) => b.count - a.count)
                                .map((category) => (
                                    <div key={category.category} className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center space-x-3">
                                                <span className="text-2xl">
                                                    {category.category === 'room_service' ? '🍽️' :
                                                     category.category === 'housekeeping' ? '🧹' :
                                                     category.category === 'concierge' ? '🛎️' :
                                                     category.category === 'maintenance' ? '🔧' :
                                                     category.category === 'laundry' ? '👕' :
                                                     category.category === 'transportation' ? '🚗' : '🔹'}
                                                </span>
                                                <div>
                                                    <h5 className="font-medium capitalize">
                                                        {category.category.replace('_', ' ')}
                                                    </h5>
                                                    <p className="text-sm text-gray-600">
                                                        {category.count} requests • Avg: {formatTime(category.avgCompletionTime)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-semibold">{category.count}</div>
                                                <div className="text-sm text-gray-500">
                                                    {((category.count / metrics.totalRequests) * 100).toFixed(1)}%
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="h-2 rounded-full bg-minion-yellow"
                                                style={{ width: `${(category.count / metrics.totalRequests) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Daily Trends */}
            <div className="card-minion">
                <h3 className="text-lg font-semibold mb-4">Daily Request Trends</h3>
                <div className="flex items-end space-x-2 h-32">
                    {metrics.trends.dailyRequests.map((day, index) => (
                        <div key={day.date} className="flex-1 flex flex-col items-center">
                            <div className="flex flex-col items-center space-y-1 mb-2">
                                <div 
                                    className="bg-minion-yellow rounded-t w-full"
                                    style={{ height: `${(day.count / Math.max(...metrics.trends.dailyRequests.map(d => d.count))) * 80}px` }}
                                ></div>
                                <div 
                                    className="bg-green-500 rounded-b w-full"
                                    style={{ height: `${(day.completed / Math.max(...metrics.trends.dailyRequests.map(d => d.count))) * 80}px` }}
                                ></div>
                            </div>
                            <div className="text-xs text-center">
                                <div className="font-medium">{day.count}</div>
                                <div className="text-gray-500">
                                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex items-center justify-center mt-4 space-x-6 text-sm">
                    <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-minion-yellow rounded"></div>
                        <span>Total Requests</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                        <span>Completed</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
