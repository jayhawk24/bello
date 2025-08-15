"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface HotelFormData {
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    contactEmail: string;
    contactPhone: string;
    totalRooms: number;
}

export default function EditHotelPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [formData, setFormData] = useState<HotelFormData>({
        name: "",
        address: "",
        city: "",
        state: "",
        country: "",
        contactEmail: "",
        contactPhone: "",
        totalRooms: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

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
        fetchHotelData();
    }, [session, status, router]);

    const fetchHotelData = async () => {
        try {
            const response = await fetch("/api/hotel/profile");
            if (response.ok) {
                const data = await response.json();
                setFormData({
                    name: data.hotel.name || "",
                    address: data.hotel.address || "",
                    city: data.hotel.city || "",
                    state: data.hotel.state || "",
                    country: data.hotel.country || "",
                    contactEmail: data.hotel.contactEmail || "",
                    contactPhone: data.hotel.contactPhone || "",
                    totalRooms: data.hotel.totalRooms || 0
                });
            } else {
                setError("Failed to load hotel data");
            }
        } catch (error) {
            setError("Network error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "number" ? parseInt(value) || 0 : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError("");
        setSuccess("");

        try {
            const response = await fetch("/api/hotel/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setSuccess("Hotel profile updated successfully!");
                setTimeout(() => {
                    router.push("/dashboard/hotel");
                }, 2000);
            } else {
                const data = await response.json();
                setError(data.error || "Failed to update hotel profile");
            }
        } catch (error) {
            setError("Network error occurred");
        } finally {
            setIsSaving(false);
        }
    };

    if (status === "loading" || isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center">
                <div className="card-minion text-center">
                    <div className="animate-bounce-slow mb-4">
                        <span className="text-4xl">🏨</span>
                    </div>
                    <p className="text-gray-600">Loading hotel profile...</p>
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
                            <span className="text-2xl">🏨</span>
                        </div>
                        <Link href="/dashboard" className="text-2xl font-bold text-gray-800 hover:text-minion-blue transition-colors">
                            Bello Dashboard
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-gray-600">Welcome, {session.user.name}</span>
                        <Link href="/dashboard/hotel" className="btn-minion-secondary">
                            ← Back to Profile
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-6 py-12">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">
                        Edit Hotel Profile ✏️
                    </h1>
                    <p className="text-xl text-gray-600">
                        Update your hotel information and contact details
                    </p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
                        {success}
                    </div>
                )}

                <div className="card-minion">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Basic Information</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label htmlFor="name" className="form-label">Hotel Name *</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="input-minion"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="totalRooms" className="form-label">Total Rooms *</label>
                                    <input
                                        type="number"
                                        id="totalRooms"
                                        name="totalRooms"
                                        value={formData.totalRooms}
                                        onChange={handleChange}
                                        className="input-minion"
                                        min="1"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Contact Information</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label htmlFor="contactEmail" className="form-label">Contact Email *</label>
                                    <input
                                        type="email"
                                        id="contactEmail"
                                        name="contactEmail"
                                        value={formData.contactEmail}
                                        onChange={handleChange}
                                        className="input-minion"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="contactPhone" className="form-label">Contact Phone *</label>
                                    <input
                                        type="tel"
                                        id="contactPhone"
                                        name="contactPhone"
                                        value={formData.contactPhone}
                                        onChange={handleChange}
                                        className="input-minion"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Address Information */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Address</h2>
                            <div className="space-y-4">
                                <div className="form-group">
                                    <label htmlFor="address" className="form-label">Street Address</label>
                                    <input
                                        type="text"
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="input-minion"
                                        placeholder="123 Main Street"
                                    />
                                </div>
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div className="form-group">
                                        <label htmlFor="city" className="form-label">City</label>
                                        <input
                                            type="text"
                                            id="city"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            className="input-minion"
                                            placeholder="New York"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="state" className="form-label">State/Province</label>
                                        <input
                                            type="text"
                                            id="state"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleChange}
                                            className="input-minion"
                                            placeholder="NY"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="country" className="form-label">Country</label>
                                        <input
                                            type="text"
                                            id="country"
                                            name="country"
                                            value={formData.country}
                                            onChange={handleChange}
                                            className="input-minion"
                                            placeholder="United States"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                            <Link href="/dashboard/hotel" className="btn-minion-secondary">
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                className="btn-minion"
                                disabled={isSaving}
                            >
                                {isSaving ? "💾 Saving..." : "💾 Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
