import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Registers the user with a free plan
export async function POST() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.redirect("/auth/login");
    }
    // Find the user's hotel
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { hotelId: true }
    });
    if (!user?.hotelId) {
        return NextResponse.redirect("/dashboard");
    }
    // Set the hotel to free plan
    await prisma.hotel.update({
        where: { id: user.hotelId },
        data: { subscriptionTier: "free", subscriptionStatus: "active" }
    });
    return NextResponse.redirect("/dashboard");
}
