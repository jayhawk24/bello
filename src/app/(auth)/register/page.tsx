import { Suspense } from "react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import RegisterFormClient from "./RegisterFormClient";

export const metadata: Metadata = {
    title: "Create Your Hotel Account | Bello",
    description:
        "Start your Bello concierge trial in minutes. Pick a plan, create your admin profile, and get your hotel onboarded today."
};

type RegisterPageProps = {
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type PlanTier = "free" | "basic" | "premium" | "enterprise";

type PlanPayload = {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    roomLimit: number;
    features: string[];
    period: "monthly" | "yearly";
    tier: PlanTier;
};

const deriveTierFromName = (name: string): PlanTier => {
    const normalized = name.toLowerCase();
    if (normalized.includes("free")) return "free";
    if (normalized.includes("starter")) return "basic";
    if (normalized.includes("growth")) return "premium";
    return "enterprise";
};

export default async function RegisterPage({
    searchParams
}: RegisterPageProps) {
    const resolvedSearchParams = searchParams ? await searchParams : {};
    const plansRaw = await prisma.rzpSubscriptionPlan.findMany({
        where: { isActive: true },
        orderBy: { price: "asc" }
    });

    if (!plansRaw.length) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <h1 className="text-3xl font-semibold text-gray-800">
                        Registration is temporarily unavailable
                    </h1>
                    <p className="text-gray-600">
                        We&apos;re updating our plans. Please check back soon or contact support.
                    </p>
                </div>
            </div>
        );
    }

    const plans: PlanPayload[] = plansRaw.map((plan) => ({
        id: plan.id,
        name: plan.name,
        description: plan.description,
        price: plan.price,
        currency: plan.currency,
        roomLimit: plan.roomLimit,
        features: plan.features,
        period: plan.period,
        tier: deriveTierFromName(plan.name)
    }));

    const planQuery = resolvedSearchParams.plan;
    const requestedPlanId = Array.isArray(planQuery) ? planQuery[0] : planQuery;
    const requestedPlan = requestedPlanId
        ? plans.find((plan) => plan.id === requestedPlanId)
        : undefined;

    const defaultPlan =
        requestedPlan || plans.find((plan) => plan.tier === "free") || plans[0];

    const fallbackMessage =
        requestedPlanId && !requestedPlan
            ? "Requested plan unavailable. Showing the closest available plan instead."
            : null;

    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-600">Loading registration...</div>}>
            <RegisterFormClient
                plans={plans}
                defaultPlanId={defaultPlan.id}
                fallbackMessage={fallbackMessage}
            />
        </Suspense>
    );
}
