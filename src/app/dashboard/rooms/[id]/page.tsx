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
    hotelId: string;
    isOccupied: boolean;
    currentBookingId: string | null;
    createdAt: string;
    updatedAt: string;
}

interface RoomViewPageProps {
    params: {
        id: string;
    };
}

export default function RoomViewPage({ params }: RoomViewPageProps) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [room, setRoom] = useState<Room | null>(null);
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
        fetchRoom();
    }, [session, status, router, params.id]);

    const fetchRoom = async () => {
        try {
            const response = await fetch(`/api/rooms/${params.id}`);
            if (response.ok) {
                const data = await response.json();
                setRoom(data.room);
            } else {
                setError("Failed to load room details");
            }
        } catch (error) {
            setError("Network error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const downloadQRCode = async () => {
        if (!room) return;
        
        try {
            const response = await fetch(`/api/rooms/${room.id}/qr-code`);
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = `room-${room.roomNumber}-qr.png`;
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

    const copyQRDetails = async () => {
        if (!room) return;
        
        try {
            // Generate the same QR data that would be in the QR code (matching the generateQRCodeData function)
            const baseUrl = window.location.origin;
            const qrData = `${baseUrl}/guest/room?hotelId=${encodeURIComponent(room.hotelId)}&roomNumber=${encodeURIComponent(room.roomNumber)}&accessCode=${encodeURIComponent(room.accessCode)}`;
            
            await navigator.clipboard.writeText(qrData);
            alert("QR code URL copied to clipboard!");
        } catch (error) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            const baseUrl = window.location.origin;
            const qrData = `${baseUrl}/guest/room?hotelId=${encodeURIComponent(room.hotelId)}&roomNumber=${encodeURIComponent(room.roomNumber)}&accessCode=${encodeURIComponent(room.accessCode)}`;
            
            textArea.value = qrData;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert("QR code URL copied to clipboard!");
        }
    };

    const deleteRoom = async () => {
        if (!room) return;
        
        if (room.isOccupied) {
            alert("Cannot delete an occupied room");
            return;
        }

        const confirmed = confirm(`Are you sure you want to delete Room ${room.roomNumber}? This action cannot be undone.`);
        if (!confirmed) return;

        try {
            const response = await fetch(`/api/rooms/${room.id}`, {
                method: "DELETE"
            });

            if (response.ok) {
                router.push("/dashboard/rooms");
            } else {
                const errorData = await response.json();
                alert(errorData.error || "Failed to delete room");
            }
        } catch (error) {
            alert("Error deleting room");
        }
    };

    if (status === "loading" || isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center">
                <div className="card-minion text-center">
                    <div className="animate-bounce-slow mb-4">
                        <span className="text-4xl">🛏️</span>
                    </div>
                    <p className="text-gray-600">Loading room details...</p>
                </div>
            </div>
        );
    }

    if (!session || !['hotel_admin', 'hotel_staff'].includes(session.user.role)) {
        return null;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center">
                <div className="card-minion text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Room</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Link href="/dashboard/rooms" className="btn-minion">
                        ← Back to Rooms
                    </Link>
                </div>
            </div>
        );
    }

    if (!room) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center">
                <div className="card-minion text-center">
                    <div className="text-6xl mb-4">🔍</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Room Not Found</h2>
                    <p className="text-gray-600 mb-6">The requested room could not be found.</p>
                    <Link href="/dashboard/rooms" className="btn-minion">
                        ← Back to Rooms
                    </Link>
                </div>
            </div>
        );
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
                        <Link href="/dashboard/rooms" className="btn-minion-secondary">
                            ← Back to Rooms
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-6 py-12">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-800 mb-4">
                            Room {room.roomNumber} 🛏️
                        </h1>
                        <p className="text-xl text-gray-600">
                            {room.roomType}
                        </p>
                    </div>
                    <div className="flex space-x-3">
                        {session.user.role === 'hotel_admin' && (
                            <Link 
                                href={`/dashboard/rooms/${room.id}/edit`} 
                                className="btn-minion"
                            >
                                ✏️ Edit Room
                            </Link>
                        )}
                        <button
                            onClick={downloadQRCode}
                            className="btn-minion-secondary"
                        >
                            📱 Download QR
                        </button>
                        <button
                            onClick={copyQRDetails}
                            className="btn-minion-secondary"
                        >
                            📋 Copy QR URL
                        </button>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Room Details */}
                    <div className="card-minion">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Room Details</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Room Number
                                </label>
                                <div className="text-lg font-semibold text-gray-900">
                                    {room.roomNumber}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Room Type
                                </label>
                                <div className="text-lg text-gray-900">
                                    {room.roomType}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Access Code
                                </label>
                                <code className="bg-gray-100 px-3 py-2 rounded text-lg font-mono block">
                                    {room.accessCode}
                                </code>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status
                                </label>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    room.isOccupied 
                                        ? 'bg-red-100 text-red-800' 
                                        : 'bg-green-100 text-green-800'
                                }`}>
                                    {room.isOccupied ? 'Occupied' : 'Available'}
                                </span>
                            </div>

                            {room.currentBookingId && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Current Booking
                                    </label>
                                    <div className="text-lg text-gray-900">
                                        {room.currentBookingId}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Timestamps */}
                    <div className="card-minion">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Room Information</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Created
                                </label>
                                <div className="text-lg text-gray-900">
                                    {new Date(room.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Last Updated
                                </label>
                                <div className="text-lg text-gray-900">
                                    {new Date(room.updatedAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* QR Code Preview */}
                        <div className="mt-8 p-4 bg-gray-50 rounded-lg text-center">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">QR Code Access</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Guests can scan the QR code to access room services
                            </p>
                            <div className="flex flex-col space-y-2">
                                <button
                                    onClick={downloadQRCode}
                                    className="btn-minion w-full"
                                >
                                    📱 Download QR Code
                                </button>
                                <button
                                    onClick={copyQRDetails}
                                    className="btn-minion-secondary w-full"
                                >
                                    📋 Copy QR URL
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-12 card-minion">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
                    <div className={`grid gap-4 ${session.user.role === 'hotel_admin' ? 'md:grid-cols-5' : 'md:grid-cols-4'}`}>
                        {session.user.role === 'hotel_admin' && (
                            <Link 
                                href={`/dashboard/rooms/${room.id}/edit`}
                                className="btn-minion text-center"
                            >
                                ✏️ Edit Room Details
                            </Link>
                        )}
                        <button
                            onClick={downloadQRCode}
                            className="btn-minion-secondary"
                        >
                            📱 Download QR Code
                        </button>
                        <button
                            onClick={copyQRDetails}
                            className="btn-minion-secondary"
                        >
                            📋 Copy QR URL
                        </button>
                        {session.user.role === 'hotel_admin' && (
                            <button
                                onClick={deleteRoom}
                                disabled={room.isOccupied}
                                className={`${room.isOccupied 
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                    : 'bg-red-500 hover:bg-red-600 text-white'
                                } px-4 py-2 rounded-lg font-medium transition-colors`}
                            >
                                🗑️ Delete Room
                            </button>
                        )}
                        <Link 
                            href="/dashboard/rooms"
                            className="btn-minion-secondary text-center"
                        >
                            ← Back to All Rooms
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
