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
    updatedAt: string;
}

interface RoomFormData {
    roomNumber: string;
    roomType: string;
}

interface RoomEditPageProps {
    params: {
        id: string;
    };
}

export default function RoomEditPage({ params }: RoomEditPageProps) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [room, setRoom] = useState<Room | null>(null);
    const [formData, setFormData] = useState<RoomFormData>({
        roomNumber: "",
        roomType: "Standard"
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const roomTypes = [
        "Standard",
        "Deluxe",
        "Suite", 
        "Presidential Suite",
        "Family Room",
        "Executive Room"
    ];

    useEffect(() => {
        if (status === "loading") return;
        if (!session) {
            router.push("/login");
            return;
        }
        if (session.user.role !== "hotel_admin") {
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
                setFormData({
                    roomNumber: data.room.roomNumber,
                    roomType: data.room.roomType
                });
            } else {
                setError("Failed to load room details");
            }
        } catch (error) {
            setError("Network error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            const response = await fetch(`/api/rooms/${params.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                router.push(`/dashboard/rooms/${params.id}`);
            } else {
                const errorData = await response.json();
                setError(errorData.error || "Failed to update room");
            }
        } catch (error) {
            setError("Network error occurred");
        } finally {
            setIsSubmitting(false);
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

    if (!session || session.user.role !== "hotel_admin") {
        return null;
    }

    if (error && !room) {
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
                        <Link href={`/dashboard/rooms/${params.id}`} className="btn-minion-secondary">
                            ← Back to Room
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-6 py-12">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">
                        Edit Room {room.roomNumber} ✏️
                    </h1>
                    <p className="text-xl text-gray-600">
                        Update room details and configuration
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Edit Form */}
                    <div className="card-minion">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Room Details</h2>
                        
                        {error && (
                            <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="roomNumber" className="block text-sm font-medium text-gray-700 mb-2">
                                    Room Number *
                                </label>
                                <input
                                    type="text"
                                    id="roomNumber"
                                    name="roomNumber"
                                    value={formData.roomNumber}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-minion-yellow focus:border-transparent"
                                    placeholder="e.g., 101, A-205"
                                />
                            </div>

                            <div>
                                <label htmlFor="roomType" className="block text-sm font-medium text-gray-700 mb-2">
                                    Room Type *
                                </label>
                                <select
                                    id="roomType"
                                    name="roomType"
                                    value={formData.roomType}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-minion-yellow focus:border-transparent"
                                >
                                    {roomTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex space-x-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="btn-minion flex-1"
                                >
                                    {isSubmitting ? "Updating..." : "💾 Update Room"}
                                </button>
                                <Link 
                                    href={`/dashboard/rooms/${params.id}`}
                                    className="btn-minion-secondary flex-1 text-center"
                                >
                                    Cancel
                                </Link>
                            </div>
                        </form>

                        {/* Delete Room Section */}
                        {!room.isOccupied && (
                            <div className="mt-8 p-4 bg-red-50 rounded-lg border border-red-200">
                                <h3 className="text-lg font-semibold text-red-800 mb-2">Danger Zone</h3>
                                <p className="text-sm text-red-600 mb-4">
                                    Permanently delete this room. This action cannot be undone.
                                </p>
                                <button
                                    onClick={async () => {
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
                                                setError(errorData.error || "Failed to delete room");
                                            }
                                        } catch (error) {
                                            setError("Error deleting room");
                                        }
                                    }}
                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                >
                                    🗑️ Delete Room
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Current Details Preview */}
                    <div className="card-minion">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Current Details</h2>
                        
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
                                <code className="bg-gray-100 px-3 py-2 rounded text-sm font-mono block">
                                    {room.accessCode}
                                </code>
                                <p className="text-xs text-gray-500 mt-1">
                                    Access code cannot be changed
                                </p>
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
                                    <div className="text-sm text-gray-900">
                                        {room.currentBookingId}
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 border-t border-gray-200">
                                <div className="text-sm text-gray-500">
                                    <p>Created: {new Date(room.createdAt).toLocaleDateString()}</p>
                                    <p>Updated: {new Date(room.updatedAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Actions */}
                <div className="mt-12 card-minion">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Additional Actions</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        <Link 
                            href={`/dashboard/rooms/${room.id}`}
                            className="btn-minion-secondary text-center"
                        >
                            👁️ View Room Details
                        </Link>
                        <button
                            onClick={async () => {
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
                                    }
                                } catch (error) {
                                    alert("Error downloading QR code");
                                }
                            }}
                            className="btn-minion-secondary"
                        >
                            📱 Download QR Code
                        </button>
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
