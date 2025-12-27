// Shared TypeScript type definitions for the StayScan Hotel Concierge Service

export interface User {
    id: string;
    email: string;
    name: string;
    phone?: string;
    role: "super_admin" | "hotel_admin" | "hotel_staff" | "guest";
    hotelId?: string;
    createdAt: Date;
    updatedAt: Date;
    lastLogin?: Date;
}

export interface Hotel {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    contactEmail: string;
    contactPhone: string;
    totalRooms: number;
    subscriptionPlan: "free" | "basic" | "premium" | "enterprise";
    subscriptionStatus: "active" | "inactive" | "cancelled" | "past_due";
    adminId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Room {
    id: string;
    roomNumber: string;
    roomType: string;
    accessCode: string;
    isOccupied: boolean;
    currentBookingId?: string;
    hotelId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ServiceRequest {
    id: string;
    title: string;
    description?: string;
    priority: "low" | "medium" | "high" | "urgent";
    status: "pending" | "in_progress" | "completed" | "cancelled";
    serviceType: string;
    guestId: string;
    assignedStaffId?: string;
    hotelId: string;
    roomId?: string;
    estimatedDuration?: number;
    actualDuration?: number;
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date;
}

export interface Booking {
    id: string;
    checkIn: Date;
    checkOut: Date;
    status: "confirmed" | "checked_in" | "checked_out" | "cancelled";
    guestId: string;
    roomId: string;
    hotelId: string;
    totalAmount: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface GuestSession {
    id: string;
    sessionToken: string;
    guestId: string;
    hotelId: string;
    roomId?: string;
    isActive: boolean;
    expiresAt: Date;
    createdAt: Date;
}

export interface Service {
    id: string;
    name: string;
    description?: string;
    category: string;
    icon?: string;
    isActive: boolean;
    estimatedDuration?: number;
    hotelId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: "info" | "success" | "warning" | "error";
    isRead: boolean;
    userId: string;
    relatedId?: string;
    relatedType?: string;
    createdAt: Date;
}

export interface Payment {
    id: string;
    amount: number;
    currency: string;
    status: "pending" | "completed" | "failed" | "refunded";
    paymentMethod: string;
    transactionId?: string;
    hotelId: string;
    subscriptionId?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Subscription {
    id: string;
    plan: "free" | "basic" | "premium" | "enterprise";
    status: "active" | "inactive" | "cancelled" | "past_due";
    billingCycle: "monthly" | "yearly";
    roomTier: "tier_1_20" | "tier_21_50" | "tier_51_100" | "tier_100_plus";
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    hotelId: string;
    createdAt: Date;
    updatedAt: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// Component Props Types
export interface ButtonProps {
    children: React.ReactNode;
    variant?: "primary" | "secondary" | "danger" | "success";
    size?: "sm" | "md" | "lg";
    disabled?: boolean;
    loading?: boolean;
    onClick?: () => void;
    type?: "button" | "submit" | "reset";
    className?: string;
}

export interface InputProps {
    label?: string;
    placeholder?: string;
    type?: "text" | "email" | "password" | "number" | "tel";
    value?: string;
    onChange?: (value: string) => void;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
}

export interface SelectProps {
    label?: string;
    options: { value: string; label: string }[];
    value?: string;
    onChange?: (value: string) => void;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    placeholder?: string;
    className?: string;
}

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: "sm" | "md" | "lg" | "xl";
}

// Dashboard Types
export interface DashboardStats {
    totalRooms: number;
    occupiedRooms: number;
    availableRooms: number;
    occupancyRate: number;
    totalStaff: number;
    activeRequests: number;
    completedRequests: number;
    averageResponseTime: number;
    revenueThisMonth: number;
    guestSatisfaction: number;
}

export interface ChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor?: string | string[];
        borderColor?: string;
        borderWidth?: number;
    }[];
}

// Form Data Types
export interface LoginFormData {
    email: string;
    password: string;
}

export interface RegisterFormData {
    hotelName: string;
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    phone: string;
    plan: "free" | "basic" | "premium" | "enterprise";
}

export interface ForgotPasswordFormData {
    email: string;
}

export interface ResetPasswordFormData {
    password: string;
    confirmPassword: string;
}

export interface HotelFormData {
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    contactEmail: string;
    contactPhone: string;
    totalRooms: number;
}

export interface RoomFormData {
    roomNumber: string;
    roomType: string;
}

export interface StaffFormData {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: "hotel_staff" | "hotel_admin";
}

export interface ServiceRequestFormData {
    serviceId: string;
    title: string;
    description?: string;
    priority: "low" | "medium" | "high" | "urgent";
}

// Utility Types
export type LoadingStatus = "idle" | "loading" | "success" | "error";

export interface LoadingState<T = any> {
    status: "idle" | "loading" | "success" | "error";
    data?: T;
    error?: string;
}

export interface PaginationState {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface FilterState {
    search?: string;
    status?: string;
    type?: string;
    dateFrom?: Date;
    dateTo?: Date;
}

export interface SortState {
    field: string;
    direction: "asc" | "desc";
}

// Session Types (extending NextAuth)
export interface SessionUser {
    id: string;
    email: string;
    name: string;
    role: "super_admin" | "hotel_admin" | "hotel_staff" | "guest";
    hotelId?: string;
    hotel?: {
        id: string;
        name: string;
        subscriptionPlan: string;
    };
}

export interface ExtendedSession {
    user: SessionUser;
    expires: string;
}

// Error Types
export interface AppError {
    code: string;
    message: string;
    details?: any;
}

export interface ValidationError {
    field: string;
    message: string;
}

// Theme Types
export interface ThemeColors {
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    neutral: string;
}

export interface Theme {
    colors: ThemeColors;
    fonts: {
        primary: string;
        secondary: string;
    };
    spacing: {
        xs: string;
        sm: string;
        md: string;
        lg: string;
        xl: string;
    };
}

// Hotel Setup Types
export interface HotelInfo {
    id: string;
    hotelId: string;
    receptionNumber?: string;
    emergencyNumber?: string;
    checkInTime?: string;
    checkOutTime?: string;
    hotelDescription?: string;
    amenities: string[];
    wifiInfos?: HotelWifi[];
    tvGuides?: TvGuide[];
    foodMenus?: FoodMenu[];
    createdAt: Date;
    updatedAt: Date;
}

export interface HotelWifi {
    id: string;
    hotelInfoId: string;
    networkName: string;
    password?: string;
    description?: string;
    isPublic: boolean;
    bandwidth?: string;
    coverage?: string;
    instructions?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface TvGuide {
    id: string;
    hotelInfoId: string;
    title: string;
    description?: string;
    category?: string;
    channels: TvChannel[];
    createdAt: Date;
    updatedAt: Date;
}

export interface TvChannel {
    id: string;
    tvGuideId: string;
    number: number;
    name: string;
    category?: string;
    language?: string;
    isHd: boolean;
    logo?: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface FoodMenu {
    id: string;
    hotelInfoId: string;
    name: string;
    description?: string;
    category?: string;
    isActive: boolean;
    availableFrom?: string;
    availableTo?: string;
    menuItems: MenuItem[];
    createdAt: Date;
    updatedAt: Date;
}

export interface MenuItem {
    id: string;
    menuId: string;
    name: string;
    description?: string;
    price?: number;
    category?: string;
    isVegetarian: boolean;
    isVegan: boolean;
    allergens: string[];
    spiceLevel?: string;
    isAvailable: boolean;
    image?: string;
    prepTime?: string;
    calories?: number;
    createdAt: Date;
    updatedAt: Date;
}

// Hotel Setup Form Types
export interface HotelInfoFormData {
    receptionNumber?: string;
    emergencyNumber?: string;
    checkInTime?: string;
    checkOutTime?: string;
    hotelDescription?: string;
    amenities: string[];
}

export interface HotelWifiFormData {
    networkName: string;
    password?: string;
    description?: string;
    isPublic: boolean;
    bandwidth?: string;
    coverage?: string;
    instructions?: string;
}

export interface TvGuideFormData {
    title: string;
    description?: string;
    category?: string;
}

export interface TvChannelFormData {
    number: number;
    name: string;
    category?: string;
    language?: string;
    isHd: boolean;
    logo?: string;
    description?: string;
}

export interface FoodMenuFormData {
    name: string;
    description?: string;
    category?: string;
    isActive: boolean;
    availableFrom?: string;
    availableTo?: string;
}

export interface MenuItemFormData {
    name: string;
    description?: string;
    price?: number;
    category?: string;
    isVegetarian: boolean;
    isVegan: boolean;
    allergens: string[];
    spiceLevel?: string;
    isAvailable: boolean;
    image?: string;
    prepTime?: string;
    calories?: number;
}
