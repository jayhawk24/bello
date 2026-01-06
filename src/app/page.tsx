import Link from "next/link";
import PricingSection from "@/components/PricingSection";
import LogoMark from "@/components/LogoMark";

export default function Home() {
  const highlights = [
    { value: "4.9/5", label: "Guest satisfaction" },
    { value: "2.3M+", label: "Requests resolved" },
    { value: "2m 10s", label: "Avg. response" },
  ];

  const steps = [
    {
      title: "Scan & greet",
      description: "Guests scan the in-room QR and land on a branded concierge without downloads or logins.",
      badge: "No app required",
      icon: "📲",
    },
    {
      title: "Smart triage",
      description: "Requests route to the right team instantly—front desk, housekeeping, dining, or transport.",
      badge: "Auto-routing",
      icon: "🛰️",
    },
    {
      title: "Live updates",
      description: "Guests see realtime progress, ETA, and chat with staff, reducing lobby calls and wait times.",
      badge: "Realtime",
      icon: "📡",
    },
    {
      title: "Insights & upsells",
      description: "Managers view trends, measure SLAs, and trigger timely upsells with zero manual spreadsheets.",
      badge: "Data rich",
      icon: "📊",
    },
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
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_20%_20%,rgba(255,215,0,0.25),transparent_50%),radial-gradient(circle_at_80%_0%,rgba(33,150,243,0.18),transparent_45%)]" aria-hidden />

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
        <section className="grid lg:grid-cols-[1.05fr,0.95fr] gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 rounded-full bg-white/80 px-4 py-2 shadow-sm border border-yellow-200 w-fit">
              <span className="text-lg">🛎️</span>
              <span className="text-sm font-semibold text-gray-700">Concierge that feels immediate</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
              Hospitality that answers
              <span className="text-minion-yellow"> before guests ask.</span>
            </h1>
            <p className="text-xl text-gray-700 max-w-2xl">
              Turn every stay into a memorable one with instant service requests, live updates, and a concierge your team can run in under a day.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register" className="btn-minion text-lg px-8 py-4">
                Start Free Trial
              </Link>
              <Link href="/contact" className="btn-minion-secondary text-lg px-8 py-4">
                View a Demo
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 pt-4">
              {highlights.map((item) => (
                <div key={item.label} className="card-minion bg-white/80 border-yellow-100 shadow-sm">
                  <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                  <p className="text-sm text-gray-600">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -top-10 -right-8 h-32 w-32 bg-minion-yellow/30 rounded-full blur-3xl" aria-hidden />
            <div className="card-minion relative overflow-hidden bg-white/90">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-minion-yellow via-amber-400 to-minion-blue" aria-hidden />
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-minion-blue/10 rounded-2xl flex items-center justify-center text-2xl">🧭</div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Live request board</p>
                    <p className="text-lg font-bold text-gray-900">Today, 14:22</p>
                  </div>
                </div>
                <span className="rounded-full bg-green-100 text-green-700 text-xs font-semibold px-3 py-1">Online</span>
              </div>

              <div className="space-y-4">
                {["Room service", "Housekeeping", "Airport pickup"].map((title, idx) => (
                  <div key={title} className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50/80 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{["🍽️", "🧺", "✈️"][idx]}</span>
                      <div>
                        <p className="font-semibold text-gray-800">{title}</p>
                        <p className="text-xs text-gray-500">Room {140 + idx}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span className="rounded-full bg-white px-2 py-1">ETA 8m</span>
                      <span className="rounded-full bg-minion-yellow/40 px-2 py-1 font-semibold">In progress</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="relative py-6 lg:py-10">
          <div className="absolute inset-x-0 -top-10 h-32 bg-gradient-to-b from-amber-100/70 to-transparent" aria-hidden />
          <div className="grid lg:grid-cols-[0.85fr,1.15fr] gap-10 items-start relative">
            <div className="card-minion sticky top-24 bg-white/90 shadow-lg border-yellow-100">
              <p className="text-sm font-semibold text-minion-blue mb-2">Step-by-step flow</p>
              <h2 className="text-4xl font-bold text-gray-900 leading-snug mb-4">
                How StayScan works across every stay.
              </h2>
              <p className="text-base text-gray-700 mb-6">
                A guided timeline for guests and teams—scroll to see each milestone. On mobile, swipe through the steps.
              </p>
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="px-3 py-2 rounded-full bg-minion-yellow/30 text-gray-800 font-semibold">1 day setup</span>
                <span className="px-3 py-2 rounded-full bg-minion-blue/15 text-gray-800 font-semibold">No-code launch</span>
                <span className="px-3 py-2 rounded-full bg-white border border-yellow-200">Built for staff & guests</span>
              </div>
            </div>

            <div className="relative">
              <div className="hidden lg:block absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-minion-blue/40 via-minion-yellow/30 to-transparent" aria-hidden />
              <div className="flex lg:block gap-4 overflow-x-auto pb-4 lg:overflow-visible snap-x">
                {steps.map((step, idx) => (
                  <article
                    key={step.title}
                    className="relative min-w-[280px] lg:min-w-0 lg:pl-12 snap-center"
                  >
                    <div className="hidden lg:flex absolute left-1 top-6 w-3 h-3 rounded-full bg-white border-2 border-minion-blue shadow-sm" aria-hidden />
                    <div className="card-minion bg-white/90 border-yellow-100 shadow-md h-full">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{step.icon}</span>
                          <div>
                            <p className="text-xs font-semibold uppercase text-gray-500">Step {String(idx + 1).padStart(2, "0")}</p>
                            <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                          </div>
                        </div>
                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-minion-yellow/50 text-gray-800">
                          {step.badge}
                        </span>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{step.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

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
    </div>
  );
}
