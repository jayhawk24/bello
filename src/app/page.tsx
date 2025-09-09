"use client"
import Image from "next/image";
import Link from "next/link";
import { useState } from 'react';
import { Switch } from '@headlessui/react';

export default function Home() {
  const [isAnnual, setIsAnnual] = useState(false);

  // Helper function to calculate pricing
  const getPrice = (monthlyPrice: number) => {
    if (isAnnual) {
      return Math.floor(monthlyPrice * 12 * 0.8); // 20% discount for annual (full year price)
    }
    return monthlyPrice;
  };

  const getPeriod = () => isAnnual ? '/year' : '/month';
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

        {/* Pricing Section */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Simple, Room-Based Pricing
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Pay only for the rooms you manage - perfect for hotels of any size
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <span className={`text-sm ${!isAnnual ? 'font-bold text-yellow-600' : 'text-gray-500'}`}>Monthly</span>
              <Switch
                checked={isAnnual}
                onChange={setIsAnnual}
                className={`${isAnnual ? 'bg-yellow-600' : 'bg-gray-400'}
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
              >
                <span
                  className={`${isAnnual ? 'translate-x-6' : 'translate-x-1'}
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </Switch>
              <span className={`text-sm ${isAnnual ? 'font-bold text-yellow-600' : 'text-gray-500'}`}>
                Annual <span className="text-green-500 text-xs">(Save 20%)</span>
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="card-minion text-center flex flex-col h-full">
              <div className="flex-grow">
                <h3 className="text-2xl font-bold mb-2">Free</h3>
                <div className="text-sm text-gray-500 mb-4">1 Room</div>
                <div className="text-3xl font-bold text-minion-yellow mb-4">$0<span className="text-base text-gray-500">{getPeriod()}</span></div>
                <ul className="text-left space-y-2 mb-6 text-sm">
                  <li>✅ Up to 2 rooms</li>
                  <li>✅ Up to 2 staff users</li>
                  <li>✅ QR code access</li>
                  <li>✅ Basic service requests</li>
                  <li>✅ Notifications </li>
                </ul>
              </div>
              <Link href="/register?plan=starter" className="btn-minion w-full mt-auto">
                Get Started
              </Link>
            </div>

            <div className="card-minion text-center flex flex-col h-full">
              <div className="flex-grow">
                <h3 className="text-2xl font-bold mb-2">Starter</h3>
                <div className="text-sm text-gray-500 mb-4">1-20 Rooms</div>
                <div className="text-3xl font-bold text-minion-yellow mb-4">${getPrice(49)}<span className="text-base text-gray-500">{getPeriod()}</span></div>
                <ul className="text-left space-y-2 mb-6 text-sm">
                  <li>✅ Up to 20 rooms</li>
                  <li>✅ QR code access</li>
                  <li>✅ Basic service requests</li>
                  <li>✅ Email support</li>
                  <li>✅ Basic analytics</li>
                </ul>
              </div>
              <Link href="/register?plan=starter" className="btn-minion w-full mt-auto">
                Get Started
              </Link>
            </div>

            <div className="card-minion text-center border-minion-yellow border-2 relative flex flex-col h-full">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-minion-yellow text-gray-800 px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <div className="flex-grow">
                <h3 className="text-2xl font-bold mb-2">Growth</h3>
                <div className="text-sm text-gray-500 mb-4">21-50 Rooms</div>
                <div className="text-3xl font-bold text-minion-yellow mb-4">${getPrice(129)}<span className="text-base text-gray-500">{getPeriod()}</span></div>
                <ul className="text-left space-y-2 mb-6 text-sm">
                  <li>✅ Up to 50 rooms</li>
                  <li>✅ QR code access</li>
                  <li>✅ Full service requests</li>
                  <li>✅ Priority support</li>
                  <li>✅ Advanced analytics</li>
                  <li>✅ Custom branding</li>
                </ul>
              </div>
              <Link href="/register?plan=growth" className="btn-minion w-full mt-auto">
                Get Started
              </Link>
            </div>

            <div className="card-minion text-center flex flex-col h-full">
              <div className="flex-grow">
                <h3 className="text-2xl font-bold mb-2">Professional</h3>
                <div className="text-sm text-gray-500 mb-4">51-100 Rooms</div>
                <div className="text-3xl font-bold text-minion-yellow mb-4">${getPrice(249)}<span className="text-base text-gray-500">{getPeriod()}</span></div>
                <ul className="text-left space-y-2 mb-6 text-sm">
                  <li>✅ Up to 100 rooms</li>
                  <li>✅ QR code access</li>
                  <li>✅ Premium service suite</li>
                  <li>✅ Phone & chat support</li>
                  <li>✅ Full analytics dashboard</li>
                  <li>✅ Multi-location support</li>
                  <li>✅ API access</li>
                </ul>
              </div>
              <Link href="/register?plan=professional" className="btn-minion w-full mt-auto">
                Get Started
              </Link>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-600 text-sm">
              All plans include: Real-time notifications, Mobile-responsive design, Secure guest access, and Regular updates
            </p>
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
