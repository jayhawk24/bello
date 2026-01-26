"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const steps = [
    {
        title: "Scan & greet",
        description: "Guests scan the in-room QR code and open the concierge in their browser. No download or login needed.",
        badge: "No app required",
        icon: "📲",
    },
    {
        title: "Smart triage",
        description: "Requests go straight to the right team, whether front desk, housekeeping, dining, or transport.",
        badge: "Auto-routing",
        icon: "🛰️",
    },
    {
        title: "Live updates",
        description: "Guests track live progress, see ETAs, and chat with staff, cutting lobby calls and wait times.",
        badge: "Realtime",
        icon: "📡",
    },
    {
        title: "Insights & upsells",
        description: "Managers review trends, track SLAs, and send timely upsells without spreadsheets.",
        badge: "Data rich",
        icon: "📊",
    },
];

export default function HowItWorksTimeline() {
    const [activeStep, setActiveStep] = useState(0);
    const stepRefs = useRef<(HTMLElement | null)[]>([]);

    const handleStepSelect = useCallback((index: number) => {
        setActiveStep(index);
        const target = stepRefs.current[index];
        if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
        }
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

                if (visible[0]?.target) {
                    const index = stepRefs.current.findIndex((el) => el === visible[0].target);
                    if (index !== -1) setActiveStep(index);
                }
            },
            {
                rootMargin: "-15% 0px -45% 0px",
                threshold: [0.1, 0.25, 0.4, 0.5, 0.65, 0.8],
            }
        );

        stepRefs.current.forEach((el) => el && observer.observe(el));

        return () => {
            observer.disconnect();
        };
    }, []);

    return (
        <section id="how-it-works" className="relative py-16 lg:py-20 bg-gradient-to-b from-amber-50/50 via-yellow-50/30 to-transparent">
            <div className="relative max-w-7xl mx-auto px-6 flex flex-col gap-12 lg:grid lg:grid-cols-[0.85fr,1.15fr] lg:gap-10 lg:items-start">
                <div className="card-minion bg-white/90 shadow-lg border-yellow-100 lg:sticky lg:top-24">
                    <p className="text-sm font-semibold text-minion-blue mb-2">Step-by-step flow</p>
                    <h2 className="text-4xl font-bold text-gray-900 leading-snug mb-4">
                        How StayScan supports every stay.
                    </h2>
                    <p className="text-base text-gray-700 mb-6">
                        Follow each step for guests and teams. Scroll or swipe to explore every milestone.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-2">
                        {steps.map((step, idx) => (
                            <button
                                key={`jump-${step.title}`}
                                type="button"
                                onClick={() => handleStepSelect(idx)}
                                aria-pressed={activeStep === idx}
                                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${activeStep === idx
                                    ? "bg-minion-blue text-white shadow-sm"
                                    : "bg-minion-blue/10 text-minion-blue hover:bg-minion-blue/20"
                                    }`}
                            >
                                Step {String(idx + 1).padStart(2, "0")}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="relative">
                    <div className="hidden lg:block absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-minion-blue/40 via-minion-yellow/30 to-transparent" aria-hidden />
                    <div className="flex lg:block gap-6 lg:space-y-6 overflow-x-auto pb-4 lg:overflow-visible snap-x snap-mandatory">
                        {steps.map((step, idx) => (
                            <article
                                key={step.title}
                                ref={(el) => {
                                    stepRefs.current[idx] = el;
                                }}
                                className={`relative min-w-[280px] lg:min-w-0 lg:pl-12 snap-center transition-all duration-300 scroll-mt-24 ${activeStep === idx ? "scale-[1.05] lg:translate-x-2" : "opacity-80"
                                    }`}
                                role="button"
                                aria-current={activeStep === idx ? "step" : undefined}
                                onClick={() => handleStepSelect(idx)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter" || event.key === " ") {
                                        event.preventDefault();
                                        handleStepSelect(idx);
                                    }
                                }}
                                tabIndex={0}
                            >
                                <div
                                    className={`hidden lg:flex absolute left-1 top-6 w-3 h-3 rounded-full transition-all duration-200 shadow-sm ${activeStep === idx ? "bg-minion-yellow border-2 border-minion-blue" : "bg-white border-2 border-minion-blue"
                                        }`}
                                    aria-hidden
                                />
                                <div
                                    className={`card-minion shadow-md h-full transition-all duration-200 ${activeStep === idx
                                        ? "bg-minion-yellow/20 border-minion-blue/60 ring-2 ring-minion-yellow/50"
                                        : "bg-white/90 border-yellow-100"
                                        }`}
                                >
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
    );
}
