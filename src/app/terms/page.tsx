import Link from "next/link";

export default function Terms() {
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
                        <Link href="/guest" className="text-gray-600 hover:text-minion-blue transition-colors">
                            Guest Access
                        </Link>
                        <Link href="/login" className="btn-minion-secondary">
                            Hotel Login
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-6 py-16">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">Terms of Service</h1>
                    <p className="text-gray-600">Last updated: August 15, 2025</p>
                </div>

                <div className="card-minion p-8 prose prose-lg max-w-none">
                    <h2>Acceptance of Terms</h2>
                    <p>
                        By accessing and using Bello's concierge services, you accept and agree to be bound by
                        the terms and provision of this agreement.
                    </p>

                    <h2>Use License</h2>
                    <p>
                        Permission is granted to temporarily use Bello's services for personal, non-commercial
                        transitory viewing only. This is the grant of a license, not a transfer of title.
                    </p>

                    <h2>Service Availability</h2>
                    <p>
                        We strive to provide continuous service availability but do not guarantee uninterrupted
                        access. Services may be temporarily unavailable for maintenance or technical issues.
                    </p>

                    <h2>User Responsibilities</h2>
                    <p>
                        Users are responsible for maintaining the confidentiality of their account credentials
                        and for all activities that occur under their account.
                    </p>

                    <h2>Limitation of Liability</h2>
                    <p>
                        Bello shall not be liable for any damages arising from the use or inability to use
                        our services, including but not limited to direct, indirect, incidental, or consequential damages.
                    </p>

                    <h2>Modifications</h2>
                    <p>
                        Bello may revise these terms at any time without notice. By using this service,
                        you are agreeing to be bound by the current version of these terms.
                    </p>

                    <h2>Contact Information</h2>
                    <p>
                        Questions about the Terms of Service should be sent to us at legal@bello.com
                    </p>
                </div>

                <div className="text-center mt-8">
                    <Link href="/" className="text-minion-blue hover:text-minion-yellow transition-colors font-medium">
                        ← Back to Home
                    </Link>
                </div>
            </main>
        </div>
    );
}
