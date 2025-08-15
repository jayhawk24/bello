# Hotel Concierge Service - AI Coding Agent Instructions

## Project Overview
This is a Next.js 14 full-stack hotel concierge service platform with subscription-based access. The system serves 4 user roles: Super Admin, Hotel Admin, Hotel Staff, and Guest.

## Architecture & Design Patterns

### Theme & Styling
- **Primary Color**: Yellow (#FFD700, #FFF59D variants)
- **Design Language**: Minion-inspired theme with rounded corners, playful typography
- **CSS Framework**: Tailwind CSS with custom yellow color palette
- **UI Components**: Create reusable components following minion aesthetic (bright yellows, blues for accents)

### User Role-Based Architecture
```
Super Admin -> Manages multiple hotels and system configuration
Hotel Admin -> Manages single hotel, staff, and guest access
Hotel Staff -> Handles service requests and guest assistance  
Guest -> Accesses services via QR code/booking ID (temporary or registered)
```

### Database Schema Key Relationships
- **Hotels** ↔ **Users** (hotel_admin relationship)
- **Rooms** → **Hotels** → **QR Codes** (unique per room)
- **Bookings** → **Rooms** → **Guests** (check-in/out flow)
- **Service_Requests** → **Services** + **Guests** + **Staff** (workflow tracking)
- **Subscriptions** → **Hotels** (Razorpay integration, room-tier based pricing)

## Technology Stack & Key Dependencies

### Core Stack
- **Next.js 14**: App router, TypeScript, API routes
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth.js (role-based permissions)
- **Payments**: Razorpay (subscription model)
- **Real-time**: WebSockets for service notifications

### Development Workflow
```bash
npm run dev          # Development server
npm run build        # Production build
npm run db:push      # Push Prisma schema changes
npm run db:studio    # Open Prisma Studio
```

## Critical Implementation Patterns

### Guest Access Flow
1. **QR Code Scan** → Room verification → Check-in/out time capture
2. **Booking ID Entry** → Booking lookup → Session creation
3. **Guest Registration** → Persistent account with service history

### Service Request Workflow
```
Guest Request → Staff Assignment → Status Updates → Completion → Rating/Feedback
Status: pending → in_progress → completed/cancelled
```

### Subscription & Billing Logic
- **Tiers**: Basic (1 hotel), Premium (5 hotels), Enterprise (10+ hotels)
- **Room Pricing**: 1-20, 21-50, 51-100, 100+ room tiers
- **Billing**: Monthly/Yearly cycles via Razorpay

### Role-Based Route Protection
```typescript
// Implement middleware for role checking
const rolePermissions = {
  super_admin: ['*'],
  hotel_admin: ['/dashboard/hotel', '/dashboard/staff', '/dashboard/rooms'],
  hotel_staff: ['/dashboard/requests', '/dashboard/guests'],
  guest: ['/services', '/requests', '/history']
}
```

## File Structure Conventions
```
src/
├── app/                    # Next.js 14 app router
│   ├── (auth)/            # Auth group routes
│   ├── dashboard/         # Role-based dashboards
│   └── api/               # API routes
├── components/
│   ├── ui/                # Reusable UI components (yellow theme)
│   ├── forms/             # Form components with validation
│   └── dashboard/         # Role-specific dashboard components
├── lib/
│   ├── prisma.ts          # Database client
│   ├── auth.ts            # NextAuth configuration
│   └── razorpay.ts        # Payment integration
└── prisma/
    └── schema.prisma      # Database schema
```

## Key Integration Points

### QR Code Generation & Management
- Generate unique QR codes per room containing: `hotel_id` + `room_number` + `access_code`
- QR codes should be printable and permanent for hotel room placement
- Implement QR scanning with camera access in guest interface

### Razorpay Subscription Flow
1. Hotel admin selects plan → Razorpay checkout → Webhook verification
2. Store `razorpay_subscription_id` and `razorpay_customer_id`
3. Handle subscription status changes via webhooks

### Real-time Notifications
- WebSocket connection for service request updates
- Push notifications for status changes (pending → in_progress → completed)
- Staff dashboard real-time request queue

## Development Guidelines

### Component Naming
- Use descriptive names: `GuestServiceRequestForm`, `HotelAdminDashboard`
- Yellow theme components: `YellowButton`, `MinionCard`, `YellowBadge`

### API Route Structure
```
/api/auth/          # NextAuth endpoints
/api/hotels/        # Hotel management
/api/rooms/         # Room and QR code management  
/api/services/      # Service catalog and requests
/api/payments/      # Razorpay integration
/api/analytics/     # Dashboard analytics
```

### Database Migrations
- Always create migrations for schema changes: `npx prisma migrate dev --name descriptive_name`
- Seed default services data for new hotels
- Handle subscription tier changes with proper data migration

## Critical Business Logic

### Guest Session Management
- Temporary sessions expire when checkout time reached
- Registered guests maintain persistent access across stays
- QR code scan creates/extends session automatically

### Service Assignment Logic
- Auto-assign to available staff based on service category
- Manual reassignment capability for hotel admins
- Priority queuing for VIP guests (future feature)

Refer to `PROJECT_REQUIREMENTS.md` for complete feature specifications and answered clarification questions.
