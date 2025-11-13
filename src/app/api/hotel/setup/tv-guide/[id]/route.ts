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
        const session =
            !headerUserId || headerRole !== "hotel_admin"
                ? await getServerSession(authOptions)
                : null;

        if (
            headerRole !== "hotel_admin" &&
            (!session || session.user.role !== "hotel_admin")
        ) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Determine hotelId
        let hotelId = headerUserId
            ? (request.headers.get("x-hotel-id") as string | null)
            : session!.user.hotelId;
        if (!hotelId) {
            const user = await prisma.user.findUnique({
                where: { id: headerUserId || session!.user.id },
                include: { managedHotel: true }
            });
            hotelId = user?.managedHotel?.id ?? null;
        }

        if (!hotelId) {
            return NextResponse.json(
                { error: "Hotel not found" },
                { status: 404 }
            );
        }

        // Verify tvGuide belongs to hotel
        const tv = await prisma.tvGuide.findFirst({
            where: { id, hotelInfo: { hotelId } }
        });
        if (!tv) {
            return NextResponse.json(
                { error: "TV Guide not found" },
                { status: 404 }
            );
        }

        await prisma.tvGuide.delete({ where: { id } });
        return NextResponse.json({
            success: true,
            message: "TV guide deleted"
        });
    } catch (error) {
        console.error("Delete TV guide error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
