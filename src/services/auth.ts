import { api } from "./api";

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    role?: string;
}

export interface GuestRegisterData {
    name: string;
    email: string;
    bookingId: string;
}

export interface ForgotPasswordData {
    email: string;
}

export interface ResetPasswordData {
    token: string;
    password: string;
}

export const authService = {
    // Register new user
    register: (data: RegisterData) => api.post("/auth/register", data),

    // Guest registration
    guestRegister: (data: GuestRegisterData) =>
        api.post("/auth/guest-register", data),

    // Forgot password
    forgotPassword: (data: ForgotPasswordData) =>
        api.post("/auth/forgot-password", data),

    // Reset password
    resetPassword: (data: ResetPasswordData) =>
        api.post("/auth/reset-password", data),

    // Verify email
    verifyEmail: (token: string) => api.post("/auth/verify-email", { token })
};
