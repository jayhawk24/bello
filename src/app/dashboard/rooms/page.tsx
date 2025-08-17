"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Room {
    id: string;
    roomNumber: string;
    roomType: string;
    accessCode: string;
    isOccupied: boolean;
    currentBookingId: string | null;
    createdAt: string;
}

export default function RoomsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (status === "loading") return;
        if (!session) {
            router.push("/login");
            return;
        }
        if (!['hotel_admin', 'hotel_staff'].includes(session.user.role)) {
            router.push("/dashboard");
            return;
        }
        fetchRooms();
    }, [session, status, router]);

    const fetchRooms = async () => {
        try {
            const response = await fetch("/api/rooms");
            if (response.ok) {
                const data = await response.json();
                setRooms(data.rooms);
            } else {
                setError("Failed to load rooms");
            }
        } catch (error) {
            setError("Network error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const downloadQRCode = async (roomId: string, roomNumber: string) => {
        try {
            const response = await fetch(`/api/rooms/${roomId}/qr-code`);
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = `room-${roomNumber}-qr.png`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            } else {
                alert("Failed to generate QR code");
            }
        } catch (error) {
            alert("Error downloading QR code");
        }
    };

    if (status === "loading" || isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center">
                <div className="card-minion text-center">
                    <div className="animate-bounce-slow mb-4">
                        <span className="text-4xl">🛏️</span>
                    </div>
                    <p className="text-gray-600">Loading rooms...</p>
                </div>
            </div>
        );
    }

    if (!session || !['hotel_admin', 'hotel_staff'].includes(session.user.role)) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100">
            {/* Navigation */}
            <nav className="nav-minion px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-minion-yellow rounded-full flex items-center justify-center">
                            <span className="text-2xl">🛏️</span>
                        </div>
                        <Link href="/dashboard" className="text-2xl font-bold text-gray-800 hover:text-minion-blue transition-colors">
                            Bello Dashboard
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-gray-600">Welcome, {session.user.name}</span>
                        <Link href="/dashboard" className="btn-minion-secondary">
                            ← Back to Dashboard
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-800 mb-4">
                            Room Management 🛏️
                        </h1>
                        <p className="text-xl text-gray-600">
                            {session.user.role === 'hotel_admin' 
                                ? 'Manage your hotel rooms and generate QR codes for guest access'
                                : 'View hotel rooms and download QR codes for guest access'
                            }
                        </p>
                    </div>
                    {session.user.role === 'hotel_admin' && (
                        <Link href="/dashboard/rooms/add" className="btn-minion">
                            ➕ Add New Room
                        </Link>
                    )}
                </div>

                {error && (
                    <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {rooms.length === 0 ? (
                    <div className="card-minion text-center">
                        <div className="text-6xl mb-4">🛏️</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">No Rooms Added Yet</h2>
                        <p className="text-gray-600 mb-6">
                            {session.user.role === 'hotel_admin' 
                                ? 'Start by adding your hotel rooms to enable guest services'
                                : 'No rooms have been set up yet. Please contact your hotel administrator.'
                            }
                        </p>
                        {session.user.role === 'hotel_admin' && (
                            <Link href="/dashboard/rooms/add" className="btn-minion">
                                Add Your First Room
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {rooms.map((room) => (
                            <div key={room.id} className="card-minion">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800">Room {room.roomNumber}</h3>
                                        <p className="text-gray-600">{room.roomType}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        room.isOccupied 
                                            ? 'bg-red-100 text-red-800' 
                                            : 'bg-green-100 text-green-800'
                                    }`}>
                                        {room.isOccupied ? 'Occupied' : 'Available'}
                                    </span>
                                </div>

                                {room.currentBookingId && (
                                    <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                                        <p className="text-sm text-gray-600">Current Booking:</p>
                                        <p className="font-medium text-gray-800">{room.currentBookingId}</p>
                                    </div>
                                )}

                                <div className="mb-4">
                                    <p className="text-sm text-gray-600">Access Code:</p>
                                    <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                                        {room.accessCode}
                                    </code>
                                </div>

                                <div className="flex flex-col space-y-2">
                                    <button
                                        onClick={() => downloadQRCode(room.id, room.roomNumber)}
                                        className="btn-minion w-full text-sm"
                                    >
                                        📱 Download QR Code
                                    </button>
                                    <div className="flex space-x-2">
                                        {session.user.role === 'hotel_admin' && (
                                            <Link 
                                                href={`/dashboard/rooms/${room.id}/edit`} 
                                                className="btn-minion-secondary flex-1 text-center text-sm"
                                            >
                                                ✏️ Edit
                                            </Link>
                                        )}
                                        <Link 
                                            href={`/dashboard/rooms/${room.id}`} 
                                            className={`btn-minion-secondary text-center text-sm ${
                                                session.user.role === 'hotel_admin' ? 'flex-1' : 'w-full'
                                            }`}
                                        >
                                            👁️ View Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Quick Stats */}
                {rooms.length > 0 && (
                    <div className="mt-12 grid md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-lg p-6 border border-gray-200">
                            <div className="text-2xl font-bold text-minion-yellow">{rooms.length}</div>
                            <div className="text-gray-600">Total Rooms</div>
                        </div>
                        <div className="bg-white rounded-lg p-6 border border-gray-200">
                            <div className="text-2xl font-bold text-green-600">
                                {rooms.filter(r => !r.isOccupied).length}
                            </div>
                            <div className="text-gray-600">Available</div>
                        </div>
                        <div className="bg-white rounded-lg p-6 border border-gray-200">
                            <div className="text-2xl font-bold text-red-600">
                                {rooms.filter(r => r.isOccupied).length}
                            </div>
                            <div className="text-gray-600">Occupied</div>
                        </div>
                        <div className="bg-white rounded-lg p-6 border border-gray-200">
                            <div className="text-2xl font-bold text-blue-600">
                                {rooms.length > 0 ? Math.round((rooms.filter(r => r.isOccupied).length / rooms.length) * 100) : 0}%
                            </div>
                            <div className="text-gray-600">Occupancy Rate</div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
