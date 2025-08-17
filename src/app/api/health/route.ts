import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // Check database connection
        await prisma.$queryRaw`SELECT 1`;
        
        // Get some basic stats
        const hotelCount = await prisma.hotel.count();
        const userCount = await prisma.user.count();
        const serviceRequestCount = await prisma.serviceRequest.count();
        
        return NextResponse.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            database: 'connected',
            stats: {
                hotels: hotelCount,
                users: userCount,
                serviceRequests: serviceRequestCount,
            },
            version: process.env.npm_package_version || '0.1.0',
        });
    } catch (error) {
        console.error('Health check failed:', error);
        
        return NextResponse.json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            database: 'disconnected',
            error: 'Database connection failed',
            version: process.env.npm_package_version || '0.1.0',
        }, { status: 503 });
    }
}
