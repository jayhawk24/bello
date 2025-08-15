import Link from "next/link";

export default function GuestAccess() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100">
            {/* Navigation */}
            <nav className="nav-minion px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-minion-yellow rounded-full flex items-center justify-center">
                            <span className="text-2xl">🏨</span>
                        </div>
                        <Link href="/" className="text-2xl font-bold text-gray-800 hover:text-minion-blue transition-colors">
                            Bello
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link href="/login" className="text-gray-600 hover:text-minion-blue transition-colors">
                            Hotel Login
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-6 py-16">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <div className="mb-8">
                        <div className="inline-block p-6 bg-minion-yellow rounded-full animate-bounce-slow mb-6">
                            <span className="text-6xl">🛎️</span>
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                        Welcome <span className="text-minion-yellow">Guest!</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Access our concierge services instantly. Choose your preferred method to get started.
                    </p>
                </div>

                {/* Access Methods */}
                <div className="grid md:grid-cols-2 gap-8 mb-16">
                    {/* QR Code Access */}
                    <div className="card-minion text-center p-8">
                        <div className="text-6xl mb-6">📱</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Scan QR Code</h2>
                        <p className="text-gray-600 mb-6">
                            Found a QR code in your hotel room? Scan it for instant access to all concierge services.
                        </p>
                        <Link href="/guest/qr-scan" className="btn-minion w-full text-lg py-3">
                            📱 Open QR Scanner
                        </Link>
                    </div>

                    {/* Booking ID Access */}
                    <div className="card-minion text-center p-8">
                        <div className="text-6xl mb-6">🔑</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Enter Booking ID</h2>
                        <p className="text-gray-600 mb-6">
                            Have your booking confirmation? Enter your booking ID to access personalized services.
                        </p>
                        <Link href="/guest/booking-id" className="btn-minion-secondary w-full text-lg py-3">
                            🔑 Enter Booking ID
                        </Link>
                    </div>
                </div>

                {/* Guest Registration Option */}
                <div className="card-minion text-center p-8 bg-white">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                        Want to Create an Account?
                    </h3>
                    <p className="text-gray-600 mb-6">
                        Create a guest account to save your preferences and access your service history across all stays.
                    </p>
                    <Link href="/register?type=guest" className="btn-minion-secondary">
                        Create Guest Account
                    </Link>
                </div>

                {/* Information Cards */}
                <div className="grid md:grid-cols-3 gap-6 mt-16">
                    <div className="text-center">
                        <div className="text-3xl mb-3">🍽️</div>
                        <h4 className="font-semibold text-gray-800 mb-2">Room Service</h4>
                        <p className="text-sm text-gray-600">Order food and beverages directly to your room</p>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl mb-3">🧹</div>
                        <h4 className="font-semibold text-gray-800 mb-2">Housekeeping</h4>
                        <p className="text-sm text-gray-600">Request cleaning services and amenities</p>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl mb-3">🗺️</div>
                        <h4 className="font-semibold text-gray-800 mb-2">Local Guide</h4>
                        <p className="text-sm text-gray-600">Get recommendations for dining and attractions</p>
                    </div>
                </div>
            </main>

            {/* Back to Home */}
            <div className="text-center pb-16">
                <Link href="/" className="text-minion-blue hover:text-minion-yellow transition-colors font-medium">
                    ← Back to Home
                </Link>
            </div>
        </div>
    );
}
