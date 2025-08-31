'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import DashboardNav from '@/components/DashboardNav';
import Link from 'next/link';

interface HotelDetails {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  contactEmail: string;
  contactPhone: string;
  totalRooms: number;
  subscriptionPlan: string;
  subscriptionStatus: string;
  createdAt: string;
  updatedAt: string;
  admin: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  };
  subscription?: {
    id: string;
    planType: string;
    billingCycle: string;
    roomTier: string;
    amount: number;
    currency: string;
    status: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    createdAt: string;
  };
  rooms: Array<{
    id: string;
    roomNumber: string;
    roomType: string;
    isOccupied: boolean;
  }>;
  paymentOrders: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
    payments: Array<{
      id: string;
      status: string;
      amount: number;
      createdAt: string;
    }>;
  }>;
  serviceRequests: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    requestedAt: string;
  }>;
  _count: {
    rooms: number;
    serviceRequests: number;
    paymentOrders: number;
  };
}

export default function HotelDetailsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const hotelId = params.id as string;

  const [hotel, setHotel] = useState<HotelDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'super_admin') {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.role === 'super_admin' && hotelId) {
      fetchHotelDetails();
    }
  }, [session, hotelId]);

  const fetchHotelDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/super-admin/hotels/${hotelId}`);

      if (response.ok) {
        const data = await response.json();
        setHotel(data.hotel);
      } else {
        console.error('Failed to fetch hotel details');
      }
    } catch (error) {
      console.error('Error fetching hotel details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubscription = async (status: string) => {
    try {
      const response = await fetch('/api/super-admin/update-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hotelId, status }),
      });

      if (response.ok) {
        fetchHotelDetails(); // Refresh data
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount / 100);
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
      past_due: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      created: 'bg-gray-100 text-gray-800',
      captured: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading hotel details...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== 'super_admin' || !hotel) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100">
      <DashboardNav title="Hotel Details" icon="🏨" showNotifications={false} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/dashboard/super-admin"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Hotel Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{hotel.name}</h1>
              <p className="text-gray-600 mb-4">{hotel.address}</p>
              <p className="text-gray-600">{hotel.city}, {hotel.state}, {hotel.country}</p>
            </div>
            <div className="text-right">
              <div className="flex space-x-2 mb-4">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadge(hotel.subscriptionStatus)}`}>
                  {hotel.subscriptionStatus}
                </span>
                <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                  {hotel.subscriptionPlan}
                </span>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => handleUpdateSubscription('active')}
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                  disabled={hotel.subscriptionStatus === 'active'}
                >
                  Activate
                </button>
                <button
                  onClick={() => handleUpdateSubscription('inactive')}
                  className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                  disabled={hotel.subscriptionStatus === 'inactive'}
                >
                  Deactivate
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-2xl font-bold text-indigo-600">{hotel._count.rooms}</div>
            <div className="text-gray-600">Total Rooms</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-2xl font-bold text-green-600">{hotel._count.serviceRequests}</div>
            <div className="text-gray-600">Service Requests</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-2xl font-bold text-purple-600">{hotel._count.paymentOrders}</div>
            <div className="text-gray-600">Payment Orders</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-2xl font-bold text-amber-600">
              {hotel.subscription ? formatCurrency(hotel.subscription.amount) : 'N/A'}
            </div>
            <div className="text-gray-600">Monthly Revenue</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'subscription', label: 'Subscription' },
                { id: 'payments', label: 'Payments' },
                { id: 'rooms', label: 'Rooms' },
                { id: 'requests', label: 'Service Requests' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 text-sm font-medium ${activeTab === tab.id
                    ? 'border-b-2 border-indigo-500 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Hotel Information</h3>
                    <dl className="space-y-2">
                      <div>
                        <dt className="text-sm text-gray-600">Contact Email</dt>
                        <dd className="text-sm font-medium text-gray-900">{hotel.contactEmail}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-600">Contact Phone</dt>
                        <dd className="text-sm font-medium text-gray-900">{hotel.contactPhone}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-600">Created</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          {new Date(hotel.createdAt).toLocaleDateString()}
                        </dd>
                      </div>
                    </dl>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Information</h3>
                    <dl className="space-y-2">
                      <div>
                        <dt className="text-sm text-gray-600">Name</dt>
                        <dd className="text-sm font-medium text-gray-900">{hotel.admin.name}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-600">Email</dt>
                        <dd className="text-sm font-medium text-gray-900">{hotel.admin.email}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-600">Admin Since</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          {new Date(hotel.admin.createdAt).toLocaleDateString()}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            )}

            {/* Subscription Tab */}
            {activeTab === 'subscription' && (
              <div>
                {hotel.subscription ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Current Subscription</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <dt className="text-sm text-gray-600">Plan</dt>
                        <dd className="text-lg font-semibold text-gray-900 capitalize">
                          {hotel.subscription.planType}
                        </dd>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <dt className="text-sm text-gray-600">Billing</dt>
                        <dd className="text-lg font-semibold text-gray-900 capitalize">
                          {hotel.subscription.billingCycle}
                        </dd>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <dt className="text-sm text-gray-600">Amount</dt>
                        <dd className="text-lg font-semibold text-gray-900">
                          {formatCurrency(hotel.subscription.amount)}
                        </dd>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <dt className="text-sm text-gray-600">Room Tier</dt>
                        <dd className="text-lg font-semibold text-gray-900 capitalize">
                          {hotel.subscription.roomTier.replace('_', ' ')}
                        </dd>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <dt className="text-sm text-gray-600">Current Period</dt>
                        <dd className="text-sm text-gray-900">
                          {new Date(hotel.subscription.currentPeriodStart).toLocaleDateString()} -{' '}
                          {new Date(hotel.subscription.currentPeriodEnd).toLocaleDateString()}
                        </dd>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <dt className="text-sm text-gray-600">Status</dt>
                        <dd>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(hotel.subscription.status)}`}>
                            {hotel.subscription.status}
                          </span>
                        </dd>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No subscription found for this hotel.</p>
                  </div>
                )}
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === 'payments' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h3>
                {hotel.paymentOrders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Order ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {hotel.paymentOrders.map((order) => (
                          <tr key={order.id}>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                              {order.id.slice(0, 8)}...
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {formatCurrency(order.amount)}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(order.status)}`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No payment orders found.</p>
                  </div>
                )}
              </div>
            )}

            {/* Rooms Tab */}
            {activeTab === 'rooms' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Rooms ({hotel.rooms.length})</h3>
                {hotel.rooms.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {hotel.rooms.map((room) => (
                      <div key={room.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold text-gray-900">Room {room.roomNumber}</h4>
                            <p className="text-sm text-gray-600">{room.roomType}</p>
                          </div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${room.isOccupied ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                            }`}>
                            {room.isOccupied ? 'Occupied' : 'Available'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No rooms found.</p>
                  </div>
                )}
              </div>
            )}

            {/* Service Requests Tab */}
            {activeTab === 'requests' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Service Requests</h3>
                {hotel.serviceRequests.length > 0 ? (
                  <div className="space-y-4">
                    {hotel.serviceRequests.map((request) => (
                      <div key={request.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-gray-900">{request.title}</h4>
                            <p className="text-sm text-gray-500">
                              {new Date(request.requestedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(request.status)}`}>
                              {request.status}
                            </span>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${request.priority === 'high' ? 'bg-red-100 text-red-800' :
                              request.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                              {request.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No service requests found.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
