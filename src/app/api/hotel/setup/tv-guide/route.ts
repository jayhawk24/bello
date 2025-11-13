import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
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

        const hotelId = headerUserId
            ? (request.headers.get("x-hotel-id") as string | null)
            : session!.user.hotelId;
        if (!hotelId) {
            return NextResponse.json(
                { error: "Hotel not found" },
                { status: 404 }
            );
        }

        const body = await request.json();
        const { title, description, category, channels } = body;

        if (!title?.trim()) {
            return NextResponse.json(
                { error: "Title is required" },
                { status: 400 }
            );
        }

        // Ensure hotel info exists
        let hotelInfo = await prisma.hotelInfo.findUnique({
            where: { hotelId }
        });

        if (!hotelInfo) {
            hotelInfo = await prisma.hotelInfo.create({
                data: {
                    hotelId,
                    amenities: []
                }
            });
        }

        // Create TV guide with channels
        const tvGuide = await prisma.tvGuide.create({
            data: {
                hotelInfoId: hotelInfo.id,
                title: title.trim(),
                description: description?.trim() || null,
                category: category?.trim() || null,
                channels: {
                    create:
                        channels?.map((channel: any) => ({
                            number: channel.number,
                            name: channel.name,
                            category: channel.category || null,
                            language: channel.language || null,
                            isHd: channel.isHd || false,
                            logo: channel.logo || null,
                            description: channel.description || null
                        })) || []
                }
            },
            include: {
                channels: true
            }
        });

        return NextResponse.json({
            success: true,
            data: tvGuide
        });
    } catch (error) {
        console.error("Error creating TV guide:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
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

        const hotelId = headerUserId
            ? (request.headers.get("x-hotel-id") as string | null)
            : session!.user.hotelId;
        if (!hotelId) {
            return NextResponse.json(
                { error: "Hotel not found" },
                { status: 404 }
            );
        }

        const hotelInfo = await prisma.hotelInfo.findUnique({
            where: { hotelId },
            include: {
                tvGuides: {
                    include: {
                        channels: {
                            orderBy: { number: "asc" }
                        }
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            data: hotelInfo?.tvGuides || []
        });
    } catch (error) {
        console.error("Error fetching TV guides:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
