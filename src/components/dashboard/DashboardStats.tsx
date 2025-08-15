import React from 'react';
import { DashboardStats as StatsType } from '@/types';

interface DashboardStatsProps {
    stats: StatsType;
    loading?: boolean;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, loading = false }) => {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="animate-pulse">
                            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                            <div className="h-8 bg-gray-300 rounded w-1/2"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    const statItems = [
        {
            label: 'Total Rooms',
            value: stats.totalRooms,
            icon: '🏨',
            color: 'bg-blue-500'
        },
        {
            label: 'Occupied Rooms',
            value: stats.occupiedRooms,
            icon: '🔑',
            color: 'bg-green-500'
        },
        {
            label: 'Available Rooms',
            value: stats.availableRooms,
            icon: '🛏️',
            color: 'bg-yellow-500'
        },
        {
            label: 'Occupancy Rate',
            value: `${stats.occupancyRate}%`,
            icon: '📊',
            color: 'bg-purple-500'
        },
        {
            label: 'Total Staff',
            value: stats.totalStaff,
            icon: '👥',
            color: 'bg-indigo-500'
        },
        {
            label: 'Active Requests',
            value: stats.activeRequests,
            icon: '🔔',
            color: 'bg-red-500'
        },
        {
            label: 'Completed Requests',
            value: stats.completedRequests,
            icon: '✅',
            color: 'bg-green-600'
        },
        {
            label: 'Guest Satisfaction',
            value: `${stats.guestSatisfaction}%`,
            icon: '⭐',
            color: 'bg-yellow-600'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statItems.map((item, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">
                                {item.label}
                            </p>
                            <p className="text-3xl font-bold text-gray-900">
                                {item.value}
                            </p>
                        </div>
                        <div className={`${item.color} text-white p-3 rounded-lg text-2xl`}>
                            {item.icon}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
