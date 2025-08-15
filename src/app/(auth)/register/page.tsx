"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const selectedPlan = searchParams.get("plan") || "basic";
  
  const [formData, setFormData] = useState({
    hotelName: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    plan: selectedPlan
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    
    setIsLoading(true);
    // TODO: Implement registration and payment flow
    setTimeout(() => {
      setIsLoading(false);
      alert("Registration and payment integration will be implemented in the next phase!");
    }, 1500);
  };

  const planDetails = {
    basic: { name: "Basic", price: "$99/month", rooms: "Up to 20 rooms" },
    premium: { name: "Premium", price: "$299/month", rooms: "Up to 50 rooms each (5 hotels)" },
    enterprise: { name: "Enterprise", price: "$699/month", rooms: "Unlimited rooms (10+ hotels)" }
  };

  const currentPlan = planDetails[formData.plan as keyof typeof planDetails];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="w-12 h-12 bg-minion-yellow rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">🏨</span>
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Create Your Hotel Account</h1>
          <p className="text-gray-600 mt-2">
            Start your free trial with the {currentPlan.name} plan
          </p>
        </div>

        <div className="card-minion mb-6">
          <div className="text-center p-4 bg-minion-yellow-light rounded-lg mb-6">
            <h3 className="font-semibold text-gray-800">{currentPlan.name} Plan Selected</h3>
            <p className="text-gray-600">{currentPlan.price} • {currentPlan.rooms}</p>
            <Link href="/#features" className="text-minion-blue hover:underline text-sm">
              Change plan
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="form-group">
                <label htmlFor="firstName" className="form-label">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="input-minion"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName" className="form-label">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="input-minion"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="hotelName" className="form-label">Hotel Name</label>
              <input
                type="text"
                id="hotelName"
                name="hotelName"
                value={formData.hotelName}
                onChange={handleChange}
                placeholder="Grand Palace Hotel"
                className="input-minion"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@grandpalace.com"
                  className="input-minion"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone" className="form-label">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                  className="input-minion"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input-minion"
                  minLength={8}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input-minion"
                  minLength={8}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="flex items-start">
                <input type="checkbox" className="mr-3 mt-1" required />
                <span className="text-sm text-gray-600">
                  I agree to the{" "}
                  <Link href="/terms" className="text-minion-blue hover:underline">Terms of Service</Link>
                  {" "}and{" "}
                  <Link href="/privacy" className="text-minion-blue hover:underline">Privacy Policy</Link>
                </span>
              </label>
            </div>

            <button 
              type="submit" 
              className="btn-minion w-full text-lg py-4"
              disabled={isLoading}
            >
              {isLoading ? "🔄 Creating Account..." : "🚀 Start Free Trial"}
            </button>
          </form>
        </div>

        <div className="text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-minion-blue hover:underline font-semibold">
              Sign in
            </Link>
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-gray-500 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
