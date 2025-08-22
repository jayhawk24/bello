import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
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

        const body = await request.json();
        const {
            name,
            description,
            category,
            isActive,
            availableFrom,
            availableTo,
            menuItems
        } = body;

        if (!name?.trim()) {
            return NextResponse.json(
                { error: "Menu name is required" },
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

        // Create food menu with items
        const foodMenu = await prisma.foodMenu.create({
            data: {
                hotelInfoId: hotelInfo.id,
                name: name.trim(),
                description: description?.trim() || null,
                category: category?.trim() || null,
                isActive: isActive ?? true,
                availableFrom: availableFrom?.trim() || null,
                availableTo: availableTo?.trim() || null,
                menuItems: {
                    create:
                        menuItems?.map((item: any) => ({
                            name: item.name,
                            description: item.description || null,
                            price: item.price || null,
                            category: item.category || null,
                            isVegetarian: item.isVegetarian || false,
                            isVegan: item.isVegan || false,
                            allergens: item.allergens || [],
                            spiceLevel: item.spiceLevel || null,
                            isAvailable: item.isAvailable ?? true,
                            image: item.image || null,
                            prepTime: item.prepTime || null,
                            calories: item.calories || null
                        })) || []
                }
            },
            include: {
                menuItems: true
            }
        });

        return NextResponse.json({
            success: true,
            data: foodMenu
        });
    } catch (error) {
        console.error("Error creating food menu:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
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

        const hotelInfo = await prisma.hotelInfo.findUnique({
            where: { hotelId },
            include: {
                foodMenus: {
                    include: {
                        menuItems: {
                            orderBy: { name: "asc" }
                        }
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            data: hotelInfo?.foodMenus || []
        });
    } catch (error) {
        console.error("Error fetching food menus:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
