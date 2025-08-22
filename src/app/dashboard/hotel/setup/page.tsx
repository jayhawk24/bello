"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { HotelInfo, HotelWifi, TvGuide, TvChannel, FoodMenu, MenuItem } from "@/types";

interface SetupData {
    hotelInfo?: HotelInfo;
    wifiNetworks: HotelWifi[];
    tvGuides: TvGuide[];
    foodMenus: FoodMenu[];
}

export default function HotelSetupPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [activeTab, setActiveTab] = useState<"basic" | "wifi" | "tv" | "food">("basic");
    const [hotelId, setHotelId] = useState<string>("");

    // Basic Info State
    const [basicInfo, setBasicInfo] = useState({
        receptionNumber: "",
        emergencyNumber: "",
        checkInTime: "",
        checkOutTime: "",
        hotelDescription: "",
        amenities: [] as string[]
    });

    // WiFi State
    const [wifiNetworks, setWifiNetworks] = useState<HotelWifi[]>([]);
    const [newWifi, setNewWifi] = useState({
        networkName: "",
        password: "",
        description: "",
        isPublic: false,
        bandwidth: "",
        coverage: "",
        instructions: ""
    });

    // TV Guide State
    const [tvGuides, setTvGuides] = useState<TvGuide[]>([]);
    const [newTvGuide, setNewTvGuide] = useState({
        title: "",
        description: "",
        category: ""
    });

    // Food Menu State
    const [foodMenus, setFoodMenus] = useState<FoodMenu[]>([]);
    const [newFoodMenu, setNewFoodMenu] = useState({
        name: "",
        description: "",
        category: "",
        isActive: true,
        availableFrom: "",
        availableTo: ""
    });

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
        fetchSetupData();
    }, [session, status, router]);

    const fetchSetupData = async () => {
        try {
            // First, get the hotel ID for the current user
            const userResponse = await fetch("/api/hotel/profile");
            if (!userResponse.ok) {
                throw new Error("Failed to get hotel information");
            }

            const userData = await userResponse.json();
            const currentHotelId = userData.hotel?.id;

            if (!currentHotelId) {
                throw new Error("No hotel found for user");
            }

            setHotelId(currentHotelId);

            // Now fetch setup data with the hotel ID
            const response = await fetch(`/api/hotel/setup?hotelId=${currentHotelId}`);
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    const setupData: SetupData = data.data;

                    if (setupData.hotelInfo) {
                        setBasicInfo({
                            receptionNumber: setupData.hotelInfo.receptionNumber || "",
                            emergencyNumber: setupData.hotelInfo.emergencyNumber || "",
                            checkInTime: setupData.hotelInfo.checkInTime || "",
                            checkOutTime: setupData.hotelInfo.checkOutTime || "",
                            hotelDescription: setupData.hotelInfo.hotelDescription || "",
                            amenities: setupData.hotelInfo.amenities || []
                        });
                    }

                    setWifiNetworks(setupData.wifiNetworks || []);
                    setTvGuides(setupData.tvGuides || []);
                    setFoodMenus(setupData.foodMenus || []);
                }
            } else {
                console.log("No setup data found, starting fresh");
            }
        } catch (error) {
            console.error("Error fetching setup data:", error);
            setError("Failed to load hotel data");
        } finally {
            setIsLoading(false);
        }
    };

    const saveBasicInfo = async () => {
        if (!hotelId) {
            setError("Hotel ID not found");
            return;
        }

        setIsSaving(true);
        setError("");
        setSuccess("");

        try {
            const response = await fetch("/api/hotel/setup/basic", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    hotelId,
                    ...basicInfo
                })
            });

            const data = await response.json();
            if (data.success) {
                setSuccess("Basic information saved successfully!");
            } else {
                setError(data.error || "Failed to save basic information");
            }
        } catch (error) {
            setError("Network error occurred");
        } finally {
            setIsSaving(false);
        }
    };

    const addWifiNetwork = async () => {
        if (!newWifi.networkName.trim()) return;
        if (!hotelId) {
            setError("Hotel ID not found");
            return;
        }

        setIsSaving(true);
        try {
            const response = await fetch("/api/hotel/setup/wifi", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    hotelId,
                    ...newWifi
                })
            });

            const data = await response.json();
            if (data.success) {
                setWifiNetworks([...wifiNetworks, data.data]);
                setNewWifi({
                    networkName: "",
                    password: "",
                    description: "",
                    isPublic: false,
                    bandwidth: "",
                    coverage: "",
                    instructions: ""
                });
                setSuccess("WiFi network added successfully!");
            } else {
                setError(data.error || "Failed to add WiFi network");
            }
        } catch (error) {
            setError("Network error occurred");
        } finally {
            setIsSaving(false);
        }
    };

    const removeWifiNetwork = async (wifiId: string) => {
        try {
            const response = await fetch(`/api/hotel/setup/wifi/${wifiId}`, {
                method: "DELETE"
            });

            if (response.ok) {
                setWifiNetworks(wifiNetworks.filter(wifi => wifi.id !== wifiId));
                setSuccess("WiFi network removed successfully!");
            }
        } catch (error) {
            setError("Failed to remove WiFi network");
        }
    };

    const addTvGuide = async () => {
        if (!newTvGuide.title.trim()) return;

        setIsSaving(true);
        try {
            const response = await fetch("/api/hotel/setup/tv-guide", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...newTvGuide,
                    channels: [] // Start with empty channels, can be added later
                })
            });

            const data = await response.json();
            if (data.success) {
                setTvGuides([...tvGuides, data.data]);
                setNewTvGuide({
                    title: "",
                    description: "",
                    category: ""
                });
                setSuccess("TV Guide added successfully!");
            } else {
                setError(data.error || "Failed to add TV Guide");
            }
        } catch (error) {
            setError("Network error occurred");
        } finally {
            setIsSaving(false);
        }
    };

    const addFoodMenu = async () => {
        if (!newFoodMenu.name.trim()) return;

        setIsSaving(true);
        try {
            const response = await fetch("/api/hotel/setup/food-menu", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...newFoodMenu,
                    menuItems: [] // Start with empty menu items, can be added later
                })
            });

            const data = await response.json();
            if (data.success) {
                setFoodMenus([...foodMenus, data.data]);
                setNewFoodMenu({
                    name: "",
                    description: "",
                    category: "",
                    isActive: true,
                    availableFrom: "",
                    availableTo: ""
                });
                setSuccess("Food Menu added successfully!");
            } else {
                setError(data.error || "Failed to add Food Menu");
            }
        } catch (error) {
            setError("Network error occurred");
        } finally {
            setIsSaving(false);
        }
    };

    const addAmenity = () => {
        const amenity = (document.getElementById('newAmenity') as HTMLInputElement)?.value;
        if (amenity && !basicInfo.amenities.includes(amenity)) {
            setBasicInfo({
                ...basicInfo,
                amenities: [...basicInfo.amenities, amenity]
            });
            (document.getElementById('newAmenity') as HTMLInputElement).value = '';
        }
    };

    const removeAmenity = (amenity: string) => {
        setBasicInfo({
            ...basicInfo,
            amenities: basicInfo.amenities.filter(a => a !== amenity)
        });
    };

    if (status === "loading" || isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center">
                <div className="card-minion text-center">
                    <div className="animate-bounce-slow mb-4">
                        <span className="text-4xl">🏨</span>
                    </div>
                    <p className="text-gray-600">Loading hotel setup...</p>
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
                            ← Back to Hotel Profile
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-6 py-12">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">
                        Hotel Setup 🛠️
                    </h1>
                    <p className="text-xl text-gray-600">
                        Configure your hotel's information, amenities, and guest services
                    </p>
                </div>

                {/* Alert Messages */}
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

                {/* Tab Navigation */}
                <div className="mb-8">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab("basic")}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === "basic"
                                        ? "border-minion-blue text-minion-blue"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    }`}
                            >
                                🏨 Basic Info
                            </button>
                            <button
                                onClick={() => setActiveTab("wifi")}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === "wifi"
                                        ? "border-minion-blue text-minion-blue"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    }`}
                            >
                                📶 WiFi Networks
                            </button>
                            <button
                                onClick={() => setActiveTab("tv")}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === "tv"
                                        ? "border-minion-blue text-minion-blue"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    }`}
                            >
                                📺 TV Guides
                            </button>
                            <button
                                onClick={() => setActiveTab("food")}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === "food"
                                        ? "border-minion-blue text-minion-blue"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    }`}
                            >
                                🍽️ Food Menus
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === "basic" && (
                    <div className="card-minion">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Basic Hotel Information</h2>

                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Reception Number
                                </label>
                                <input
                                    type="tel"
                                    value={basicInfo.receptionNumber}
                                    onChange={(e) => setBasicInfo({ ...basicInfo, receptionNumber: e.target.value })}
                                    className="input-minion w-full"
                                    placeholder="e.g., +91 98765 43210"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Emergency Number
                                </label>
                                <input
                                    type="tel"
                                    value={basicInfo.emergencyNumber}
                                    onChange={(e) => setBasicInfo({ ...basicInfo, emergencyNumber: e.target.value })}
                                    className="input-minion w-full"
                                    placeholder="e.g., +91 98765 43210"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Check-in Time
                                </label>
                                <input
                                    type="time"
                                    value={basicInfo.checkInTime}
                                    onChange={(e) => setBasicInfo({ ...basicInfo, checkInTime: e.target.value })}
                                    className="input-minion w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Check-out Time
                                </label>
                                <input
                                    type="time"
                                    value={basicInfo.checkOutTime}
                                    onChange={(e) => setBasicInfo({ ...basicInfo, checkOutTime: e.target.value })}
                                    className="input-minion w-full"
                                />
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Hotel Description
                            </label>
                            <textarea
                                value={basicInfo.hotelDescription}
                                onChange={(e) => setBasicInfo({ ...basicInfo, hotelDescription: e.target.value })}
                                rows={4}
                                className="input-minion w-full"
                                placeholder="Brief description of your hotel..."
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Hotel Amenities
                            </label>
                            <div className="flex space-x-2 mb-3">
                                <input
                                    id="newAmenity"
                                    type="text"
                                    className="input-minion flex-1"
                                    placeholder="Enter amenity name..."
                                    onKeyDown={(e) => e.key === 'Enter' && addAmenity()}
                                />
                                <button
                                    onClick={addAmenity}
                                    className="btn-minion"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {basicInfo.amenities.map((amenity, index) => (
                                    <span
                                        key={index}
                                        className="bg-minion-yellow px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                                    >
                                        <span>{amenity}</span>
                                        <button
                                            onClick={() => removeAmenity(amenity)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={saveBasicInfo}
                            disabled={isSaving}
                            className="btn-minion"
                        >
                            {isSaving ? "Saving..." : "Save Basic Information"}
                        </button>
                    </div>
                )}

                {activeTab === "wifi" && (
                    <div className="space-y-6">
                        {/* Add WiFi Form */}
                        <div className="card-minion">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Add WiFi Network</h3>

                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Network Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={newWifi.networkName}
                                        onChange={(e) => setNewWifi({ ...newWifi, networkName: e.target.value })}
                                        className="input-minion w-full"
                                        placeholder="e.g., Hotel_Guest_WiFi"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Password
                                    </label>
                                    <input
                                        type="text"
                                        value={newWifi.password}
                                        onChange={(e) => setNewWifi({ ...newWifi, password: e.target.value })}
                                        className="input-minion w-full"
                                        placeholder="WiFi password"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <input
                                        type="text"
                                        value={newWifi.description}
                                        onChange={(e) => setNewWifi({ ...newWifi, description: e.target.value })}
                                        className="input-minion w-full"
                                        placeholder="e.g., Main Lobby WiFi"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Coverage Area
                                    </label>
                                    <input
                                        type="text"
                                        value={newWifi.coverage}
                                        onChange={(e) => setNewWifi({ ...newWifi, coverage: e.target.value })}
                                        className="input-minion w-full"
                                        placeholder="e.g., Entire Hotel"
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={newWifi.isPublic}
                                        onChange={(e) => setNewWifi({ ...newWifi, isPublic: e.target.checked })}
                                        className="mr-2"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Public Network (no password required)</span>
                                </label>
                            </div>

                            <button
                                onClick={addWifiNetwork}
                                disabled={!newWifi.networkName.trim() || isSaving}
                                className="btn-minion"
                            >
                                Add WiFi Network
                            </button>
                        </div>

                        {/* WiFi Networks List */}
                        <div className="card-minion">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Configured WiFi Networks</h3>

                            {wifiNetworks.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No WiFi networks configured yet.</p>
                            ) : (
                                <div className="space-y-4">
                                    {wifiNetworks.map((wifi) => (
                                        <div key={wifi.id} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-semibold text-gray-800">{wifi.networkName}</h4>
                                                <button
                                                    onClick={() => removeWifiNetwork(wifi.id)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    🗑️ Remove
                                                </button>
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                                                {wifi.password && <p><strong>Password:</strong> {wifi.password}</p>}
                                                {wifi.description && <p><strong>Description:</strong> {wifi.description}</p>}
                                                {wifi.coverage && <p><strong>Coverage:</strong> {wifi.coverage}</p>}
                                                <p><strong>Type:</strong> {wifi.isPublic ? "Public" : "Password Protected"}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "tv" && (
                    <div className="space-y-6">
                        {/* Add TV Guide Form */}
                        <div className="card-minion">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Add TV Guide</h3>

                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Guide Title *
                                    </label>
                                    <input
                                        type="text"
                                        value={newTvGuide.title}
                                        onChange={(e) => setNewTvGuide({ ...newTvGuide, title: e.target.value })}
                                        className="input-minion w-full"
                                        placeholder="e.g., Premium Channels, Sports Package"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category
                                    </label>
                                    <select
                                        value={newTvGuide.category}
                                        onChange={(e) => setNewTvGuide({ ...newTvGuide, category: e.target.value })}
                                        className="input-minion w-full"
                                    >
                                        <option value="">Select Category</option>
                                        <option value="Entertainment">Entertainment</option>
                                        <option value="News">News</option>
                                        <option value="Sports">Sports</option>
                                        <option value="Movies">Movies</option>
                                        <option value="Kids">Kids</option>
                                        <option value="Music">Music</option>
                                        <option value="Regional">Regional</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={newTvGuide.description}
                                    onChange={(e) => setNewTvGuide({ ...newTvGuide, description: e.target.value })}
                                    rows={3}
                                    className="input-minion w-full"
                                    placeholder="Brief description of this TV guide..."
                                />
                            </div>

                            <button
                                onClick={addTvGuide}
                                disabled={!newTvGuide.title.trim() || isSaving}
                                className="btn-minion"
                            >
                                Add TV Guide
                            </button>
                        </div>

                        {/* TV Guides List */}
                        <div className="card-minion">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">TV Guides</h3>

                            {tvGuides.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No TV guides configured yet.</p>
                            ) : (
                                <div className="space-y-4">
                                    {tvGuides.map((guide) => (
                                        <div key={guide.id} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-semibold text-gray-800">{guide.title}</h4>
                                                <span className="text-sm bg-minion-yellow px-2 py-1 rounded">
                                                    {guide.category || 'General'}
                                                </span>
                                            </div>
                                            {guide.description && (
                                                <p className="text-gray-600 mb-2">{guide.description}</p>
                                            )}
                                            <p className="text-sm text-gray-500">
                                                {guide.channels.length} channel{guide.channels.length !== 1 ? 's' : ''} configured
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "food" && (
                    <div className="space-y-6">
                        {/* Add Food Menu Form */}
                        <div className="card-minion">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Add Food Menu</h3>

                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Menu Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={newFoodMenu.name}
                                        onChange={(e) => setNewFoodMenu({ ...newFoodMenu, name: e.target.value })}
                                        className="input-minion w-full"
                                        placeholder="e.g., Room Service Menu, Restaurant Menu"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category
                                    </label>
                                    <select
                                        value={newFoodMenu.category}
                                        onChange={(e) => setNewFoodMenu({ ...newFoodMenu, category: e.target.value })}
                                        className="input-minion w-full"
                                    >
                                        <option value="">Select Category</option>
                                        <option value="Room Service">Room Service</option>
                                        <option value="Restaurant">Restaurant</option>
                                        <option value="Bar">Bar</option>
                                        <option value="Breakfast">Breakfast</option>
                                        <option value="Lunch">Lunch</option>
                                        <option value="Dinner">Dinner</option>
                                        <option value="Snacks">Snacks</option>
                                        <option value="Beverages">Beverages</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Available From
                                    </label>
                                    <input
                                        type="time"
                                        value={newFoodMenu.availableFrom}
                                        onChange={(e) => setNewFoodMenu({ ...newFoodMenu, availableFrom: e.target.value })}
                                        className="input-minion w-full"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Available To
                                    </label>
                                    <input
                                        type="time"
                                        value={newFoodMenu.availableTo}
                                        onChange={(e) => setNewFoodMenu({ ...newFoodMenu, availableTo: e.target.value })}
                                        className="input-minion w-full"
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={newFoodMenu.description}
                                    onChange={(e) => setNewFoodMenu({ ...newFoodMenu, description: e.target.value })}
                                    rows={3}
                                    className="input-minion w-full"
                                    placeholder="Brief description of this menu..."
                                />
                            </div>

                            <div className="mb-4">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={newFoodMenu.isActive}
                                        onChange={(e) => setNewFoodMenu({ ...newFoodMenu, isActive: e.target.checked })}
                                        className="mr-2"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Menu is Active</span>
                                </label>
                            </div>

                            <button
                                onClick={addFoodMenu}
                                disabled={!newFoodMenu.name.trim() || isSaving}
                                className="btn-minion"
                            >
                                Add Food Menu
                            </button>
                        </div>

                        {/* Food Menus List */}
                        <div className="card-minion">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Food Menus</h3>

                            {foodMenus.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No food menus configured yet.</p>
                            ) : (
                                <div className="space-y-4">
                                    {foodMenus.map((menu) => (
                                        <div key={menu.id} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-semibold text-gray-800">{menu.name}</h4>
                                                <div className="flex space-x-2">
                                                    <span className={`text-sm px-2 py-1 rounded ${menu.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {menu.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                    {menu.category && (
                                                        <span className="text-sm bg-minion-yellow px-2 py-1 rounded">
                                                            {menu.category}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {menu.description && (
                                                <p className="text-gray-600 mb-2">{menu.description}</p>
                                            )}
                                            <div className="text-sm text-gray-500 space-y-1">
                                                {(menu.availableFrom || menu.availableTo) && (
                                                    <p>
                                                        <strong>Hours:</strong> {menu.availableFrom || 'Open'} - {menu.availableTo || 'Close'}
                                                    </p>
                                                )}
                                                <p>{menu.menuItems.length} item{menu.menuItems.length !== 1 ? 's' : ''} configured</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
