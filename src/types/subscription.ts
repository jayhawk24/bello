export interface SubscriptionPlan {
    id: string;
    name: string;
    description: string;
    priceMonthly: number;
    priceYearly: number;
    currency: string;
    roomLimit: number;
    features: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
