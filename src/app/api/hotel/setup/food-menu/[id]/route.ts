import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const headerUserId = request.headers.get("x-user-id");
        const headerRole = request.headers.get("x-user-role");
        const session = (!headerUserId || headerRole !== "hotel_admin")
            ? await getServerSession(authOptions)
            : null;

        if ((headerRole !== "hotel_admin") && (!session || session.user.role !== "hotel_admin")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const hotelId = headerUserId ? (request.headers.get("x-hotel-id") as string | null) : session!.user.hotelId;
        if (!hotelId) {
            return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
        }

        // Ensure menu belongs to this hotel via HotelInfo
        const menu = await prisma.foodMenu.findFirst({
            where: { id, hotelInfo: { hotelId } }
        });
        if (!menu) {
            return NextResponse.json(
                { error: "Food menu not found" },
                { status: 404 }
            );
        }

        await prisma.foodMenu.delete({ where: { id } });
        return NextResponse.json({ success: true, message: "Food menu deleted" });
    } catch (error) {
        console.error("Error deleting food menu:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
