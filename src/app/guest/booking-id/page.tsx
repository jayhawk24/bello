"use client";

import Link from "next/link";
import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function BookingIdComponent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [bookingId, setBookingId] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const messageParam = searchParams.get('message');
        if (messageParam) {
            setMessage(messageParam);
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!bookingId.trim()) return;

        setIsLoading(true);
        setError("");

        try {
            const response = await fetch('/api/guest/booking-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId: bookingId.trim() })
            });

            const result = await response.json();

            if (response.ok) {
                // Store guest session info in localStorage for later use
                if (result.booking.sessionToken) {
                    localStorage.setItem('guestSession', JSON.stringify({
                        sessionToken: result.booking.sessionToken,
                        bookingId: result.booking.id,
                        roomId: result.booking.room.id,
                        hotelId: result.booking.room.hotel.id
                    }));
                }

                // Redirect to guest dashboard
                router.push(`/guest/dashboard?bookingId=${result.booking.id}`);
            } else {
                setError(result.error || 'Booking verification failed');
            }
        } catch (error) {
            setError('Network error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center p-6">
            <div className="card-minion max-w-md w-full">
                <div className="text-center mb-6">
                    <div className="inline-block p-4 bg-minion-yellow rounded-full mb-4">
                        <span className="text-4xl">🔑</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Enter Booking ID</h1>
                    <p className="text-gray-600 mt-2">
                        Access your concierge services using your hotel booking reference
                    </p>
                </div>

                {message && (
                    <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-lg mb-6">
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="bookingId" className="form-label">
                            Booking Reference / ID
                        </label>
                        <input
                            type="text"
                            id="bookingId"
                            value={bookingId}
                            onChange={(e) => setBookingId(e.target.value.toUpperCase())}
                            placeholder="e.g., BK12345678"
                            className="input-minion"
                            maxLength={20}
                            required
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            This is usually provided in your booking confirmation email
                        </p>
                    </div>

                    <button
                        type="submit"
                        className="btn-minion w-full"
                        disabled={isLoading || !bookingId.trim()}
                    >
                        {isLoading ? "🔍 Verifying..." : "🚀 Access Services"}
                    </button>
                </form>

                <div className="mt-6">
                    <div className="text-center">
                        <p className="text-sm text-gray-500 mb-3">Don't have a booking ID?</p>
                        <Link href="/guest/qr-scan" className="btn-minion-secondary w-full">
                            📱 Scan QR Code Instead
                        </Link>
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                    <p className="text-sm text-gray-500 mb-3">Need help?</p>
                    <div className="space-y-2">
                        <Link href="/contact" className="text-minion-blue hover:underline block">
                            Contact Hotel Reception
                        </Link>
                        <Link href="/" className="text-gray-500 hover:underline block">
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function BookingIdPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <BookingIdComponent />
        </Suspense>
    );
}