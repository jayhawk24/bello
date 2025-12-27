import Link from "next/link";
import PricingSection from "@/components/PricingSection";
import LogoMark from "@/components/LogoMark";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100">
      {/* Navigation */}
      <nav className="nav-minion px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-minion-yellow rounded-full flex items-center justify-center">
              <LogoMark size={28} priority />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">StayScan</h1>
          </div>
          <div className="flex items-center space-x-4 ml-5">
            <Link href="/guest" className="btn-minion">
              Guest Access
            </Link>
            <Link href="/login" className="btn-minion-secondary">
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
            <Link href="/register" className="btn-minion text-lg px-8 py-4">
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

        <PricingSection />

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
              <LogoMark size={20} />
            </div>
            <h3 className="text-xl font-bold">StayScan</h3>
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
