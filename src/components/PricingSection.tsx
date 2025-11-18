import Link from "next/link";
import { prisma } from "@/lib/prisma";

function formatPrice(amount: number, currency = "INR") {
    const formatter = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
        minimumFractionDigits: 0
    });

    return formatter.format(Math.round(amount / 100));
}

const isPopularPlan = (roomLimit: number) => roomLimit > 20 && roomLimit <= 50;

export default async function PricingSection() {
    const plans = await prisma.rzpSubscriptionPlan.findMany({
        where: {
            period: "monthly",
            isActive: true
        },
        orderBy: {
            roomLimit: "asc"
        }
    });

    if (plans.length === 0) {
        return null;
    }

    return (
        <section className="py-16">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-800 mb-4">
                    Simple, Room-Based Pricing
                </h2>
                <p className="text-xl text-gray-600">
                    Pay only for the rooms you manage - perfect for hotels of any size
                </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        className={`card-minion text-center flex flex-col h-full relative ${isPopularPlan(plan.roomLimit)
                            ? "border-minion-yellow border-2"
                            : ""
                            }`}
                    >
                        {isPopularPlan(plan.roomLimit) && (
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-minion-yellow text-gray-800 px-4 py-1 rounded-full text-sm font-semibold">
                                Most Popular
                            </div>
                        )}
                        <div className="flex-grow">
                            <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                            <div className="text-sm text-gray-500 mb-4">
                                {plan.description}
                            </div>
                            <div className="text-3xl font-bold text-minion-yellow mb-4">
                                {formatPrice(plan.price, plan.currency)}
                                <span className="text-base text-gray-500">/month</span>
                            </div>
                            <ul className="text-left space-y-2 mb-6 text-sm">
                                {plan.features.map((feature, idx) => (
                                    <li key={`${plan.id}-feature-${idx}`}>✅ {feature}</li>
                                ))}
                            </ul>
                        </div>
                        {plan.price === 0 ? (
                            <Link href="/register" className="btn-minion w-full mt-auto">
                                Get Started Free
                            </Link>
                        ) : (
                            <Link
                                href={`/register?plan=${encodeURIComponent(plan.id)}`}
                                className="btn-minion w-full mt-auto"
                            >
                                Get Started
                            </Link>
                        )}
                    </div>
                ))}
            </div>

            <div className="text-center mt-8 space-y-3">
                <p className="text-gray-600 text-sm">
                    All plans include: Real-time notifications, Mobile-responsive design, Secure guest access, and Regular updates
                </p>
                <p className="text-gray-600 text-sm">
                    Need annual pricing or more tiers? View the full pricing breakdown on our {" "}
                    <Link href="/pricing" className="text-blue-600 hover:underline">
                        pricing page
                    </Link>
                    .
                </p>
            </div>
        </section>
    );
}
