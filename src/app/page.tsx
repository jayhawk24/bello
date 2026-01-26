import Link from "next/link";
import PricingSection from "@/components/PricingSection";
import LogoMark from "@/components/LogoMark";
import HowItWorksTimeline from "@/components/HowItWorksTimeline";
import DemoVideoModal from "@/components/DemoVideoModal";
import { pageMetadata } from "@/lib/seo";
import { JsonLd, organizationSchema, softwareSchema } from "@/components/seo/JsonLd";

export const metadata = pageMetadata.home;

export default function Home() {
  const highlights = [
    { value: "4.9/5", label: "Guest satisfaction" },
    { value: "2.3M+", label: "Requests resolved" },
    { value: "2m 10s", label: "Avg. response" },
  ];

  const features = [
    {
      title: "Concierge without friction",
      copy: "Branded, mobile-first concierge launched from your room QR codes—guests never download an app.",
      icon: "🎯",
    },
    {
      title: "Unified service desk",
      copy: "Room service, housekeeping, bell desk, transport, and local tips in one queue with clear SLAs.",
      icon: "🛎️",
    },
    {
      title: "Automated notifications",
      copy: "Status pings keep guests in the loop while your team works—no more repeated follow-up calls.",
      icon: "🔔",
    },
    {
      title: "Operations analytics",
      copy: "See peak hours, resolution times, and staff load so you can forecast and staff with confidence.",
      icon: "📈",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-yellow-50 via-white to-amber-100">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-screen bg-[radial-gradient(circle_at_20%_20%,rgba(255,215,0,0.25),transparent_50%),radial-gradient(circle_at_80%_0%,rgba(33,150,243,0.18),transparent_45%)]" aria-hidden />
      <nav className="nav-minion px-6 py-4 bg-white/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-minion-yellow rounded-full flex items-center justify-center">
              <LogoMark size={28} priority />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-800">StayScan</p>
          </div>
          <div className="flex items-center space-x-2 sm:ml-5 sm:space-x-3">
            <Link href="#how-it-works" className="hidden md:inline-flex text-gray-700 hover:text-minion-blue transition-colors font-semibold">
              How it works
            </Link>
            <Link href="/guest" className="btn-minion">
              Guest Access
            </Link>
            <Link href="/login" className="btn-minion-secondary">
              Hotel Login
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-16 space-y-20">
        <section id="demo-video" className="relative overflow-hidden rounded-3xl border border-yellow-200 bg-white/70 px-6 py-12 shadow-sm">
          <div className="absolute inset-0">
            <video
              className="h-full w-full object-cover"
              src="/assets/howitworks.mp4"
              autoPlay
              muted
              loop
              playsInline
              controls={false}
            />
            <div className="absolute inset-0 bg-white/75" aria-hidden />
          </div>
          <div className="relative space-y-6">
            <div className="inline-flex items-center gap-3 rounded-full bg-white/80 px-4 py-2 shadow-sm border border-yellow-200 w-fit">
              <span className="text-lg">🛎️</span>
              <span className="text-sm font-semibold text-gray-700">Concierge that feels immediate</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
              Quick service,
              <span className="text-minion-blue"> smoother stays.</span>
            </h1>
            <p className="text-xl text-gray-700 max-w-2xl">
              Turn every stay into a memorable one with instant service requests, live updates, and a concierge your team can run in under a day.
            </p>
            <div className="rounded-2xl border border-yellow-200 bg-white/80 p-4 sm:p-6 shadow-sm">
              <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-gray-700">
                <span className="px-3 py-1 rounded-full bg-minion-yellow/40 text-gray-900">Fast launch</span>
                <span>Be live in a day, with zero downloads.</span>
              </div>
              <div className="mt-4 grid gap-6 lg:grid-cols-[1.05fr,0.95fr] items-center">
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/register" className="btn-minion text-lg px-8 py-4">
                      Start Free Trial
                    </Link>
                    <DemoVideoModal
                      buttonLabel="View a Demo"
                      buttonClassName="btn-minion-secondary text-lg px-8 py-4"
                      videoSrc="/assets/howitworks.mp4"
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                    {highlights.map((item) => (
                      <div key={item.label} className="card-minion bg-white/80 border-yellow-100 shadow-sm">
                        <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                        <p className="text-sm text-gray-600">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <HowItWorksTimeline />

        <section id="features" className="py-6 lg:py-10">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-minion-blue mb-2">Platform highlights</p>
            <h2 className="text-4xl font-bold text-gray-900 mb-3">Everything your hotel team needs</h2>
            <p className="text-lg text-gray-700">
              Streamline operations, delight guests, and give managers the clarity to staff with confidence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="card-minion bg-white/90 border-yellow-100 shadow-sm">
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-700 text-sm leading-relaxed">{feature.copy}</p>
              </div>
            ))}
          </div>
        </section>

        <PricingSection />

        <section className="py-14 bg-white rounded-3xl shadow-xl border border-yellow-100">
          <div className="text-center px-6 sm:px-10">
            <p className="text-sm font-semibold text-minion-blue mb-2">Guest Access</p>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Already at a StayScan hotel?</h2>
            <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
              Jump straight into concierge services—whether you have the room QR handy or just your booking ID.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-xl mx-auto">
              <Link href="/guest/qr-scan" className="btn-minion text-lg px-8 py-4">
                📱 Scan QR Code
              </Link>
              <Link href="/guest/booking-id" className="btn-minion-secondary text-lg px-8 py-4">
                🔑 Enter Booking ID
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-12 mt-10">
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
      <JsonLd data={organizationSchema} />
      <JsonLd data={softwareSchema} />
    </div>
  );
}
