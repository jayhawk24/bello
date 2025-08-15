import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define protected routes
const protectedRoutes = ['/dashboard', '/hotel', '/room', '/staff'];
const authRoutes = ['/login', '/register'];
const guestRoutes = ['/guest'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    // Get the token from the request
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    });

    // Check if the current path is protected
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
    const isGuestRoute = guestRoutes.some(route => pathname.startsWith(route));

    // Handle protected routes
    if (isProtectedRoute) {
        if (!token) {
            // Redirect to login if no token
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(loginUrl);
        }

        // Role-based access control
        const userRole = token.role as string;
        
        // Check if staff users are trying to access admin-only routes
        if (userRole === 'hotel_staff') {
            const staffRestrictedRoutes = ['/staff'];
            const isStaffRestricted = staffRestrictedRoutes.some(route => 
                pathname.startsWith(route)
            );
            
            if (isStaffRestricted) {
                // Redirect staff users to dashboard
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }
        }

        // Super admin can access everything
        // Hotel admin can access everything except super admin routes
        // Hotel staff can access dashboard and room management only
    }

    // Handle auth routes (login, register)
    if (isAuthRoute && token) {
        // Redirect authenticated users away from auth pages
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Handle guest routes
    if (isGuestRoute) {
        // Guest routes don't require authentication
        // But we can add specific guest validation here if needed
        return NextResponse.next();
    }

    // Allow the request to continue
    return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/auth (NextAuth.js API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder files
         */
        '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
    ],
};
