import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateQRCodeData } from "@/lib/utils";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth();
        if (!session || !['hotel_admin', 'hotel_staff'].includes(session.user.role)) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // For hotel staff, use their hotelId directly. For admins, find their hotel
        let hotelId = session.user.hotelId;
        
        if (session.user.role === "hotel_admin" && !hotelId) {
            const hotel = await prisma.hotel.findFirst({
                where: { adminId: session.user.id }
            });
            
            if (!hotel) {
                return NextResponse.json(
                    { error: "Hotel not found" },
                    { status: 404 }
                );
            }
            hotelId = hotel.id;
        }

        if (!hotelId) {
            return NextResponse.json(
                { error: "Hotel not found" },
                { status: 404 }
            );
        }

        const room = await prisma.room.findFirst({
            where: {
                id: id,
                hotelId: hotelId
            },
            include: {
                hotel: true
            }
        });

        if (!room) {
            return NextResponse.json(
                { error: "Room not found" },
                { status: 404 }
            );
        }

        // Generate QR code data
        const qrData = generateQRCodeData(
            room.hotelId,
            room.roomNumber,
            room.accessCode
        );

        // Create a more attractive QR code with hotel branding
        // Using a more sophisticated QR code service with customization options
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?` + 
            `size=400x400&` +
            `data=${encodeURIComponent(qrData)}&` +
            `format=png&` +
            `ecc=M&` +
            `color=2c3e50&` +
            `bgcolor=ffffff&` +
            `qzone=2&` +
            `download=1`;

        // For now, we'll use the simple QR code and later enhance with canvas manipulation
        // In a future enhancement, we could use Canvas API to add hotel name and styling
        const qrCodeResponse = await fetch(qrCodeUrl);
        const qrCodeBuffer = await qrCodeResponse.arrayBuffer();

        return new NextResponse(qrCodeBuffer, {
            headers: {
                'Content-Type': 'image/png',
                'Content-Disposition': `attachment; filename="${room.hotel.name.replace(/[^a-z0-9]/gi, '_')}-Room-${room.roomNumber}-QR.png"`
            }
        });

    } catch (error) {
        console.error("QR code generation error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
