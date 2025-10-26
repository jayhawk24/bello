"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRef } from "react";

interface HotelData {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    contactEmail: string;
    contactPhone: string;
    subscriptionTier: string;
    subscriptionStatus: string;
    totalRooms: number;
    createdAt: string;
}

export default function HotelProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [hotel, setHotel] = useState<HotelData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    // TV Guide, WiFi & Food Menu state
    const [activeTab, setActiveTab] = useState<'info' | 'tv' | 'wifi' | 'food'>("info");
    const [tvGuides, setTvGuides] = useState<any[]>([]);
    const [wifiGuides, setWifiGuides] = useState<any[]>([]);
    const [foodMenus, setFoodMenus] = useState<any[]>([]);
    const [showAddTvModal, setShowAddTvModal] = useState(false);
    const [showAddWifiModal, setShowAddWifiModal] = useState(false);
    const [showAddFoodModal, setShowAddFoodModal] = useState(false);
    const tvTitleRef = useRef<HTMLInputElement>(null);
    const wifiNameRef = useRef<HTMLInputElement>(null);
    const foodNameRef = useRef<HTMLInputElement>(null);
    const foodDescriptionRef = useRef<HTMLTextAreaElement>(null);
    const foodCategoryRef = useRef<HTMLSelectElement>(null);


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
        fetchTvGuides();
        fetchWifiGuides();
        fetchFoodMenus();
    }, [session, status, router]);


    const fetchHotelData = async () => {
        try {
            const response = await fetch("/api/hotel/profile");
            if (response.ok) {
                const data = await response.json();
                setHotel(data.hotel);
            } else {
                setError("Failed to load hotel data");
            }
        } catch (error) {
            setError("Network error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    // --- TV Guide CRUD ---
    const fetchTvGuides = async () => {
        try {
            const res = await fetch("/api/hotel/setup/tv-guide");
            if (res.ok) {
                const data = await res.json();
                setTvGuides(data.data || []);
            }
        } catch { }
    };
    const addTvGuide = async () => {
        const title = tvTitleRef.current?.value.trim();
        if (!title) return;
        await fetch("/api/hotel/setup/tv-guide", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title })
        });
        setShowAddTvModal(false);
        fetchTvGuides();
    };
    const deleteTvGuide = async (id: string) => {
        await fetch(`/api/hotel/setup/tv-guide/${id}`, { method: "DELETE" });
        fetchTvGuides();
    };

    // --- WiFi Guide CRUD ---
    const fetchWifiGuides = async () => {
        try {
            const res = await fetch("/api/hotel/setup/wifi");
            if (res.ok) {
                const data = await res.json();
                setWifiGuides(data.data || []);
            }
        } catch { }
    };
    const addWifiGuide = async () => {
        const name = wifiNameRef.current?.value.trim();
        if (!name) return;
        await fetch("/api/hotel/setup/wifi", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ networkName: name })
        });
        setShowAddWifiModal(false);
        fetchWifiGuides();
    };
    const deleteWifiGuide = async (id: string) => {
        await fetch(`/api/hotel/setup/wifi/${id}`, { method: "DELETE" });
        fetchWifiGuides();
    };

    // --- Food Menu CRUD ---
    const fetchFoodMenus = async () => {
        try {
            const res = await fetch("/api/hotel/setup/food-menu");
            if (res.ok) {
                const data = await res.json();
                setFoodMenus(data.data || []);
            }
        } catch { }
    };
    const addFoodMenu = async () => {
        const name = foodNameRef.current?.value.trim();
        const description = foodDescriptionRef.current?.value.trim();
        const category = foodCategoryRef.current?.value;
        if (!name) return;
        await fetch("/api/hotel/setup/food-menu", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                name, 
                description: description || null,
                category: category || null,
                isActive: true
            })
        });
        setShowAddFoodModal(false);
        fetchFoodMenus();
    };
    const deleteFoodMenu = async (id: string) => {
        await fetch(`/api/hotel/setup/food-menu/${id}`, { method: "DELETE" });
        fetchFoodMenus();
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
                        <Link href="/dashboard" className="btn-minion-secondary">
                            ← Back to Dashboard
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-6 py-12">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">
                        Hotel Profile 🏨
                    </h1>
                    <p className="text-xl text-gray-600">
                        Manage your hotel information and settings
                    </p>
                </div>

                {/* Tabs */}
                <div className="mb-8 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        <button onClick={() => setActiveTab('info')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'info' ? 'border-minion-blue text-minion-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Hotel Info</button>
                        <button onClick={() => setActiveTab('tv')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'tv' ? 'border-minion-blue text-minion-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>TV Guides</button>
                        <button onClick={() => setActiveTab('wifi')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'wifi' ? 'border-minion-blue text-minion-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>WiFi Networks</button>
                        <button onClick={() => setActiveTab('food')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'food' ? 'border-minion-blue text-minion-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Food Menus</button>
                    </nav>
                </div>

                {error && (
                    <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Hotel Info Tab */}
                {activeTab === 'info' && hotel && (
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* ...existing code for hotel info and subscription... */}
                        <div className="lg:col-span-2">
                            <div className="card-minion">
                                {/* ...existing code for hotel info... */}
                                <div className="flex justify-between items-start mb-6">
                                    <h2 className="text-2xl font-bold text-gray-800">Hotel Information</h2>
                                    <Link href="/dashboard/hotel/edit" className="btn-minion">
                                        ✏️ Edit Details
                                    </Link>
                                </div>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="font-semibold text-gray-800 mb-2">Basic Information</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-600">Hotel Name</label>
                                                <p className="text-gray-800 font-medium">{hotel.name}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-600">Total Rooms</label>
                                                <p className="text-gray-800 font-medium">{hotel.totalRooms}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800 mb-2">Contact Information</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-600">Email</label>
                                                <p className="text-gray-800">{hotel.contactEmail}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-600">Phone</label>
                                                <p className="text-gray-800">{hotel.contactPhone}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <h3 className="font-semibold text-gray-800 mb-2">Address</h3>
                                    <div className="text-gray-800">
                                        {hotel.address ? (
                                            <div>
                                                <p>{hotel.address}</p>
                                                <p>{hotel.city}, {hotel.state}</p>
                                                <p>{hotel.country}</p>
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 italic">Address not set</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* ...existing code for subscription and quick actions... */}
                        <div>
                            <div className="card-minion">
                                <h2 className="text-xl font-bold text-gray-800 mb-4">Subscription</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Current Plan</label>
                                        <div className="flex items-center">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${hotel.subscriptionTier === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                                                hotel.subscriptionTier === 'premium' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-green-100 text-green-800'
                                                }`}>
                                                {hotel.subscriptionTier?.charAt(0).toUpperCase() + hotel.subscriptionTier?.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${hotel.subscriptionStatus === 'active' ? 'bg-green-100 text-green-800' :
                                            hotel.subscriptionStatus === 'trial' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                            {hotel.subscriptionStatus.charAt(0).toUpperCase() + hotel.subscriptionStatus.slice(1)}
                                        </span>
                                    </div>
                                    <div className="pt-4">
                                        <Link href="/dashboard/subscription" className="btn-minion w-full">
                                            Manage Subscription
                                        </Link>
                                    </div>
                                </div>
                            </div>
                            <div className="card-minion mt-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
                                <div className="space-y-3">
                                    <Link href="/dashboard/hotel/setup" className="block btn-minion w-full text-center">
                                        🛠️ Hotel Setup
                                    </Link>
                                    <Link href="/dashboard/rooms" className="block btn-minion-secondary w-full text-center">
                                        🛏️ Manage Rooms
                                    </Link>
                                    {session.user.role === "hotel_admin" && (
                                        <Link href="/dashboard/staff" className="block btn-minion-secondary w-full text-center">
                                            👥 Manage Staff
                                        </Link>
                                    )}
                                    <Link href="/dashboard/requests" className="block btn-minion-secondary w-full text-center">
                                        🛎️ Service Requests
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TV Guide Tab */}
                {activeTab === 'tv' && (
                    <div className="card-minion">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-800">TV Guides</h2>
                            <button className="btn-minion" onClick={() => setShowAddTvModal(true)}>+ Add TV Guide</button>
                        </div>
                        {tvGuides.length === 0 ? (
                            <p className="text-gray-500">No TV guides configured yet.</p>
                        ) : (
                            <ul className="divide-y divide-gray-200">
                                {tvGuides.map((guide: any) => (
                                    <li key={guide.id} className="py-3 flex justify-between items-center">
                                        <span className="font-medium text-gray-800">{guide.title}</span>
                                        <button className="btn-minion-danger" onClick={() => deleteTvGuide(guide.id)}>Delete</button>
                                    </li>
                                ))}
                            </ul>
                        )}
                        {/* Add TV Guide Modal */}
                        {showAddTvModal && (
                            <div className="inset-0 flex items-center justify-center z-50 ">
                                <div className="bg-white rounded-lg p-6 w-full border border-black">
                                    <h3 className="text-xl font-bold mb-4">Add TV Guide</h3>
                                    <input ref={tvTitleRef} className="input-minion w-full mb-4" placeholder="Guide Title" />
                                    <div className="flex justify-end space-x-2">
                                        <button className="btn-minion-danger" onClick={() => setShowAddTvModal(false)}>Cancel</button>
                                        <button className="btn-minion" onClick={addTvGuide}>Add</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* WiFi Guide Tab */}
                {activeTab === 'wifi' && (
                    <div className="card-minion">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-800">WiFi Networks</h2>
                            <button className="btn-minion" onClick={() => setShowAddWifiModal(true)}>+ Add WiFi</button>
                        </div>
                        {wifiGuides.length === 0 ? (
                            <p className="text-gray-500">No WiFi networks configured yet.</p>
                        ) : (
                            <ul className="divide-y divide-gray-200">
                                {wifiGuides.map((wifi: any) => (
                                    <li key={wifi.id} className="py-3 flex justify-between items-center">
                                        <span className="font-medium text-gray-800">{wifi.networkName}</span>
                                        <button className="text-red-500 hover:text-red-700" onClick={() => deleteWifiGuide(wifi.id)}>Delete</button>
                                    </li>
                                ))}
                            </ul>
                        )}
                        {/* Add WiFi Modal */}
                        {showAddWifiModal && (
                            <div className="inset-0 flex items-center justify-center">
                                <div className="bg-white rounded-lg p-6 w-full">
                                    <h3 className="text-xl font-bold mb-4">Add WiFi Network</h3>
                                    <input ref={wifiNameRef} className="input-minion w-full mb-4" placeholder="WiFi Network Name" />
                                    <div className="flex justify-end space-x-2">
                                        <button className="btn-minion-secondary" onClick={() => setShowAddWifiModal(false)}>Cancel</button>
                                        <button className="btn-minion" onClick={addWifiGuide}>Add</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Food Menu Tab */}
                {activeTab === 'food' && (
                    <div className="card-minion">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-800">Food Menus</h2>
                            <button className="btn-minion" onClick={() => setShowAddFoodModal(true)}>+ Add Food Menu</button>
                        </div>
                        {foodMenus.length === 0 ? (
                            <p className="text-gray-500">No food menus configured yet.</p>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {foodMenus.map((menu: any) => (
                                    <div key={menu.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="font-semibold text-gray-800">{menu.name}</h3>
                                                {menu.category && (
                                                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mt-1">
                                                        {menu.category}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className={`w-2 h-2 rounded-full ${menu.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                                <button 
                                                    className="text-red-500 hover:text-red-700 text-sm"
                                                    onClick={() => deleteFoodMenu(menu.id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                        {menu.description && (
                                            <p className="text-gray-600 text-sm mb-3">{menu.description}</p>
                                        )}
                                        <div className="flex justify-between items-center text-sm text-gray-500">
                                            <span>{menu.menuItems?.length || 0} items</span>
                                            {menu.availableFrom && menu.availableTo && (
                                                <span>{menu.availableFrom} - {menu.availableTo}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {/* Add Food Menu Modal */}
                        {showAddFoodModal && (
                            <div className="inset-0 flex items-center justify-center z-50 mt-6">
                                <div className="bg-white rounded-lg p-6 w-full border border-black">
                                    <h3 className="text-xl font-bold mb-4">Add Food Menu</h3>
                                    <div className="space-y-4">
                                        <input 
                                            ref={foodNameRef} 
                                            className="input-minion w-full" 
                                            placeholder="Menu Name (e.g., Room Service, Restaurant Menu)" 
                                        />
                                        <textarea 
                                            ref={foodDescriptionRef} 
                                            className="input-minion w-full h-20" 
                                            placeholder="Menu Description (optional)" 
                                        />
                                        <select ref={foodCategoryRef} className="input-minion w-full">
                                            <option value="">Select Category (optional)</option>
                                            <option value="Room Service">Room Service</option>
                                            <option value="Restaurant">Restaurant</option>
                                            <option value="Bar">Bar</option>
                                            <option value="Breakfast">Breakfast</option>
                                            <option value="Lunch">Lunch</option>
                                            <option value="Dinner">Dinner</option>
                                            <option value="Snacks">Snacks</option>
                                        </select>
                                    </div>
                                    <div className="flex justify-end space-x-2 mt-6">
                                        <button className="btn-minion-danger" onClick={() => setShowAddFoodModal(false)}>Cancel</button>
                                        <button className="btn-minion" onClick={addFoodMenu}>Add Menu</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
