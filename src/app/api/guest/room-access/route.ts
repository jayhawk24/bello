import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const hotelId = searchParams.get("hotelId");
        const roomNumber = searchParams.get("roomNumber");
        const accessCode = searchParams.get("accessCode");

        if (!hotelId || !roomNumber || !accessCode) {
            return NextResponse.json(
                { error: "Missing required parameters" },
                { status: 400 }
            );
        }

        // Find the room with matching details
        const room = await prisma.room.findFirst({
            where: {
                hotelId,
                roomNumber,
                accessCode
            },
            include: {
                hotel: {
                    select: {
                        id: true,
                        name: true,
                        contactEmail: true,
                        contactPhone: true,
                        hotelInfo: {
                            include: {
                                wifiInfos: true,
                                tvGuides: {
                                    include: {
                                        channels: true
                                    }
                                },
                                foodMenus: {
                                    include: {
                                        menuItems: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!room) {
            return NextResponse.json(
                { error: "Invalid access credentials" },
                { status: 404 }
            );
        }

        // Try to find an active booking for this room
        const activeBooking = await prisma.booking.findFirst({
            where: {
                roomId: room.id,
                status: "checked_in"
            },
            orderBy: {
                checkInDate: "desc"
            }
        });

        const hotelInfoData = room.hotel.hotelInfo;

        const hotelInfoPayload = hotelInfoData
            ? {
                  receptionNumber: hotelInfoData.receptionNumber ?? null,
                  emergencyNumber: hotelInfoData.emergencyNumber ?? null,
                  checkInTime: hotelInfoData.checkInTime ?? null,
                  checkOutTime: hotelInfoData.checkOutTime ?? null,
                  hotelDescription: hotelInfoData.hotelDescription ?? null,
                  amenities: hotelInfoData.amenities ?? [],
                  wifiInfos: hotelInfoData.wifiInfos.map((wifi) => ({
                      id: wifi.id,
                      networkName: wifi.networkName,
                      password: wifi.password ?? null,
                      description: wifi.description ?? null,
                      isPublic: wifi.isPublic,
                      bandwidth: wifi.bandwidth ?? null,
                      coverage: wifi.coverage ?? null,
                      instructions: wifi.instructions ?? null
                  })),
                  tvGuides: hotelInfoData.tvGuides.map((guide) => ({
                      id: guide.id,
                      title: guide.title,
                      description: guide.description ?? null,
                      category: guide.category ?? null,
                      channels: guide.channels.map((channel) => ({
                          id: channel.id,
                          number: channel.number,
                          name: channel.name,
                          category: channel.category ?? null,
                          language: channel.language ?? null,
                          isHd: channel.isHd,
                          logo: channel.logo ?? null,
                          description: channel.description ?? null
                      }))
                  })),
                  foodMenus: hotelInfoData.foodMenus.map((menu) => ({
                      id: menu.id,
                      name: menu.name,
                      description: menu.description ?? null,
                      category: menu.category ?? null,
                      isActive: menu.isActive,
                      availableFrom: menu.availableFrom ?? null,
                      availableTo: menu.availableTo ?? null,
                      menuItems: menu.menuItems.map((item) => ({
                          id: item.id,
                          name: item.name,
                          description: item.description ?? null,
                          price: item.price ?? null,
                          category: item.category ?? null,
                          isVegetarian: item.isVegetarian,
                          isVegan: item.isVegan,
                          allergens: item.allergens ?? [],
                          spiceLevel: item.spiceLevel ?? null,
                          isAvailable: item.isAvailable,
                          image: item.image ?? null,
                          prepTime: item.prepTime ?? null,
                          calories: item.calories ?? null
                      }))
                  }))
              }
            : null;

        return NextResponse.json({
            success: true,
            room: {
                id: room.id,
                roomNumber: room.roomNumber,
                roomType: room.roomType,
                hotel: {
                    id: room.hotel.id,
                    name: room.hotel.name,
                    contactEmail: room.hotel.contactEmail,
                    contactPhone: room.hotel.contactPhone,
                    receptionNumber: hotelInfoPayload?.receptionNumber ?? null
                }
            },
            booking: activeBooking
                ? {
                      id: activeBooking.id,
                      bookingReference: activeBooking.bookingReference,
                      guestName: activeBooking.guestName
                  }
                : null,
            hotelInfo: hotelInfoPayload
        });
    } catch (error) {
        console.error("Guest room access error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
