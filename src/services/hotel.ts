import { api } from "./api";

export interface HotelService {
    id: string;
    name: string;
    description: string;
    category: string;
    price: number;
    isActive: boolean;
    icon: string;
    estimatedTime?: string;
    hotelId: string;
}

export interface CreateHotelServiceData {
    name: string;
    description: string;
    category: string;
    price: number;
    icon: string;
    estimatedTime?: string;
}

export interface UpdateHotelServiceData {
    name?: string;
    description?: string;
    category?: string;
    price?: number;
    icon?: string;
    estimatedTime?: string;
    isActive?: boolean;
}

export interface HotelProfile {
    id: string;
    name: string;
    address: string;
    phone: string;
    email: string;
    description?: string;
    amenities: string[];
    checkInTime: string;
    checkOutTime: string;
}

export interface UpdateHotelProfileData {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
    description?: string;
    amenities?: string[];
    checkInTime?: string;
    checkOutTime?: string;
}

export const hotelService = {
    // Hotel profile management
    profile: {
        // Get hotel profile
        getProfile: () => api.get("/hotel/profile"),

        // Update hotel profile
        updateProfile: (data: UpdateHotelProfileData) =>
            api.put("/hotel/profile", data)
    },

    // Hotel services management
    services: {
        // Get all hotel services
        getServices: () => api.get("/hotel/services"),

        // Get single service
        getService: (id: string) => api.get(`/hotel/services/${id}`),

        // Create new service
        createService: (data: CreateHotelServiceData) =>
            api.post("/hotel/services", data),

        // Update service
        updateService: (id: string, data: UpdateHotelServiceData) =>
            api.put(`/hotel/services/${id}`, data),

        // Delete service
        deleteService: (id: string) => api.delete(`/hotel/services/${id}`)
    },

    // Guest endpoints for services
    guest: {
        // Get available services for guests
        getAvailableServices: (params: { roomId: string; hotelId: string }) =>
            api.get("/guest/services", { params })
    }
};
