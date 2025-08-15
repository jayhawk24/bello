"use client";

import Link from "next/link";
import { useState } from "react";

export default function BookingIdPage() {
    const [bookingId, setBookingId] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!bookingId.trim()) return;

        setIsLoading(true);
        // TODO: Implement booking ID verification
        setTimeout(() => {
            setIsLoading(false);
            alert("Booking ID verification will be implemented in the next phase!");
        }, 1500);
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

                <form onSubmit={handleSubmit} className="space-y-4">
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
