"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Suspense, useState } from "react";

interface Room {
    id: string;
    roomNumber: string;
    roomType: string;
    hotel: {
        id: string;
        name: string;
        contactEmail: string;
        contactPhone: string;
        receptionNumber: string | null;
    };
}

interface Booking {
    id: string;
    bookingReference: string;
    guestName: string;
}

interface Service {
    id: string;
    name: string;
    description: string;
    category: string;
    icon: string;
    price: number;
}

interface HotelWifiNetwork {
    id: string;
    networkName: string;
    password: string | null;
    description: string | null;
    isPublic: boolean;
    bandwidth: string | null;
    coverage: string | null;
    instructions: string | null;
}

interface TvGuideChannelInfo {
    id: string;
    number: number;
    name: string;
    category: string | null;
    language: string | null;
    isHd: boolean;
    logo: string | null;
    description: string | null;
}

interface TvGuideInfo {
    id: string;
    title: string;
    description: string | null;
    category: string | null;
    channels: TvGuideChannelInfo[];
}

interface FoodMenuItemInfo {
    id: string;
    name: string;
    description: string | null;
    price: number | null;
    category: string | null;
    isVegetarian: boolean;
    isVegan: boolean;
    allergens: string[];
    spiceLevel: string | null;
    isAvailable: boolean;
    image: string | null;
    prepTime: string | null;
    calories: number | null;
}

interface FoodMenuInfo {
    id: string;
    name: string;
    description: string | null;
    category: string | null;
    isActive: boolean;
    availableFrom: string | null;
    availableTo: string | null;
    menuItems: FoodMenuItemInfo[];
}

interface HotelInfo {
    receptionNumber: string | null;
    emergencyNumber: string | null;
    checkInTime: string | null;
    checkOutTime: string | null;
    hotelDescription: string | null;
    amenities: string[];
    wifiInfos: HotelWifiNetwork[];
    tvGuides: TvGuideInfo[];
    foodMenus: FoodMenuInfo[];
}

interface RoomAccessResponse {
    success: boolean;
    room: Room;
    booking: Booking | null;
    hotelInfo: HotelInfo | null;
}

function GuestRoomComponent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [room, setRoom] = useState<Room | null>(null);
    const [booking, setBooking] = useState<Booking | null>(null);
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [hotelInfo, setHotelInfo] = useState<HotelInfo | null>(null);
    const [activeQuickView, setActiveQuickView] = useState<"tv" | "wifi" | "food" | null>(null);

    const activeFoodMenus = hotelInfo?.foodMenus.filter((menu) => menu.isActive) ?? [];

    const hotelId = searchParams.get('hotelId');
    const roomNumber = searchParams.get('roomNumber');
    const accessCode = searchParams.get('accessCode');

    useEffect(() => {
        if (!hotelId || !roomNumber || !accessCode) {
            setError("Invalid QR code. Missing room information.");
            setIsLoading(false);
            return;
        }

        fetchRoomInfo();
    }, [hotelId, roomNumber, accessCode]);

    const fetchRoomInfo = async () => {
        try {
            const response = await fetch(`/api/guest/room-access?hotelId=${hotelId}&roomNumber=${roomNumber}&accessCode=${accessCode}`);
            if (response.ok) {
                const data: RoomAccessResponse = await response.json();
                setRoom(data.room);
                setBooking(data.booking);
                setHotelInfo(data.hotelInfo ?? null);

                // Fetch available services for this hotel
                const servicesResponse = await fetch(`/api/guest/services?hotelId=${hotelId}`);
                if (servicesResponse.ok) {
                    const servicesData = await servicesResponse.json();
                    setServices(servicesData.services || []);
                }
            } else {
                setError("Invalid access code or room not found");
            }
        } catch (error) {
            setError("Network error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const handleServiceRequest = (service: Service) => {
        const queryParts = new URLSearchParams();
        if (booking) {
            queryParts.set('bookingId', booking.id);
        } else if (room) {
            queryParts.set('roomId', room.id);
            if (room.hotel?.id) {
                queryParts.set('hotelId', room.hotel.id);
            }
        }

        queryParts.set('serviceId', service.id);
        if (service.category) {
            queryParts.set('category', service.category);
        }

        if (booking) {
            // If there's an active booking, redirect to service request with booking context
            router.push(`/guest/services?${queryParts.toString()}`);
        } else if (room) {
            // If no booking but have room access, redirect to services page with room context
            router.push(`/guest/services?${queryParts.toString()}`);
        } else {
            // If no room access, redirect to booking ID entry
            router.push(`/guest/booking-id?message=Please enter your booking reference to request services`);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center">
                <div className="card-minion text-center">
                    <div className="animate-bounce-slow mb-4">
                        <span className="text-4xl">🛏️</span>
                    </div>
                    <p className="text-gray-600">Verifying room access...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center">
                <div className="card-minion text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <p className="text-sm text-gray-500">
                        Please contact hotel staff for assistance.
                    </p>
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
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-minion-yellow rounded-full flex items-center justify-center">
                            <span className="text-2xl">🏨</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">{room.hotel.name}</h1>
                            <p className="text-gray-600">Guest Services Portal</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-8">
                {/* Welcome Section */}
                <div className="card-minion text-center mb-8">
                    <div className="text-6xl mb-4">🛏️</div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">
                        Welcome to Room {room.roomNumber}
                    </h2>
                    {booking && (
                        <p className="text-lg text-gray-700 mb-2">
                            Hello, {booking.guestName}!
                        </p>
                    )}
                    <p className="text-xl text-gray-600 mb-2">
                        {room.roomType}
                    </p>
                    <p className="text-gray-600">
                        We're here to make your stay comfortable and memorable
                    </p>
                </div>

                {/* Service Categories */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {services.length > 0 ? (
                        services.map((service) => (
                            <div key={service.id} className="card-minion text-center">
                                <div className="text-4xl mb-4">{service.icon || '🏨'}</div>
                                <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
                                <p className="text-gray-600 mb-4">
                                    {service.description}
                                </p>
                                {service.price > 0 && (
                                    <p className="text-sm text-gray-500 mb-4">
                                        Starting from ${service.price}
                                    </p>
                                )}
                                <button
                                    className="btn-minion w-full"
                                    onClick={() => handleServiceRequest(service)}
                                >
                                    Request {service.name}
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-2 text-center py-8">
                            <p className="text-gray-500">Loading services...</p>
                        </div>
                    )}
                </div>

                {/* Hotel Information */}
                <div className="card-minion">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Hotel Information</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold text-gray-800 mb-2">Contact Information</h3>
                            <div className="space-y-2 text-gray-600">
                                <p>📧 {room.hotel.contactEmail}</p>
                                <p>📞 {room.hotel.receptionNumber || room.hotel.contactPhone}</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800 mb-2">Quick Services</h3>
                            <div className="space-y-2">
                                <button
                                    className="btn-minion-secondary w-full text-sm"
                                    onClick={() => setActiveQuickView("tv")}
                                >
                                    📺 TV Guide
                                </button>
                                <button
                                    className="btn-minion-secondary w-full text-sm"
                                    onClick={() => setActiveQuickView("wifi")}
                                >
                                    📶 WiFi Info
                                </button>
                                <button
                                    className="btn-minion-secondary w-full text-sm"
                                    onClick={() => setActiveQuickView("food")}
                                >
                                    🍴 Food Menu
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Emergency Contact */}
                <div className="mt-8 p-4 bg-red-50 rounded-lg border border-red-200 text-center">
                    <p className="text-red-800 font-medium">
                        🚨 For emergencies, call hotel security or dial 112
                    </p>
                    <p className="text-red-600 text-sm mt-1">
                        Front desk: {room.hotel.receptionNumber || room.hotel.contactPhone}
                    </p>
                </div>
            </main>

            {activeQuickView && (
                <div
                    className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 px-4"
                    onClick={() => setActiveQuickView(null)}
                    role="presentation"
                >
                    <div
                        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 relative"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
                            onClick={() => setActiveQuickView(null)}
                            aria-label="Close quick info panel"
                        >
                            ✕
                        </button>

                        {/* Quick info content surfaces selected hotel information */}
                        {activeQuickView === "wifi" && (
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold text-gray-800">WiFi Networks</h3>
                                {hotelInfo && hotelInfo.wifiInfos.length > 0 ? (
                                    hotelInfo.wifiInfos.map((wifi) => (
                                        <div key={wifi.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                            <p className="font-medium text-gray-800">{wifi.networkName}</p>
                                            {wifi.description && (
                                                <p className="text-sm text-gray-600 mt-1">{wifi.description}</p>
                                            )}
                                            <div className="text-sm text-gray-700 mt-3 space-y-1">
                                                <p><span className="font-semibold">Password:</span> {wifi.password || "See front desk"}</p>
                                                {wifi.isPublic && <p><span className="font-semibold">Network Type:</span> Public network</p>}
                                                {wifi.bandwidth && <p><span className="font-semibold">Bandwidth:</span> {wifi.bandwidth}</p>}
                                                {wifi.coverage && <p><span className="font-semibold">Coverage:</span> {wifi.coverage}</p>}
                                                {wifi.instructions && <p><span className="font-semibold">Instructions:</span> {wifi.instructions}</p>}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-600">WiFi details are not available right now. Please contact the front desk for assistance.</p>
                                )}
                            </div>
                        )}

                        {activeQuickView === "tv" && (
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold text-gray-800">TV Guide</h3>
                                {hotelInfo && hotelInfo.tvGuides.length > 0 ? (
                                    hotelInfo.tvGuides.map((guide) => (
                                        <div key={guide.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
                                            <div>
                                                <p className="font-medium text-gray-800">{guide.title}</p>
                                                {guide.description && (
                                                    <p className="text-sm text-gray-600 mt-1">{guide.description}</p>
                                                )}
                                                {guide.category && (
                                                    <p className="text-xs uppercase tracking-wide text-gray-500 mt-2">Category: {guide.category}</p>
                                                )}
                                            </div>
                                            {guide.channels.length > 0 ? (
                                                <div className="space-y-2">
                                                    {guide.channels.map((channel) => (
                                                        <div key={channel.id} className="flex items-start justify-between bg-white rounded-lg border border-gray-200 p-3">
                                                            <div>
                                                                <p className="font-medium text-gray-800">{channel.number}. {channel.name}</p>
                                                                <p className="text-sm text-gray-600">
                                                                    {[channel.category, channel.language, channel.isHd ? "HD" : null]
                                                                        .filter(Boolean)
                                                                        .join(" • ")}
                                                                </p>
                                                                {channel.description && (
                                                                    <p className="text-xs text-gray-500 mt-1">{channel.description}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-600">Channel lineup coming soon.</p>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-600">TV guide information is not available at the moment.</p>
                                )}
                            </div>
                        )}

                        {activeQuickView === "food" && (
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold text-gray-800">Food &amp; Beverage</h3>
                                {hotelInfo && hotelInfo.foodMenus.length > 0 ? (
                                    activeFoodMenus.length > 0 ? (
                                        activeFoodMenus.map((menu) => (
                                            <div key={menu.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
                                                <div>
                                                    <p className="font-medium text-gray-800">{menu.name}</p>
                                                    {menu.description && (
                                                        <p className="text-sm text-gray-600 mt-1">{menu.description}</p>
                                                    )}
                                                    <p className="text-xs uppercase tracking-wide text-gray-500 mt-2">
                                                        {[menu.category, menu.availableFrom && `From ${menu.availableFrom}`, menu.availableTo && `Until ${menu.availableTo}`]
                                                            .filter(Boolean)
                                                            .join(" • ")}
                                                    </p>
                                                </div>
                                                {menu.menuItems.length > 0 ? (
                                                    <div className="space-y-2">
                                                        {menu.menuItems
                                                            .filter((item) => item.isAvailable)
                                                            .map((item) => (
                                                                <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-3">
                                                                    <div className="flex items-start justify-between">
                                                                        <div>
                                                                            <p className="font-medium text-gray-800">{item.name}</p>
                                                                            {item.description && (
                                                                                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                                                            )}
                                                                            <p className="text-xs uppercase tracking-wide text-gray-500 mt-2">
                                                                                {[item.category, item.isVegetarian ? "Vegetarian" : null, item.isVegan ? "Vegan" : null, item.spiceLevel]
                                                                                    .filter(Boolean)
                                                                                    .join(" • ")}
                                                                            </p>
                                                                            {item.allergens.length > 0 && (
                                                                                <p className="text-xs text-red-600 mt-1">Allergens: {item.allergens.join(", ")}</p>
                                                                            )}
                                                                        </div>
                                                                        <div className="text-right">
                                                                            {item.price !== null ? (
                                                                                <p className="font-semibold text-gray-800">${item.price.toFixed(2)}</p>
                                                                            ) : (
                                                                                <p className="font-semibold text-gray-500">Ask for price</p>
                                                                            )}
                                                                            {item.prepTime && (
                                                                                <p className="text-xs text-gray-500 mt-1">Prep: {item.prepTime}</p>
                                                                            )}
                                                                            {item.calories !== null && (
                                                                                <p className="text-xs text-gray-500">{item.calories} kcal</p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-gray-600">Menu items are being updated.</p>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-600">No active menus are available right now.</p>
                                    )
                                ) : (
                                    <p className="text-gray-600">Food and beverage details are not available right now.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function GuestRoomPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <GuestRoomComponent />
        </Suspense>
    );
}