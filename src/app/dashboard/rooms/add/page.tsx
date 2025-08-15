"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface RoomFormData {
    roomNumber: string;
    roomType: string;
}

const roomTypes = [
    "Standard Single",
    "Standard Double", 
    "Deluxe Single",
    "Deluxe Double",
    "Junior Suite",
    "Executive Suite",
    "Presidential Suite",
    "Family Room",
    "Connecting Rooms",
    "Accessible Room"
];

export default function AddRoomPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [formData, setFormData] = useState<RoomFormData>({
        roomNumber: "",
        roomType: "Standard Single"
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

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
    }, [session, status, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const response = await fetch("/api/rooms", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                router.push("/dashboard/rooms");
            } else {
                const data = await response.json();
                setError(data.error || "Failed to add room");
            }
        } catch (error) {
            setError("Network error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center">
                <div className="card-minion text-center">
                    <div className="animate-bounce-slow mb-4">
                        <span className="text-4xl">🛏️</span>
                    </div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!session || session.user.role !== "hotel_admin") {
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
                        <Link href="/dashboard/rooms" className="btn-minion-secondary">
                            ← Back to Rooms
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-6 py-12">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">
                        Add New Room 🛏️
                    </h1>
                    <p className="text-xl text-gray-600">
                        Add a new room to your hotel and generate its QR code
                    </p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                <div className="card-minion">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="form-group">
                                <label htmlFor="roomNumber" className="form-label">Room Number *</label>
                                <input
                                    type="text"
                                    id="roomNumber"
                                    name="roomNumber"
                                    value={formData.roomNumber}
                                    onChange={handleChange}
                                    className="input-minion"
                                    placeholder="101, 201A, etc."
                                    required
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    Enter the room number or identifier
                                </p>
                            </div>

                            <div className="form-group">
                                <label htmlFor="roomType" className="form-label">Room Type *</label>
                                <select
                                    id="roomType"
                                    name="roomType"
                                    value={formData.roomType}
                                    onChange={handleChange}
                                    className="input-minion"
                                    required
                                >
                                    {roomTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                                <p className="text-sm text-gray-500 mt-1">
                                    Select the room category
                                </p>
                            </div>
                        </div>

                        {/* Info Box */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h3 className="font-semibold text-blue-800 mb-2">📋 What happens next?</h3>
                            <ul className="text-sm text-blue-700 space-y-1">
                                <li>• A unique access code will be automatically generated</li>
                                <li>• A QR code will be created for guest access</li>
                                <li>• The room will be available for guest check-ins</li>
                                <li>• You can download and print the QR code for the room</li>
                            </ul>
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                            <Link href="/dashboard/rooms" className="btn-minion-secondary">
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                className="btn-minion"
                                disabled={isLoading}
                            >
                                {isLoading ? "➕ Adding Room..." : "➕ Add Room"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Tips */}
                <div className="mt-8 card-minion bg-yellow-50">
                    <h3 className="font-semibold text-gray-800 mb-3">💡 Tips for Room Management</h3>
                    <ul className="text-sm text-gray-600 space-y-2">
                        <li>• Use consistent room numbering (e.g., floor + room: 101, 102, 201, 202)</li>
                        <li>• Choose descriptive room types to help with guest expectations</li>
                        <li>• QR codes should be placed in visible locations within each room</li>
                        <li>• Consider laminating QR codes to protect them from wear</li>
                    </ul>
                </div>
            </main>
        </div>
    );
}
