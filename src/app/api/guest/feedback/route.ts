import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface FeedbackSubmission {
    serviceRequestId: string;
    overallRating: number; // 1-5 stars
    speedRating?: number;  // 1-5 stars
    qualityRating?: number; // 1-5 stars
    staffRating?: number;   // 1-5 stars
    feedback?: string;
    wouldRecommend?: boolean;
    improvementSuggestions?: string;
    isAnonymous?: boolean;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            serviceRequestId,
            overallRating,
            speedRating,
            qualityRating,
            staffRating,
            feedback,
            wouldRecommend,
            improvementSuggestions,
            isAnonymous = false
        }: FeedbackSubmission = body;

        if (!serviceRequestId || !overallRating) {
            return NextResponse.json(
                { error: 'Service request ID and overall rating are required' },
                { status: 400 }
            );
        }

        if (overallRating < 1 || overallRating > 5) {
            return NextResponse.json(
                { error: 'Rating must be between 1 and 5' },
                { status: 400 }
            );
        }

        // Check if the service request exists and is completed
        const serviceRequest = await prisma.serviceRequest.findUnique({
            where: { id: serviceRequestId },
            include: {
                guest: { select: { id: true, name: true } },
                hotel: { select: { id: true, name: true } },
                service: { select: { name: true, category: true } },
                assignedStaff: { select: { id: true, name: true } }
            }
        });

        if (!serviceRequest) {
            return NextResponse.json(
                { error: 'Service request not found' },
                { status: 404 }
            );
        }

        if (serviceRequest.status !== 'completed') {
            return NextResponse.json(
                { error: 'Can only provide feedback for completed requests' },
                { status: 400 }
            );
        }

        // Check if feedback already exists
        if (serviceRequest.guestRating) {
            return NextResponse.json(
                { error: 'Feedback has already been submitted for this request' },
                { status: 409 }
            );
        }

        // Update the service request with feedback
        const updatedRequest = await prisma.serviceRequest.update({
            where: { id: serviceRequestId },
            data: {
                guestRating: overallRating,
                guestFeedback: feedback || null
            }
        });

        // Create detailed feedback record (we'll need to add this table to schema)
        // For now, we'll store it in analytics events
        await prisma.analyticsEvent.create({
            data: {
                hotelId: serviceRequest.hotelId,
                eventType: 'guest_feedback_submitted',
                eventData: {
                    serviceRequestId: serviceRequestId,
                    guestId: serviceRequest.guestId,
                    assignedStaffId: serviceRequest.assignedStaffId,
                    serviceCategory: serviceRequest.service.category,
                    ratings: {
                        overall: overallRating,
                        speed: speedRating,
                        quality: qualityRating,
                        staff: staffRating
                    },
                    feedback: feedback,
                    wouldRecommend: wouldRecommend,
                    improvementSuggestions: improvementSuggestions,
                    isAnonymous: isAnonymous,
                    submittedAt: new Date()
                }
            }
        });

        // Send thank you notification to guest (implement later)
        // await sendThankYouNotification(serviceRequest.guestId);

        return NextResponse.json({
            success: true,
            message: 'Thank you for your feedback!',
            data: {
                overallRating: overallRating,
                feedbackSubmitted: true
            }
        });

    } catch (error) {
        console.error('Submit feedback error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        
        if (!session?.user || !session.user.hotelId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const serviceRequestId = searchParams.get('serviceRequestId');
        const dateFrom = searchParams.get('dateFrom');
        const dateTo = searchParams.get('dateTo');
        const minRating = searchParams.get('minRating');
        const maxRating = searchParams.get('maxRating');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        if (serviceRequestId) {
            // Get feedback for a specific request
            const serviceRequest = await prisma.serviceRequest.findFirst({
                where: {
                    id: serviceRequestId,
                    hotelId: session.user.hotelId
                },
                include: {
                    guest: { select: { name: true, email: true } },
                    service: { select: { name: true, category: true } },
                    assignedStaff: { select: { name: true } }
                }
            });

            if (!serviceRequest) {
                return NextResponse.json(
                    { error: 'Service request not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json({
                success: true,
                feedback: {
                    serviceRequestId: serviceRequest.id,
                    rating: serviceRequest.guestRating,
                    feedback: serviceRequest.guestFeedback,
                    guestName: serviceRequest.guest.name,
                    serviceName: serviceRequest.service.name,
                    assignedStaff: serviceRequest.assignedStaff?.name,
                    submittedAt: serviceRequest.completedAt
                }
            });
        }

        // Get feedback analytics for the hotel
        const whereClause: any = {
            hotelId: session.user.hotelId,
            eventType: 'guest_feedback_submitted'
        };

        if (dateFrom || dateTo) {
            whereClause.timestamp = {};
            if (dateFrom) whereClause.timestamp.gte = new Date(dateFrom);
            if (dateTo) whereClause.timestamp.lte = new Date(dateTo);
        }

        const feedbackEvents = await prisma.analyticsEvent.findMany({
            where: whereClause,
            orderBy: { timestamp: 'desc' },
            take: limit,
            skip: offset
        });

        // Filter by rating if specified
        let filteredEvents = feedbackEvents;
        if (minRating || maxRating) {
            filteredEvents = feedbackEvents.filter(event => {
                const rating = (event.eventData as any)?.ratings?.overall;
                if (!rating) return false;
                if (minRating && rating < parseInt(minRating)) return false;
                if (maxRating && rating > parseInt(maxRating)) return false;
                return true;
            });
        }

        // Calculate summary statistics
        const totalFeedback = filteredEvents.length;
        const ratings = filteredEvents.map(event => (event.eventData as any)?.ratings?.overall).filter(r => r);
        const averageRating = ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0;

        const ratingDistribution = {
            1: ratings.filter(r => r === 1).length,
            2: ratings.filter(r => r === 2).length,
            3: ratings.filter(r => r === 3).length,
            4: ratings.filter(r => r === 4).length,
            5: ratings.filter(r => r === 5).length
        };

        const recommendations = filteredEvents
            .map(event => (event.eventData as any)?.wouldRecommend)
            .filter(r => typeof r === 'boolean');
        
        const recommendationRate = recommendations.length > 0 
            ? (recommendations.filter(r => r).length / recommendations.length) * 100 
            : 0;

        return NextResponse.json({
            success: true,
            summary: {
                totalFeedback: totalFeedback,
                averageRating: Math.round(averageRating * 10) / 10,
                recommendationRate: Math.round(recommendationRate),
                ratingDistribution: ratingDistribution
            },
            feedback: filteredEvents.map(event => ({
                id: event.id,
                timestamp: event.timestamp,
                serviceRequestId: (event.eventData as any)?.serviceRequestId,
                guestId: (event.eventData as any)?.guestId,
                serviceCategory: (event.eventData as any)?.serviceCategory,
                ratings: (event.eventData as any)?.ratings,
                feedback: (event.eventData as any)?.feedback,
                wouldRecommend: (event.eventData as any)?.wouldRecommend,
                improvementSuggestions: (event.eventData as any)?.improvementSuggestions,
                isAnonymous: (event.eventData as any)?.isAnonymous
            })),
            pagination: {
                limit: limit,
                offset: offset,
                total: totalFeedback,
                hasMore: totalFeedback === limit
            }
        });

    } catch (error) {
        console.error('Get feedback error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Get feedback summary for dashboard
export async function PUT(request: NextRequest) {
    try {
        const session = await auth();
        
        if (!session?.user || !['hotel_admin', 'hotel_staff'].includes(session.user.role) || !session.user.hotelId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || '7'; // days
        
        const startDate = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);

        // Get completed requests with ratings
        const completedRequests = await prisma.serviceRequest.findMany({
            where: {
                hotelId: session.user.hotelId,
                status: 'completed',
                completedAt: { gte: startDate },
                guestRating: { not: null }
            },
            include: {
                service: { select: { category: true } },
                assignedStaff: { select: { id: true, name: true } }
            }
        });

        // Calculate metrics
        const totalRatedRequests = completedRequests.length;
        const averageRating = totalRatedRequests > 0 
            ? completedRequests.reduce((sum, req) => sum + (req.guestRating || 0), 0) / totalRatedRequests 
            : 0;

        // Group by service category
        const categoryRatings = completedRequests.reduce((acc, req) => {
            const category = req.service.category;
            if (!acc[category]) {
                acc[category] = { total: 0, count: 0, ratings: [] };
            }
            acc[category].total += req.guestRating || 0;
            acc[category].count += 1;
            acc[category].ratings.push(req.guestRating || 0);
            return acc;
        }, {} as Record<string, { total: number; count: number; ratings: number[] }>);

        const categoryAverages = Object.entries(categoryRatings).map(([category, data]) => ({
            category,
            averageRating: data.total / data.count,
            totalRatings: data.count
        }));

        // Group by staff
        const staffRatings = completedRequests.reduce((acc, req) => {
            if (req.assignedStaff) {
                const staffId = req.assignedStaff.id;
                if (!acc[staffId]) {
                    acc[staffId] = { 
                        name: req.assignedStaff.name, 
                        total: 0, 
                        count: 0, 
                        ratings: [] 
                    };
                }
                acc[staffId].total += req.guestRating || 0;
                acc[staffId].count += 1;
                acc[staffId].ratings.push(req.guestRating || 0);
            }
            return acc;
        }, {} as Record<string, { name: string; total: number; count: number; ratings: number[] }>);

        const staffAverages = Object.entries(staffRatings).map(([staffId, data]) => ({
            staffId,
            staffName: data.name,
            averageRating: data.total / data.count,
            totalRatings: data.count
        }));

        return NextResponse.json({
            success: true,
            period: parseInt(period),
            summary: {
                totalRatedRequests,
                averageRating: Math.round(averageRating * 10) / 10,
                ratingDistribution: {
                    1: completedRequests.filter(r => r.guestRating === 1).length,
                    2: completedRequests.filter(r => r.guestRating === 2).length,
                    3: completedRequests.filter(r => r.guestRating === 3).length,
                    4: completedRequests.filter(r => r.guestRating === 4).length,
                    5: completedRequests.filter(r => r.guestRating === 5).length
                }
            },
            categoryPerformance: categoryAverages.sort((a, b) => b.averageRating - a.averageRating),
            staffPerformance: staffAverages.sort((a, b) => b.averageRating - a.averageRating)
        });

    } catch (error) {
        console.error('Get feedback summary error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
