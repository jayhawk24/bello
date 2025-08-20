import { api } from "./api";

export interface ServiceRequest {
    id: string;
    type: string;
    description: string;
    priority: "low" | "medium" | "high" | "urgent";
    status: "pending" | "in_progress" | "completed" | "cancelled";
    roomId: string;
    guestId: string;
    assignedStaffId?: string;
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
    requestedAt: string;
    room?: {
        id: string;
        roomNumber: string;
        roomType: string;
    };
    guest?: {
        id: string;
        name: string;
        email: string;
        phone?: string;
    };
    assignedStaff?: {
        id: string;
        name: string;
    };
}

export interface CreateServiceRequestData {
    type: string;
    description: string;
    priority?: "low" | "medium" | "high" | "urgent";
    roomId: string;
}

export interface UpdateServiceRequestData {
    status?: "pending" | "in_progress" | "completed" | "cancelled";
    priority?: "low" | "medium" | "high" | "urgent";
    assignedStaffId?: string;
    description?: string;
}

export interface ServiceRequestFilters {
    status?: string;
    priority?: string;
    roomId?: string;
    assignedStaffId?: string;
    type?: string;
}

export interface ServiceRequestsResponse {
    success: boolean;
    serviceRequests: ServiceRequest[];
}

export const serviceRequestService = {
    // Staff endpoints
    staff: {
        // Get all service requests (for staff dashboard)
        getServiceRequests: (
            filters?: ServiceRequestFilters
        ): Promise<ServiceRequestsResponse> =>
            api.get("/staff/service-requests", { params: filters }),

        // Update service request
        updateServiceRequest: (
            data: UpdateServiceRequestData & { requestId: string }
        ) => api.patch("/staff/service-requests", data),

        // Delete service request
        deleteServiceRequest: (requestId: string) =>
            api.delete(`/staff/service-requests?requestId=${requestId}`)
    },

    // Guest endpoints
    guest: {
        // Create service request
        createServiceRequest: (data: CreateServiceRequestData) =>
            api.post("/guest/service-requests", data),

        // Get guest's service requests
        getMyServiceRequests: (params: { roomId: string; hotelId: string }) =>
            api.get("/guest/service-requests", { params })
    }
};
