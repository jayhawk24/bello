# 🏨 Bello - Hotel Concierge Service Platform

A comprehensive Next.js full-stack application providing premium concierge services for hotel guests with a subscription-based model.

## ✨ Features

### 🎨 Design

-   **Minion-inspired Yellow Theme** - Playful, bright, and welcoming design
-   **Responsive Design** - Works seamlessly on all devices
-   **Modern UI Components** - Custom styled components with smooth animations

### 👥 User Roles

-   **Super Admin** - System-wide management and analytics
-   **Hotel Admin** - Hotel and staff management, room configuration
-   **Hotel Staff** - Service request handling and guest assistance
-   **Guest** - Service access via QR codes or booking IDs

### 🚀 Core Functionality

-   **QR Code Access** - Guests scan room QR codes for instant access
-   **Service Requests** - Room service, housekeeping, transportation, recommendations
-   **Real-time Updates** - Live status tracking and notifications
-   **Subscription Management** - Flexible pricing tiers with Razorpay integration
-   **Analytics Dashboard** - Comprehensive insights and reporting

## 🛠 Technology Stack

-   **Frontend**: Next.js 14, React, TypeScript
-   **Styling**: Tailwind CSS with custom minion theme
-   **Backend**: Next.js API routes
-   **Database**: PostgreSQL with Prisma ORM
-   **Authentication**: NextAuth.js (planned)
-   **Payments**: Razorpay integration (planned)
-   **Real-time**: WebSockets for notifications (planned)

## 🚀 Getting Started

### Prerequisites

-   Node.js 18+
-   npm or yarn
-   PostgreSQL database (for production)

### Installation

1. **Clone the repository**

    ```bash
    git clone <repository-url>
    cd bello
    ```

2. **Install dependencies**

    ```bash
    npm install
    ```

3. **Start development server**

    ```bash
    npm run dev
    ```

4. **Open in browser**
    ```
    http://localhost:3000
    ```

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/           # Authentication routes (login, register)
│   ├── guest/            # Guest access routes (QR scan, booking ID)
│   ├── dashboard/        # Role-based dashboards (planned)
│   ├── api/              # API endpoints (planned)
│   └── globals.css       # Global styles and theme
├── components/           # Reusable UI components (planned)
├── lib/                  # Utility functions and configurations (planned)
└── types/               # TypeScript type definitions (planned)
```

## 🎯 Development Phases

### ✅ Phase 1: Foundation (Current)

-   [x] Next.js 14 setup with TypeScript
-   [x] Tailwind CSS with minion-inspired theme
-   [x] Landing page with pricing tiers
-   [x] Basic authentication UI (login/register)
-   [x] Guest access UI (QR scan/booking ID)

### 🔄 Phase 2: Authentication & User Management (Next)

-   [ ] NextAuth.js setup
-   [ ] User registration with email verification
-   [ ] Role-based authentication middleware
-   [ ] Password reset functionality

### 📋 Phase 3: Hotel Management System

-   [ ] Hotel admin dashboard
-   [ ] Room configuration and QR code generation
-   [ ] Staff management interface
-   [ ] Hotel profile setup

### 🛎️ Phase 4: Guest Access System

-   [ ] QR code scanning implementation
-   [ ] Booking ID verification
-   [ ] Guest session management
-   [ ] Temporary vs registered guest accounts

### 🔧 Phase 5: Service Request System

-   [ ] Service catalog management
-   [ ] Request workflow (pending → in-progress → completed)
-   [ ] Staff assignment logic
-   [ ] Real-time status notifications

### 💳 Phase 6: Subscription & Payments

-   [ ] Razorpay integration
-   [ ] Subscription plan management
-   [ ] Billing and invoice generation
-   [ ] Plan upgrade/downgrade flows

### 📊 Phase 7: Analytics & Reporting

-   [ ] Occupancy rate tracking
-   [ ] Revenue analytics (RevPAR, ADR)
-   [ ] Guest satisfaction metrics
-   [ ] Service performance insights

### ⚡ Phase 8: Real-time Features

-   [ ] WebSocket implementation
-   [ ] Live notifications
-   [ ] Chat support system
-   [ ] Push notification setup

## 🎨 Theme & Design System

### Colors

-   **Primary**: `#FFD700` (Minion Yellow)
-   **Secondary**: `#2196F3` (Minion Blue)
-   **Success**: `#4CAF50`
-   **Warning**: `#FF9800`
-   **Error**: `#F44336`

### Components

-   **Buttons**: `.btn-minion`, `.btn-minion-secondary`
-   **Cards**: `.card-minion`
-   **Inputs**: `.input-minion`
-   **Animations**: `.animate-bounce-slow`, `.animate-fade-in`

## 📚 Documentation

-   [Project Requirements](./PROJECT_REQUIREMENTS.md) - Detailed feature specifications
-   [Development Instructions](./DEVELOPMENT_INSTRUCTIONS.md) - Development guidelines and standards
-   [AI Instructions](./.github/copilot-instructions.md) - AI coding agent guidelines

## 🔐 Environment Variables

Create a `.env.local` file with:

```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Razorpay
RAZORPAY_KEY_ID="your-key-id"
RAZORPAY_KEY_SECRET="your-key-secret"
```

## 🧪 Testing

```bash
npm run test          # Run tests (planned)
npm run test:e2e      # Run E2E tests (planned)
npm run type-check    # TypeScript type checking
npm run lint          # ESLint checks
```

## 🚀 Deployment

```bash
npm run build         # Build for production
npm start            # Start production server
```

## 📞 Support

For questions or support:

-   Create an issue in this repository
-   Contact the development team
-   Check the documentation files

---

Built with ❤️ using Next.js, TypeScript, and a touch of minion magic! 🍌
