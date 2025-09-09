import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "hotel_admin") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const hotelId = session.user.hotelId;
        if (!hotelId) {
            return NextResponse.json(
                { error: "Hotel not found" },
                { status: 404 }
            );
        }

        // Verify the food menu belongs to this hotel
        const foodMenu = await prisma.foodMenu.findFirst({
            where: {
                id,
                hotelInfo: {
                    hotelId
                }
            }
        });

        if (!foodMenu) {
            return NextResponse.json(
                { error: "Food menu not found" },
                { status: 404 }
            );
        }

        // Delete the food menu (this will cascade delete menu items)
        await prisma.foodMenu.delete({
            where: { id }
        });

        return NextResponse.json({
            success: true,
            message: "Food menu deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting food menu:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
