import { Metadata } from "next";

const siteName = "StayScan";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://stayscan.in";
const defaultDescription =
    "Premium concierge services for hotel guests. Access services, make requests, and enhance your stay experience with StayScan.";

export const defaultMetadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title: {
        default: `${siteName} - Hotel Concierge Service`,
        template: `%s | ${siteName}`
    },
    description: defaultDescription,
    keywords: [
        "stayscan",
        "hotel concierge",
        "hotel service",
        "guest services",
        "hotel management",
        "room service",
        "hospitality",
        "hotel technology",
        "digital concierge",
        "hotel app"
    ],
    authors: [{ name: siteName }],
    creator: siteName,
    publisher: siteName,
    formatDetection: {
        email: false,
        address: false,
        telephone: false
    },
    openGraph: {
        type: "website",
        locale: "en_US",
        url: siteUrl,
        siteName: siteName,
        title: `${siteName} - Hotel Concierge Service`,
        description: defaultDescription,
        images: [
            {
                url: `${siteUrl}/og-image.png`,
                width: 1200,
                height: 630,
                alt: `${siteName} - Hotel Concierge Service`
            }
        ]
    },
    twitter: {
        card: "summary_large_image",
        title: `${siteName} - Hotel Concierge Service`,
        description: defaultDescription,
        images: [`${siteUrl}/og-image.png`],
        creator: "@stayscan"
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1
        }
    }
};

export function generatePageMetadata({
    title,
    description,
    path = "",
    image,
    noIndex = false
}: {
    title: string;
    description: string;
    path?: string;
    image?: string;
    noIndex?: boolean;
}): Metadata {
    const pageUrl = `${siteUrl}${path}`;
    const pageImage = image || `${siteUrl}/og-image.png`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url: pageUrl,
            siteName: siteName,
            images: [
                {
                    url: pageImage,
                    width: 1200,
                    height: 630,
                    alt: title
                }
            ],
            type: "website",
            locale: "en_US"
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [pageImage],
            creator: "@stayscan"
        },
        alternates: {
            canonical: pageUrl
        },
        robots: noIndex
            ? {
                  index: false,
                  follow: false
              }
            : {
                  index: true,
                  follow: true
              }
    };
}

// Specific page metadata
export const pageMetadata = {
    home: generatePageMetadata({
        title: "StayScan - Digital Concierge for Modern Hotels",
        description:
            "Transform your hotel guest experience with StayScan. QR-based room service, housekeeping requests, and concierge services. No app download required. Trusted by 2.3M+ requests.",
        path: "/"
    }),

    pricing: generatePageMetadata({
        title: "Pricing Plans",
        description:
            "Choose the perfect StayScan plan for your hotel. From small boutique properties to large enterprises. Flexible monthly and annual billing. Start with a free trial.",
        path: "/pricing"
    }),

    privacy: generatePageMetadata({
        title: "Privacy Policy",
        description:
            "Read StayScan's Privacy Policy to understand how we collect, use, and protect your data. Your privacy is our priority.",
        path: "/privacy"
    }),

    terms: generatePageMetadata({
        title: "Terms of Service",
        description:
            "Review StayScan's Terms of Service. Learn about user agreements, service usage guidelines, and legal policies.",
        path: "/terms"
    }),

    contact: generatePageMetadata({
        title: "Contact Us",
        description:
            "Get in touch with StayScan. Our support team is ready to help with your questions about digital concierge services for hotels.",
        path: "/contact"
    }),

    login: generatePageMetadata({
        title: "Hotel Login",
        description:
            "Sign in to your StayScan hotel dashboard. Manage rooms, services, and guest requests from one central location.",
        path: "/login",
        noIndex: true
    }),

    register: generatePageMetadata({
        title: "Hotel Registration",
        description:
            "Register your hotel with StayScan. Start offering premium digital concierge services to your guests today.",
        path: "/register"
    }),

    guestRegister: generatePageMetadata({
        title: "Guest Registration",
        description:
            "Create your guest account to access exclusive hotel services and amenities during your stay.",
        path: "/guest-register",
        noIndex: true
    }),

    forgotPassword: generatePageMetadata({
        title: "Forgot Password",
        description:
            "Reset your StayScan password. Enter your email to receive password reset instructions.",
        path: "/forgot-password",
        noIndex: true
    }),

    resetPassword: generatePageMetadata({
        title: "Reset Password",
        description: "Create a new password for your StayScan account.",
        path: "/reset-password",
        noIndex: true
    }),

    dashboard: generatePageMetadata({
        title: "Hotel Dashboard",
        description:
            "Manage your hotel operations, view service requests, monitor guest satisfaction, and analyze performance metrics.",
        path: "/dashboard",
        noIndex: true
    }),

    dashboardServices: generatePageMetadata({
        title: "Manage Services",
        description:
            "Configure and manage hotel services available to your guests. Customize service offerings and pricing.",
        path: "/dashboard/services",
        noIndex: true
    }),

    dashboardHotel: generatePageMetadata({
        title: "Hotel Settings",
        description:
            "Manage your hotel profile, settings, branding, and operational preferences.",
        path: "/dashboard/hotel",
        noIndex: true
    }),

    dashboardRooms: generatePageMetadata({
        title: "Manage Rooms",
        description:
            "View and manage all hotel rooms. Add new rooms, edit details, and generate QR codes for guest access.",
        path: "/dashboard/rooms",
        noIndex: true
    }),

    dashboardStaff: generatePageMetadata({
        title: "Staff Management",
        description:
            "Manage hotel staff accounts, roles, and permissions. Add or remove team members.",
        path: "/dashboard/staff",
        noIndex: true
    }),

    dashboardStaffRequests: generatePageMetadata({
        title: "Staff Requests",
        description:
            "View and manage all guest service requests. Track status, assign staff, and ensure timely completion.",
        path: "/dashboard/staff-requests",
        noIndex: true
    }),

    dashboardSubscription: generatePageMetadata({
        title: "Subscription & Billing",
        description:
            "Manage your StayScan subscription, view billing history, and update payment methods.",
        path: "/dashboard/subscription",
        noIndex: true
    }),

    superAdmin: generatePageMetadata({
        title: "Super Admin",
        description:
            "System administration panel for managing all hotels and platform settings.",
        path: "/dashboard/super-admin",
        noIndex: true
    }),

    guestDashboard: generatePageMetadata({
        title: "Guest Dashboard",
        description:
            "Welcome to your guest portal. Access hotel services, make requests, and manage your stay.",
        path: "/guest/dashboard",
        noIndex: true
    }),

    guestServices: generatePageMetadata({
        title: "Hotel Services",
        description:
            "Browse and request hotel services including room service, housekeeping, concierge, and more.",
        path: "/guest/services",
        noIndex: true
    }),

    guestRequests: generatePageMetadata({
        title: "My Requests",
        description:
            "View and track all your service requests. Get real-time updates on request status.",
        path: "/guest/requests",
        noIndex: true
    }),

    guestRoom: generatePageMetadata({
        title: "Room Information",
        description:
            "View your room details, amenities, and access digital room services.",
        path: "/guest/room",
        noIndex: true
    }),

    guestQrScan: generatePageMetadata({
        title: "Scan QR Code",
        description:
            "Scan your room QR code to access hotel services and amenities.",
        path: "/guest/qr-scan",
        noIndex: true
    }),

    guestBookingId: generatePageMetadata({
        title: "Enter Booking ID",
        description:
            "Enter your booking ID to access your reserved room and hotel services.",
        path: "/guest/booking-id",
        noIndex: true
    })
};
