import bcrypt from "bcryptjs";

export async function hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(
    password: string,
    hashedPassword: string
): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
}

export function generateAccessCode(length: number = 8): string {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * characters.length)
        );
    }
    return result;
}

export function generateBookingReference(): string {
    const prefix = "BK";
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `${prefix}${timestamp}${random}`;
}

export function generateQRCodeData(
    hotelId: string,
    roomNumber: string,
    accessCode: string
): string {
    const data = {
        hotelId,
        roomNumber,
        accessCode,
        timestamp: Date.now()
    };
    return btoa(JSON.stringify(data));
}

export function parseQRCodeData(qrData: string): {
    hotelId: string;
    roomNumber: string;
    accessCode: string;
    timestamp: number;
} | null {
    try {
        const decodedData = atob(qrData);
        return JSON.parse(decodedData);
    } catch (error) {
        console.error("Error parsing QR code data:", error);
        return null;
    }
}

export function calculateRoomTier(
    totalRooms: number
): "tier_1_20" | "tier_21_50" | "tier_51_100" | "tier_100_plus" {
    if (totalRooms <= 20) return "tier_1_20";
    if (totalRooms <= 50) return "tier_21_50";
    if (totalRooms <= 100) return "tier_51_100";
    return "tier_100_plus";
}

export function getSubscriptionPrice(
    plan: "basic" | "premium" | "enterprise",
    roomTier: string,
    billingCycle: "monthly" | "yearly"
): number {
    const basePrices = {
        basic: {
            tier_1_20: 99,
            tier_21_50: 199,
            tier_51_100: 299,
            tier_100_plus: 399
        },
        premium: {
            tier_1_20: 299,
            tier_21_50: 499,
            tier_51_100: 699,
            tier_100_plus: 899
        },
        enterprise: {
            tier_1_20: 699,
            tier_21_50: 999,
            tier_51_100: 1299,
            tier_100_plus: 1599
        }
    };

    const basePrice =
        basePrices[plan][roomTier as keyof (typeof basePrices)[typeof plan]] ||
        99;

    // Apply yearly discount (2 months free)
    if (billingCycle === "yearly") {
        return Math.round(basePrice * 10); // 10 months price for yearly
    }

    return basePrice;
}
