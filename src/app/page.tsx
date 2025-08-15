import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100">
      {/* Navigation */}
      <nav className="nav-minion px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-minion-yellow rounded-full flex items-center justify-center">
              <span className="text-2xl">🏨</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Bello</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/guest" className="text-gray-600 hover:text-minion-blue transition-colors">
              Guest Access
            </Link>
            <Link href="/auth/login" className="btn-minion-secondary">
              Hotel Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <div className="mb-8">
            <div className="inline-block p-4 bg-minion-yellow rounded-full animate-bounce-slow mb-6">
              <span className="text-6xl">🛎️</span>
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
            Premium <span className="text-minion-yellow">Concierge</span>
            <br />
            Services for Hotels
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transform your hotel guest experience with our comprehensive concierge platform. 
            Seamless service requests, real-time communication, and personalized assistance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register" className="btn-minion text-lg px-8 py-4">
              Start Free Trial
            </Link>
            <Link href="#features" className="btn-minion-secondary text-lg px-8 py-4">
              Learn More
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Everything Your Hotel Needs
            </h2>
            <p className="text-xl text-gray-600">
              Streamline operations and delight guests with our comprehensive platform
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="card-minion text-center animate-fade-in">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-semibold mb-3">QR Code Access</h3>
              <p className="text-gray-600">
                Guests scan room QR codes for instant access to concierge services. 
                No downloads required.
              </p>
            </div>

            <div className="card-minion text-center animate-fade-in">
              <div className="text-4xl mb-4">🛎️</div>
              <h3 className="text-xl font-semibold mb-3">Service Requests</h3>
              <p className="text-gray-600">
                Room service, housekeeping, transportation, and local recommendations 
                all in one platform.
              </p>
            </div>

            <div className="card-minion text-center animate-fade-in">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-3">Analytics Dashboard</h3>
              <p className="text-gray-600">
                Track occupancy rates, guest satisfaction, and service performance 
                with detailed insights.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that fits your hotel size
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card-minion text-center">
              <h3 className="text-2xl font-bold mb-4">Basic</h3>
              <div className="text-3xl font-bold text-minion-yellow mb-4">$99<span className="text-base text-gray-500">/month</span></div>
              <ul className="text-left space-y-2 mb-6">
                <li>✅ 1 Hotel</li>
                <li>✅ Up to 20 rooms</li>
                <li>✅ Basic analytics</li>
                <li>✅ Email support</li>
              </ul>
              <Link href="/auth/register?plan=basic" className="btn-minion w-full">
                Get Started
              </Link>
            </div>

            <div className="card-minion text-center border-minion-yellow border-2 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-minion-yellow text-gray-800 px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold mb-4">Premium</h3>
              <div className="text-3xl font-bold text-minion-yellow mb-4">$299<span className="text-base text-gray-500">/month</span></div>
              <ul className="text-left space-y-2 mb-6">
                <li>✅ Up to 5 Hotels</li>
                <li>✅ Up to 50 rooms each</li>
                <li>✅ Advanced analytics</li>
                <li>✅ Priority support</li>
                <li>✅ Custom branding</li>
              </ul>
              <Link href="/auth/register?plan=premium" className="btn-minion w-full">
                Get Started
              </Link>
            </div>

            <div className="card-minion text-center">
              <h3 className="text-2xl font-bold mb-4">Enterprise</h3>
              <div className="text-3xl font-bold text-minion-yellow mb-4">$699<span className="text-base text-gray-500">/month</span></div>
              <ul className="text-left space-y-2 mb-6">
                <li>✅ 10+ Hotels</li>
                <li>✅ Unlimited rooms</li>
                <li>✅ Full analytics suite</li>
                <li>✅ 24/7 phone support</li>
                <li>✅ API access</li>
              </ul>
              <Link href="/auth/register?plan=enterprise" className="btn-minion w-full">
                Get Started
              </Link>
            </div>
          </div>
        </section>

        {/* Guest Access Section */}
        <section className="py-16 bg-white rounded-3xl shadow-lg mt-16">
          <div className="text-center px-8">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Guest Access
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Already staying at a partner hotel? Access concierge services instantly
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Link href="/guest/qr-scan" className="btn-minion">
                📱 Scan QR Code
              </Link>
              <Link href="/guest/booking-id" className="btn-minion-secondary">
                🔑 Enter Booking ID
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-minion-yellow rounded-full flex items-center justify-center">
              <span className="text-lg">🏨</span>
            </div>
            <h3 className="text-xl font-bold">Bello</h3>
          </div>
          <p className="text-gray-400 mb-4">
            Premium concierge services for the modern hotel industry
          </p>
          <div className="flex justify-center space-x-6 text-sm">
            <Link href="/privacy" className="hover:text-minion-yellow transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-minion-yellow transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-minion-yellow transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
