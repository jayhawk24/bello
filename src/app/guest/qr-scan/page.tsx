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
            // Room code format: HOTEL_ID-ROOM_NUMBER-ACCESS_CODE
            // Example: cmectc6bi0002gl61x1ohhqwe-102-N6I42CT8
            const parts = code.trim().split('-');

            if (parts.length !== 3) {
                setError('Invalid room code format. Expected: HOTEL-ROOM-ACCESS');
                return;
            }

            const [hotelId, roomNumber, accessCode] = parts;

            if (!hotelId || !roomNumber || !accessCode) {
                setError('Invalid room code. All parts are required.');
                return;
            }

            // First, validate the room access
            const response = await fetch(`/api/guest/room-access?hotelId=${hotelId}&roomNumber=${roomNumber}&accessCode=${accessCode}`);

            if (response.ok) {
                const data = await response.json();
                // Redirect directly to services page with room information
                router.push(`/guest/services?roomId=${data.room.id}&hotelId=${hotelId}`);
            } else {
                setError('Invalid room code or access denied');
            }
        } catch (error) {
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
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center p-6">
            <div className="card-minion max-w-md w-full text-center">
                <div className="mb-6">
                    <div className="inline-block p-4 bg-minion-yellow rounded-full mb-4">
                        <span className="text-4xl">🏠</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Room Access</h1>
                    <p className="text-gray-600 mt-2">
                        Scan the QR code in your room or enter your room code to access hotel services
                    </p>
                </div>

                <div className="mb-6">
                    {!showScanner ? (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50">
                            <div className="text-4xl mb-2">📷</div>
                            <p className="text-gray-500 mb-4">QR Code Scanner</p>
                            <button
                                onClick={() => setShowScanner(true)}
                                className="btn-minion-secondary"
                            >
                                Start Camera
                            </button>
                            {scannerError && (
                                <p className="text-sm text-red-500 mt-2">{scannerError}</p>
                            )}
                        </div>
                    ) : (
                        <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-black">
                            <div className="relative">
                                {!isStopping ? (
                                    <QRScanner
                                        width={400}
                                        height={300}
                                        onResult={(result) => handleQRCodeScanned(result)}
                                        onError={(error) => handleScannerError(error)}
                                    />
                                ) : (
                                    <div className="w-full h-[300px] bg-black flex items-center justify-center">
                                        <div className="text-white text-center">
                                            <div className="text-2xl mb-2">⏹️</div>
                                            <p>Stopping camera...</p>
                                        </div>
                                    </div>
                                )}
                                <button
                                    onClick={handleStopScanner}
                                    disabled={isStopping}
                                    className={`absolute top-2 right-2 px-3 py-1 rounded-full text-sm z-10 ${isStopping
                                            ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                                            : 'bg-red-500 text-white hover:bg-red-600'
                                        }`}
                                >
                                    {isStopping ? '⏹️ Stopping...' : '✕ Stop'}
                                </button>
                            </div>
                            <div className="bg-gray-800 text-white p-2 text-center text-sm">
                                {isStopping ? 'Stopping camera...' : 'Point your camera at the QR code'}
                            </div>
                        </div>
                    )}
                </div>

                <div className="mb-6">
                    <div className="bg-gray-100 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-3">
                            <strong>Alternative:</strong> Enter your room code manually
                        </p>

                        {(error || scannerError) && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                                {error || scannerError}
                            </div>
                        )}

                        <form onSubmit={handleRoomCodeSubmit} className="space-y-4">
                            <div className="form-group">
                                <label htmlFor="roomCode" className="form-label text-left">
                                    Room Code
                                </label>
                                <input
                                    id="roomCode"
                                    type="text"
                                    value={roomCode}
                                    onChange={(e) => {
                                        setRoomCode(e.target.value.toUpperCase());
                                        setScannerError(""); // Clear scanner error when typing
                                    }}
                                    placeholder="Enter room code (e.g., HOTEL-ROOM-ACCESS)"
                                    className="input-minion text-center font-mono"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    Format: HOTEL-ROOM-ACCESS
                                </p>
                            </div>

                            <button
                                type="submit"
                                className="btn-minion w-full"
                                disabled={isLoading || !roomCode.trim()}
                            >
                                {isLoading ? "🔄 Accessing..." : "🛎️ Access Services"}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="space-y-3">
                    <p className="text-sm text-gray-500">or</p>
                    <Link href="/guest/booking-id" className="btn-minion-secondary w-full">
                        Enter Booking ID Instead
                    </Link>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                    <Link href="/guest" className="text-minion-blue hover:underline">
                        ← Back to Guest Access
                    </Link>
                </div>
            </div>
        </div>
    );
}
