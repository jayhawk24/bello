import Link from "next/link";

export default function Contact() {
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
                            StayScan
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
                    <div className="inline-block p-4 bg-minion-yellow rounded-full mb-6">
                        <span className="text-4xl">📧</span>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">Contact Us</h1>
                    <p className="text-xl text-gray-600">We&apos;d love to hear from you!</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Contact Form */}
                    <div className="card-minion p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Send us a Message</h2>
                        <form className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-minion-yellow focus:border-transparent"
                                    placeholder="Your full name"
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-minion-yellow focus:border-transparent"
                                    placeholder="your@email.com"
                                />
                            </div>
                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                                    Subject
                                </label>
                                <select
                                    id="subject"
                                    name="subject"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-minion-yellow focus:border-transparent"
                                >
                                    <option value="">Select a topic</option>
                                    <option value="sales">Sales Inquiry</option>
                                    <option value="support">Technical Support</option>
                                    <option value="billing">Billing Question</option>
                                    <option value="partnership">Partnership</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                    Message
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    rows={5}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-minion-yellow focus:border-transparent"
                                    placeholder="Tell us how we can help you..."
                                ></textarea>
                            </div>
                            <button type="submit" className="btn-minion w-full">
                                Send Message
                            </button>
                        </form>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-8">
                        <div className="card-minion p-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Get in Touch</h3>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <span className="text-2xl">📧</span>
                                    <div>
                                        <p className="font-medium">Email</p>
                                        <a href="mailto:support@stayscan.com" className="text-minion-blue hover:text-minion-yellow transition-colors">
                                            support@stayscan.com
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <span className="text-2xl">📞</span>
                                    <div>
                                        <p className="font-medium">Phone</p>
                                        <a href="tel:+91-961-650-4623" className="text-minion-blue hover:text-minion-yellow transition-colors">
                                            +91 (961) 650-4623
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <span className="text-2xl">💬</span>
                                    <div>
                                        <p className="font-medium">Live Chat</p>
                                        <p className="text-gray-600">Available 9 AM - 6 PM EST</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card-minion p-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Support Hours</h3>
                            <div className="space-y-2 text-gray-600">
                                <p><strong>Monday - Friday:</strong> 9:00 AM - 6:00 PM EST</p>
                                <p><strong>Saturday:</strong> 10:00 AM - 4:00 PM EST</p>
                                <p><strong>Sunday:</strong> Closed</p>
                                <p className="text-sm mt-4 text-minion-blue">
                                    Enterprise customers have 24/7 phone support
                                </p>
                            </div>
                        </div>

                        <div className="card-minion p-6 bg-minion-yellow bg-opacity-20">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Links</h3>
                            <div className="space-y-2">
                                <Link href="/register" className="block text-minion-blue hover:text-minion-yellow transition-colors">
                                    Start Free Trial
                                </Link>
                                <Link href="/guest" className="block text-minion-blue hover:text-minion-yellow transition-colors">
                                    Guest Access
                                </Link>
                                <Link href="/login" className="block text-minion-blue hover:text-minion-yellow transition-colors">
                                    Hotel Login
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center mt-12">
                    <Link href="/" className="text-minion-blue hover:text-minion-yellow transition-colors font-medium">
                        ← Back to Home
                    </Link>
                </div>
            </main>
        </div>
    );
}
