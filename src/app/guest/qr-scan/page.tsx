import Link from "next/link";

export default function QRScanPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center p-6">
      <div className="card-minion max-w-md w-full text-center">
        <div className="mb-6">
          <div className="inline-block p-4 bg-minion-yellow rounded-full mb-4">
            <span className="text-4xl">📱</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Scan Room QR Code</h1>
          <p className="text-gray-600 mt-2">
            Point your camera at the QR code in your hotel room to access concierge services
          </p>
        </div>

        <div className="mb-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50">
            <div className="text-4xl mb-2">📷</div>
            <p className="text-gray-500">Camera access will be available here</p>
            <p className="text-sm text-gray-400 mt-1">Feature coming soon</p>
          </div>
        </div>

        <div className="space-y-3">
          <button className="btn-minion w-full" disabled>
            🔍 Start Camera Scan
          </button>
          <p className="text-sm text-gray-500">or</p>
          <Link href="/guest/booking-id" className="btn-minion-secondary w-full">
            Enter Booking ID Instead
          </Link>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <Link href="/" className="text-minion-blue hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
