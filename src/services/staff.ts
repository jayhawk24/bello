import { api } from "./api";

export interface StaffMember {
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
    isActive: boolean;
    hotelId: string;
    createdAt: string;
}

export interface CreateStaffData {
    name: string;
    email: string;
    role: string;
    department: string;
    password: string;
}

export interface UpdateStaffData {
    name?: string;
    email?: string;
    role?: string;
    department?: string;
    isActive?: boolean;
}

export interface StaffFilters {
    role?: string;
    department?: string;
    isActive?: boolean;
}

export const staffService = {
    // Get all staff members
    getStaff: (filters?: StaffFilters) =>
        api.get("/staff", { params: filters }),

    // Create new staff member
    createStaff: (data: CreateStaffData) => api.post("/staff", data),

    // Update staff member
    updateStaff: (id: string, data: UpdateStaffData) =>
        api.put(`/staff/${id}`, data),

    // Delete staff member
    deleteStaff: (id: string) => api.delete(`/staff/${id}`),

    // Get staff member profile
    getProfile: (id: string) => api.get(`/staff/${id}`)
};
