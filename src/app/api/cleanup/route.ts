import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        // Check for API key or internal call
        const authHeader = request.headers.get("authorization");
        const apiKey = request.headers.get("x-api-key");

        // For security, only allow this from internal calls or with proper API key
        if (
            authHeader !== "Bearer internal-cleanup" &&
            apiKey !== process.env.CLEANUP_API_KEY
        ) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Calculate 24 hours ago
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

        // Delete service requests older than 24 hours
        const deleteResult = await prisma.serviceRequest.deleteMany({
            where: {
                requestedAt: {
                    lt: twentyFourHoursAgo
                }
            }
        });

        // Also cleanup related notifications older than 24 hours
        const notificationDeleteResult = await prisma.notification.deleteMany({
            where: {
                type: "service_request_created",
                createdAt: {
                    lt: twentyFourHoursAgo
                }
            }
        });

        console.log(
            `Cleanup completed: Deleted ${deleteResult.count} service requests and ${notificationDeleteResult.count} notifications`
        );

        return NextResponse.json({
            success: true,
            message: "Cleanup completed successfully",
            deleted: {
                serviceRequests: deleteResult.count,
                notifications: notificationDeleteResult.count
            }
        });
    } catch (error) {
        console.error("Cleanup error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// Manual cleanup endpoint for admins
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const hours = parseInt(searchParams.get("hours") || "24");

        // Validate hours parameter
        if (isNaN(hours) || hours < 1 || hours > 168) {
            // Max 7 days
            return NextResponse.json(
                {
                    error: "Invalid hours parameter. Must be between 1 and 168 (7 days)"
                },
                { status: 400 }
            );
        }

        // Calculate cutoff time
        const cutoffTime = new Date();
        cutoffTime.setHours(cutoffTime.getHours() - hours);

        // Delete old service requests
        const deleteResult = await prisma.serviceRequest.deleteMany({
            where: {
                requestedAt: {
                    lt: cutoffTime
                }
            }
        });

        // Also cleanup related notifications
        const notificationDeleteResult = await prisma.notification.deleteMany({
            where: {
                type: "service_request_created",
                createdAt: {
                    lt: cutoffTime
                }
            }
        });

        return NextResponse.json({
            success: true,
            message: `Deleted service requests and notifications older than ${hours} hours`,
            deleted: {
                serviceRequests: deleteResult.count,
                notifications: notificationDeleteResult.count
            }
        });
    } catch (error) {
        console.error("Manual cleanup error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
