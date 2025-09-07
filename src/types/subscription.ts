import { BillingCycle } from "@prisma/client";

export interface SubscriptionPlan {
    id: string;
    name: string;
    description: string;
    price: number;
    period: BillingCycle;
    currency: string;
    roomLimit: number;
    features: string[];
    isActive: boolean;
    razorpayPlanId?: string;
    createdAt: Date;
    updatedAt: Date;
}
