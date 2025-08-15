# Development Instructions for Hotel Concierge Service Project

## Project Development Guidelines

### Phase-by-Phase Implementation Strategy

#### Phase 1: Project Foundation
1. **Setup Next.js 14 with TypeScript**
   - Configure app router structure
   - Setup Tailwind CSS with yellow minion theme
   - Create base layout and navigation

2. **Database & Authentication Setup**
   - Initialize Prisma with PostgreSQL
   - Setup NextAuth.js with role-based authentication
   - Create database schema based on PROJECT_REQUIREMENTS.md

3. **Core File Structure**
   ```
   src/
   ├── app/
   │   ├── (auth)/           # Authentication routes
   │   ├── dashboard/        # Role-specific dashboards
   │   ├── guest/           # Guest access routes
   │   ├── api/             # API endpoints
   │   └── globals.css      # Global styles
   ├── components/
   │   ├── ui/              # Reusable UI components
   │   ├── auth/            # Authentication components
   │   ├── dashboard/       # Dashboard-specific components
   │   └── forms/           # Form components
   ├── lib/
   │   ├── prisma.ts        # Database client
   │   ├── auth.ts          # NextAuth configuration
   │   ├── utils.ts         # Utility functions
   │   └── validations.ts   # Zod schemas
   └── types/
       └── index.ts         # TypeScript type definitions
   ```

#### Phase 2: Authentication & User Management
1. **User Registration Flow**
   - Hotel admin registration with subscription
   - Email verification
   - Role assignment

2. **Authentication Pages**
   - Login/Signup forms
   - Password reset
   - Role-based redirects

3. **Middleware Implementation**
   - Route protection
   - Role-based access control
   - Session management

#### Phase 3: Hotel Management System
1. **Hotel Admin Dashboard**
   - Hotel profile management
   - Room configuration
   - Staff management
   - QR code generation

2. **Room Management**
   - Add/edit/delete rooms
   - Generate unique QR codes
   - Booking management

3. **Staff Management**
   - Create staff accounts
   - Assign roles and permissions
   - Activity tracking

#### Phase 4: Guest Access System
1. **Guest Entry Points**
   - QR code scanning interface
   - Booking ID entry
   - Guest registration

2. **Session Management**
   - Temporary sessions for non-registered guests
   - Persistent accounts for registered guests
   - Check-in/check-out flow

3. **Guest Dashboard**
   - Service catalog
   - Request history
   - Profile management

#### Phase 5: Service Request System
1. **Service Catalog**
   - Default services (room service, housekeeping, etc.)
   - Hotel-specific services
   - Service categories and icons

2. **Request Workflow**
   - Guest service requests
   - Staff assignment logic
   - Status tracking (pending → in_progress → completed)
   - Real-time notifications

3. **Staff Interface**
   - Request queue
   - Task management
   - Status updates

#### Phase 6: Subscription & Payment System
1. **Razorpay Integration**
   - Subscription plans (Basic, Premium, Enterprise)
   - Room-tier pricing (1-20, 21-50, 51-100, 100+)
   - Webhook handling

2. **Billing Management**
   - Payment history
   - Plan upgrades/downgrades
   - Invoice generation

#### Phase 7: Analytics & Reporting
1. **Dashboard Analytics**
   - Occupancy rates
   - Revenue per available room (RevPAR)
   - Average daily rate (ADR)
   - Guest demographics

2. **Service Analytics**
   - Service request trends
   - Response times
   - Guest satisfaction ratings

#### Phase 8: Real-time Features
1. **WebSocket Implementation**
   - Real-time service notifications
   - Live status updates
   - Chat support system

2. **Push Notifications**
   - Service status changes
   - Staff assignments
   - Guest messages

### Development Standards & Conventions

#### Code Organization
- **Components**: Use PascalCase (e.g., `HotelDashboard`, `ServiceRequestForm`)
- **Files**: Use kebab-case for file names (e.g., `hotel-dashboard.tsx`)
- **API Routes**: RESTful naming conventions
- **Database**: Snake_case for table/column names

#### TypeScript Guidelines
- Define strict types for all data structures
- Use Zod for runtime validation
- Create shared type definitions in `types/index.ts`
- Implement proper error handling with typed responses

#### Styling Guidelines
- **Primary Colors**: 
  - Yellow: #FFD700 (primary), #FFF59D (light), #F57F17 (dark)
  - Blue: #2196F3 (accent), #BBDEFB (light)
  - Gray: #757575 (text), #F5F5F5 (background)
- **Component Styling**: Use Tailwind utility classes
- **Custom Components**: Create reusable yellow-themed components
- **Responsive Design**: Mobile-first approach

#### Database Guidelines
- Use Prisma migrations for all schema changes
- Include proper relationships and constraints
- Implement soft deletes where appropriate
- Add indexes for performance-critical queries

#### API Design Principles
- RESTful endpoints with proper HTTP methods
- Consistent response format:
  ```typescript
  {
    success: boolean;
    data?: any;
    error?: string;
    message?: string;
  }
  ```
- Implement proper error handling and status codes
- Add rate limiting for public endpoints

#### Security Considerations
- Implement CSRF protection
- Validate all inputs on server-side
- Use secure session management
- Implement proper role-based access control
- Sanitize QR code data

### Testing Strategy
- Unit tests for utility functions
- Integration tests for API routes
- E2E tests for critical user flows
- Test role-based access controls
- Validate payment workflows

### Performance Optimization
- Implement proper caching strategies
- Optimize database queries
- Use Next.js Image optimization
- Implement lazy loading for components
- Minimize bundle size

### Error Handling
- Implement global error boundary
- Log errors appropriately
- Provide user-friendly error messages
- Handle network failures gracefully
- Implement retry mechanisms

### Deployment Considerations
- Environment variable management
- Database migration strategy
- CDN setup for static assets
- SSL certificate configuration
- Monitoring and logging setup

### Key Implementation Priorities
1. **Security First**: Implement proper authentication and authorization
2. **User Experience**: Focus on intuitive interfaces for all user roles
3. **Performance**: Optimize for fast loading and responsive interactions
4. **Scalability**: Design for multi-hotel and multi-user scenarios
5. **Reliability**: Implement robust error handling and recovery

### Development Workflow
1. Always refer to PROJECT_REQUIREMENTS.md for feature specifications
2. Follow the phase-by-phase implementation order
3. Test each feature thoroughly before moving to next phase
4. Implement proper error handling and validation
5. Document any deviations or architectural decisions
6. Ensure responsive design across all components
7. Validate against user role permissions
8. Test payment flows in sandbox environment

### Dependencies Management
- Keep dependencies updated and secure
- Use exact versions for critical packages
- Document any package-specific configurations
- Implement proper dependency injection patterns

This document serves as the master guide for all development decisions and should be referenced throughout the project lifecycle.
