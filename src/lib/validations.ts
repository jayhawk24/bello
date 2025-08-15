import { z } from "zod";

// User registration validation
export const userRegistrationSchema = z
    .object({
        hotelName: z
            .string()
            .min(2, "Hotel name must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string(),
        firstName: z
            .string()
            .min(2, "First name must be at least 2 characters"),
        lastName: z.string().min(2, "Last name must be at least 2 characters"),
        phone: z.string().min(10, "Phone number must be at least 10 digits"),
        plan: z.enum(["basic", "premium", "enterprise"])
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"]
    });

// User login validation
export const userLoginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required")
});

// Guest booking ID validation
export const guestBookingSchema = z.object({
    bookingId: z.string().min(5, "Booking ID must be at least 5 characters")
});

// Hotel details validation
export const hotelDetailsSchema = z.object({
    name: z.string().min(2, "Hotel name must be at least 2 characters"),
    address: z.string().min(10, "Address must be at least 10 characters"),
    city: z.string().min(2, "City name must be at least 2 characters"),
    state: z.string().min(2, "State name must be at least 2 characters"),
    country: z.string().min(2, "Country name must be at least 2 characters"),
    contactEmail: z.string().email("Invalid email address"),
    contactPhone: z.string().min(10, "Phone number must be at least 10 digits"),
    totalRooms: z
        .number()
        .min(1, "Must have at least 1 room")
        .max(1000, "Maximum 1000 rooms allowed")
});

// Room validation
export const roomSchema = z.object({
    roomNumber: z.string().min(1, "Room number is required"),
    roomType: z.string().min(1, "Room type is required")
});

// Service request validation
export const serviceRequestSchema = z.object({
    serviceId: z.string().min(1, "Service is required"),
    title: z.string().min(5, "Title must be at least 5 characters"),
    description: z.string().optional(),
    priority: z.enum(["low", "medium", "high", "urgent"]).default("medium")
});

// Staff creation validation
export const staffCreationSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    password: z.string().min(8, "Password must be at least 8 characters")
});

export type UserRegistration = z.infer<typeof userRegistrationSchema>;
export type UserLogin = z.infer<typeof userLoginSchema>;
export type GuestBooking = z.infer<typeof guestBookingSchema>;
export type HotelDetails = z.infer<typeof hotelDetailsSchema>;
export type RoomData = z.infer<typeof roomSchema>;
export type ServiceRequestData = z.infer<typeof serviceRequestSchema>;
export type StaffData = z.infer<typeof staffCreationSchema>;
