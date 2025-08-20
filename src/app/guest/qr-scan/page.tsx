"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Dynamically import our custom QR scanner to avoid SSR issues
const QRScanner = dynamic(
    () => import("@/components/QRScanner"),
    { ssr: false }
);

export default function QRScanPage() {
    const router = useRouter();
    const [roomCode, setRoomCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [showScanner, setShowScanner] = useState(false);
    const [scannerError, setScannerError] = useState("");
    const [isStopping, setIsStopping] = useState(false);

    const handleQRCodeScanned = (result: string) => {
        if (result) {
            setRoomCode(result);
            setShowScanner(false);
            setIsStopping(false);
            // Automatically process the scanned code
            processRoomCode(result);
        }
    };

    const handleScannerError = (error: string) => {
        setScannerError(error);
        setShowScanner(false);
        setIsStopping(false);
    };

    const handleStopScanner = () => {
        setIsStopping(true);
        // Add a small delay to allow for cleanup, then hide scanner
        setTimeout(() => {
            setShowScanner(false);
            setIsStopping(false);
        }, 500);
    };

    const processRoomCode = async (code: string) => {
        setIsLoading(true);
        setError("");

        try {
            let hotelId: string, roomNumber: string, accessCode: string;

            // Check if the scanned code is a URL (QR code format)
            if (code.includes('http') && code.includes('/guest/room')) {
                try {
                    const url = new URL(code);
                    const urlHotelId = url.searchParams.get('hotelId');
                    const urlRoomNumber = url.searchParams.get('roomNumber');
                    const urlAccessCode = url.searchParams.get('accessCode');
                    
                    if (!urlHotelId || !urlRoomNumber || !urlAccessCode) {
                        setError('Invalid QR code. Missing required room information.');
                        return;
                    }
                    
                    hotelId = urlHotelId;
                    roomNumber = urlRoomNumber;
                    accessCode = urlAccessCode;
                } catch (urlError) {
                    setError('Invalid QR code URL format.');
                    return;
                }
            } else {
                // Legacy format: HOTEL_ID-ROOM_NUMBER-ACCESS_CODE
                const parts = code.trim().split('-');

                if (parts.length !== 3) {
                    setError('Invalid room code format. Expected: HOTEL-ROOM-ACCESS');
                    return;
                }

                const [legacyHotelId, legacyRoomNumber, legacyAccessCode] = parts;

                if (!legacyHotelId || !legacyRoomNumber || !legacyAccessCode) {
                    setError('Invalid room code. All parts are required.');
                    return;
                }

                hotelId = legacyHotelId;
                roomNumber = legacyRoomNumber;
                accessCode = legacyAccessCode;
            }

            // Validate the room access
            const response = await fetch(`/api/guest/room-access?hotelId=${hotelId}&roomNumber=${roomNumber}&accessCode=${accessCode}`);

            if (response.ok) {
                const data = await response.json();
                // Redirect directly to services page with room information
                router.push(`/guest/services?roomId=${data.room.id}&hotelId=${hotelId}`);
            } else {
                setError('Invalid room code or access denied');
            }
        } catch (error) {
            console.error('Error processing room code:', error);
            setError('Error processing room code');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRoomCodeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!roomCode.trim()) return;
        await processRoomCode(roomCode);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-yellow-50 to-pink-50 flex items-center justify-center p-6">
            <div className="card-minion max-w-md w-full text-center relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <div className="absolute top-4 left-4 text-6xl">✨</div>
                    <div className="absolute top-8 right-8 text-4xl">🏨</div>
                    <div className="absolute bottom-8 left-8 text-5xl">🛎️</div>
                    <div className="absolute bottom-4 right-4 text-6xl">⭐</div>
                </div>

                <div className="relative z-10">
                    <div className="mb-6">
                        <div className="inline-block p-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full mb-6 shadow-lg">
                            <span className="text-5xl">🏠</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">✨ Premium Access ✨</h1>
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-full mx-4 mb-4 font-bold text-lg shadow-lg">
                            🌟 Scan to Unlock Luxury Services 🌟
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Point your camera at the stylish room QR code to instantly access our exclusive concierge services and premium amenities
                        </p>
                    </div>

                    <div className="mb-8">
                        {!showScanner ? (
                            <div className="border-2 border-dashed border-purple-300 rounded-2xl p-8 bg-gradient-to-br from-white to-purple-50 shadow-inner">
                                <div className="text-6xl mb-4 animate-bounce">�</div>
                                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-full text-sm font-semibold mb-4">
                                    🎯 QR Code Magic Scanner
                                </div>
                                <p className="text-gray-600 mb-6 text-sm">Ready to unlock your premium experience?</p>
                                <button
                                    onClick={() => setShowScanner(true)}
                                    className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-4 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200 text-lg"
                                >
                                    🚀 Launch Scanner
                                </button>
                                {scannerError && (
                                    <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mt-4 text-sm">
                                        {scannerError}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="border-4 border-yellow-400 rounded-2xl overflow-hidden bg-black shadow-2xl">
                                <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 text-center font-bold text-sm">
                                    🎯 Premium Scanner Active • Point & Scan for Magic ✨
                                </div>
                                <div className="relative">
                                    {!isStopping ? (
                                        <div className="relative">
                                            <QRScanner
                                                width={400}
                                                height={300}
                                                onResult={(result) => handleQRCodeScanned(result)}
                                                onError={(error) => handleScannerError(error)}
                                            />
                                            {/* Animated scanning line */}
                                            <div className="absolute inset-0 pointer-events-none">
                                                <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent animate-pulse"></div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-full h-[300px] bg-black flex items-center justify-center">
                                            <div className="text-white text-center">
                                                <div className="text-4xl mb-4 animate-spin">⏹️</div>
                                                <p className="text-lg">Securing camera...</p>
                                            </div>
                                        </div>
                                    )}
                                    <button
                                        onClick={handleStopScanner}
                                        disabled={isStopping}
                                        className={`absolute top-2 right-2 px-4 py-2 rounded-full text-sm z-20 font-bold shadow-lg ${isStopping
                                                ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                                                : 'bg-red-500 hover:bg-red-600 text-white transform hover:scale-105 transition-all duration-200'
                                            }`}
                                    >
                                        {isStopping ? '⏹️ Securing...' : '✕ Stop Scanner'}
                                    </button>
                                </div>
                                <div className="bg-gradient-to-r from-gray-800 to-black text-white p-3 text-center text-sm font-medium">
                                    {isStopping ? (
                                        <span>🔒 Securing camera connection...</span>
                                    ) : (
                                        <span className="animate-pulse">🎯 Hold steady • Looking for QR magic ✨</span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mb-8">
                        <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl shadow-lg border-2 border-gray-100">
                            <div className="flex items-center justify-center mb-4">
                                <span className="text-2xl mr-2">💡</span>
                                <p className="text-sm text-gray-600 font-medium">
                                    <strong>Alternative Access:</strong> Manual room code entry
                                </p>
                            </div>

                            {(error || scannerError) && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                                    <span className="text-lg mr-2">⚠️</span>
                                    {error || scannerError}
                                </div>
                            )}

                            <form onSubmit={handleRoomCodeSubmit} className="space-y-4">
                                <div className="form-group">
                                    <label htmlFor="roomCode" className="form-label text-left font-semibold text-gray-700">
                                        🏷️ Room Access Code
                                    </label>
                                    <input
                                        id="roomCode"
                                        type="text"
                                        value={roomCode}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            // Only uppercase if it's not a URL
                                            setRoomCode(value.includes('http') ? value : value.toUpperCase());
                                            setScannerError(""); // Clear scanner error when typing
                                        }}
                                        placeholder="Paste your room URL or enter code"
                                        className="input-minion text-center font-mono border-2 border-purple-200 focus:border-purple-500 rounded-xl py-3"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-2">
                                        ✅ Accepts: Room URL or HOTEL-ROOM-ACCESS format
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl w-full shadow-lg transform hover:scale-105 transition-all duration-200"
                                    disabled={isLoading || !roomCode.trim()}
                                >
                                    {isLoading ? (
                                        <span className="flex items-center justify-center">
                                            <span className="animate-spin mr-2">🔄</span>
                                            Accessing your luxury suite...
                                        </span>
                                    ) : (
                                        <span>� Access Premium Services</span>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-center space-x-2 text-gray-500">
                            <span className="w-8 h-px bg-gray-300"></span>
                            <span className="text-sm font-medium">or</span>
                            <span className="w-8 h-px bg-gray-300"></span>
                        </div>
                        <Link href="/guest/booking-id" className="btn-minion-secondary w-full transform hover:scale-105 transition-all duration-200 shadow-lg">
                            📋 Enter Booking ID Instead
                        </Link>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <Link href="/guest" className="text-purple-600 hover:text-purple-800 hover:underline font-medium">
                            ← Back to Guest Portal
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
