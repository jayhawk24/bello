import Link from "next/link";

export default function Privacy() {
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
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">Privacy Policy</h1>
                    <p className="text-gray-600">Last updated: August 15, 2025</p>
                </div>

                <div className="card-minion p-8 prose prose-lg max-w-none">
                    <h2>Information We Collect</h2>
                    <p>
                        We collect information you provide directly to us, such as when you create an account,
                        make a service request, or contact us for support.
                    </p>

                    <h2>How We Use Your Information</h2>
                    <p>
                        We use the information we collect to provide, maintain, and improve our concierge services,
                        process transactions, and communicate with you.
                    </p>

                    <h2>Information Sharing</h2>
                    <p>
                        We do not sell, trade, or rent your personal information to third parties. We may share
                        information in certain limited circumstances as outlined in this policy.
                    </p>

                    <h2>Data Security</h2>
                    <p>
                        We implement appropriate security measures to protect your personal information against
                        unauthorized access, alteration, disclosure, or destruction.
                    </p>

                    <h2>Contact Us</h2>
                    <p>
                        If you have any questions about this Privacy Policy, please contact us at privacy@bello.com
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
