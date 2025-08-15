import { UserRole, SubscriptionPlan } from "@prisma/client";

export interface ExtendedUser {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    hotelId: string | null;
    hotel?: {
        id: string;
        name: string;
        subscriptionPlan: SubscriptionPlan;
    } | null;
}

declare module "next-auth" {
    interface User extends ExtendedUser {}

    interface Session {
        user: ExtendedUser;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: UserRole;
        hotelId: string | null;
        hotel?: {
            id: string;
            name: string;
            subscriptionPlan: SubscriptionPlan;
        } | null;
    }
}
