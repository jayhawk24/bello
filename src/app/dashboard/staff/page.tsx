"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Staff {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    lastLogin: string | null;
    createdAt: string;
}

export default function StaffPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [staff, setStaff] = useState<Staff[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (status === "loading") return; // Still loading
        if (!session) {
            router.push("/login");
            return;
        }
        if (session.user.role !== "hotel_admin") {
            router.push("/dashboard");
            return;
        }

        // Fetch staff data once session is confirmed
        fetchStaff();
    }, [session, status, router]);

    const fetchStaff = async () => {
        try {
            const response = await fetch("/api/staff");
            if (response.ok) {
                const data = await response.json();
                setStaff(data.staff);
            } else {
                setError("Failed to load staff");
            }
        } catch (error) {
            setError("Network error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    if (status === "loading" || isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center">
                <div className="card-minion text-center">
                    <div className="animate-bounce-slow mb-4">
                        <span className="text-4xl">👥</span>
                    </div>
                    <p className="text-gray-600">Loading staff...</p>
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
                            Staff Management 👥
                        </h1>
                        <p className="text-xl text-gray-600">
                            Manage your hotel staff members and their access
                        </p>
                    </div>
                    <Link href="/dashboard/staff/add" className="btn-minion">
                        ➕ Add New Staff
                    </Link>
                </div>

                {error && (
                    <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {staff.length === 0 ? (
                    <div className="card-minion text-center">
                        <div className="text-6xl mb-4">👥</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">No Staff Members Yet</h2>
                        <p className="text-gray-600 mb-6">
                            Start by adding your hotel staff to manage guest services
                        </p>
                        <Link href="/dashboard/staff/add" className="btn-minion">
                            Add Your First Staff Member
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Staff List */}
                        <div className="card-minion overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Staff Member
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Role
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Contact
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Last Login
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {staff.map((member) => (
                                            <tr key={member.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {member.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {member.email}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${member.role === 'hotel_staff'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-purple-100 text-purple-800'
                                                        }`}>
                                                        {member.role === 'hotel_staff' ? 'Staff' : 'Admin'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {member.phone}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        Active
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {member.lastLogin
                                                        ? new Date(member.lastLogin).toLocaleDateString()
                                                        : 'Never'
                                                    }
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                    <Link
                                                        href={`/dashboard/staff/${member.id}/edit`}
                                                        className="text-minion-blue hover:text-minion-yellow"
                                                    >
                                                        ✏️ Edit
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="mt-8 grid md:grid-cols-3 gap-4">
                            <div className="bg-white rounded-lg p-6 border border-gray-200">
                                <div className="text-2xl font-bold text-minion-yellow">{staff.length}</div>
                                <div className="text-gray-600">Total Staff</div>
                            </div>
                            <div className="bg-white rounded-lg p-6 border border-gray-200">
                                <div className="text-2xl font-bold text-blue-600">
                                    {staff.filter(s => s.role === 'hotel_staff').length}
                                </div>
                                <div className="text-gray-600">Staff Members</div>
                            </div>
                            <div className="bg-white rounded-lg p-6 border border-gray-200">
                                <div className="text-2xl font-bold text-purple-600">
                                    {staff.filter(s => s.role === 'hotel_admin').length}
                                </div>
                                <div className="text-gray-600">Admins</div>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
