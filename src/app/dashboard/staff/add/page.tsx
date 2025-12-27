"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface StaffFormData {
    name: string;
    email: string;
    phone: string;
    role: "hotel_staff" | "hotel_admin";
    password: string;
    confirmPassword: string;
}

export default function AddStaffPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [formData, setFormData] = useState<StaffFormData>({
        name: "",
        email: "",
        phone: "",
        role: "hotel_staff",
        password: "",
        confirmPassword: ""
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

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const response = await fetch("/api/staff", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    role: formData.role,
                    password: formData.password
                })
            });

            if (response.ok) {
                router.push("/dashboard/staff");
            } else {
                const data = await response.json();
                setError(data.error || "Failed to add staff member");
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
                        <span className="text-4xl">👥</span>
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
                            <span className="text-2xl">👥</span>
                        </div>
                        <Link href="/dashboard" className="text-2xl font-bold text-gray-800 hover:text-minion-blue transition-colors">
                            StayScan Dashboard
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-gray-600">Welcome, {session.user.name}</span>
                        <Link href="/dashboard/staff" className="btn-minion-secondary">
                            ← Back to Staff
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-6 py-12">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">
                        Add New Staff Member 👥
                    </h1>
                    <p className="text-xl text-gray-600">
                        Add a new team member to help with guest services
                    </p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                <div className="card-minion">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Personal Information */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Personal Information</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label htmlFor="name" className="form-label">Full Name *</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="input-minion"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="role" className="form-label">Role *</label>
                                    <select
                                        id="role"
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        className="input-minion"
                                        required
                                    >
                                        <option value="hotel_staff">Staff Member</option>
                                        <option value="hotel_admin">Admin</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Contact Information</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label htmlFor="email" className="form-label">Email Address *</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="input-minion"
                                        placeholder="john@hotel.com"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="phone" className="form-label">Phone Number *</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="input-minion"
                                        placeholder="+1 (555) 123-4567"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Login Credentials */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Login Credentials</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label htmlFor="password" className="form-label">Password *</label>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="input-minion"
                                        placeholder="••••••••"
                                        minLength={8}
                                        required
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        Minimum 8 characters
                                    </p>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="confirmPassword" className="form-label">Confirm Password *</label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="input-minion"
                                        placeholder="••••••••"
                                        minLength={8}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Role Information */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h3 className="font-semibold text-blue-800 mb-2">🔐 Role Permissions</h3>
                            <div className="text-sm text-blue-700 space-y-1">
                                <p><strong>Staff Member:</strong> Can view and respond to guest service requests</p>
                                <p><strong>Admin:</strong> Full access to hotel management, staff, and settings</p>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                            <Link href="/dashboard/staff" className="btn-minion-secondary">
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                className="btn-minion"
                                disabled={isLoading}
                            >
                                {isLoading ? "➕ Adding Staff..." : "➕ Add Staff Member"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Tips */}
                <div className="mt-8 card-minion bg-yellow-50">
                    <h3 className="font-semibold text-gray-800 mb-3">💡 Tips for Staff Management</h3>
                    <ul className="text-sm text-gray-600 space-y-2">
                        <li>• New staff members will receive login credentials via email</li>
                        <li>• Staff can be activated/deactivated without deleting their account</li>
                        <li>• Admin roles have full access to hotel management features</li>
                        <li>• Regular staff can only access guest service request management</li>
                    </ul>
                </div>
            </main>
        </div>
    );
}
