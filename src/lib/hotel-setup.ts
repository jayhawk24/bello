import { Prisma, SubscriptionPlan, SubscriptionStatus } from "@prisma/client";

export async function createHotelAccount(
    tx: Prisma.TransactionClient,
    userId: string,
    hotelName: string,
    email: string,
    phone: string
) {
    // Get the free plan
    const freePlan = await tx.rzpSubscriptionPlan.findFirst({
        where: {
            name: "Free Monthly",
            isActive: true
        }
    });

    if (!freePlan) {
        throw new Error("Free plan not found in the database");
    }

    // Create hotel with the user as admin
    const hotel = await tx.hotel.create({
        data: {
            name: hotelName,
            address: "",
            city: "",
            state: "",
            country: "",
            contactEmail: email,
            contactPhone: phone,
            adminId: userId,
            subscriptionPlan: SubscriptionPlan.free,
            subscriptionStatus: SubscriptionStatus.active,
            totalRooms: 0
        }
    });

    // Create subscription for the free plan
    await tx.subscription.create({
        data: {
            hotelId: hotel.id,
            planType: SubscriptionPlan.free,
            planId: freePlan.id,
            billingCycle: freePlan.period,
            roomTier: "tier_1_20",
            amount: 0,
            currency: "USD",
            status: SubscriptionStatus.active,
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(
                new Date().setFullYear(new Date().getFullYear() + 100)
            )
        }
    });

    // Update user with hotel reference
    await tx.user.update({
        where: { id: userId },
        data: { hotelId: hotel.id }
    });

    // Create default services for the new hotel
    const defaultServices = [
        {
            name: "Room Service",
            description: "Order food and beverages directly to your room",
            category: "room_service" as const,
            icon: "🍽️"
        },
        {
            name: "Housekeeping",
            description: "Request cleaning services, towels, and amenities",
            category: "housekeeping" as const,
            icon: "🧹"
        },
        {
            name: "Maintenance",
            description: "Report room issues and request repairs",
            category: "maintenance" as const,
            icon: "🔧"
        },
        {
            name: "Laundry Service",
            description: "Professional cleaning and pressing services",
            category: "laundry" as const,
            icon: "👔"
        }
    ];

    await tx.service.createMany({
        data: defaultServices.map((service) => ({
            ...service,
            hotelId: hotel.id,
            isActive: true
        }))
    });

    return hotel;
}
