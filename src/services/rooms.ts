import { api } from "./api";

export interface Room {
    id: string;
    roomNumber: string;
    roomType: string;
    status: string;
    hotelId: string;
    capacity: number;
    amenities: string[];
    pricePerNight: number;
    isActive: boolean;
    accessCode?: string;
}

export interface CreateRoomData {
    number: string;
    type: string;
    capacity: number;
    pricePerNight: number;
    amenities?: string[];
}

export interface UpdateRoomData {
    number?: string;
    type?: string;
    capacity?: number;
    pricePerNight?: number;
    amenities?: string[];
    status?: string;
}

export interface RoomAccessResponse {
    success: boolean;
    room: {
        id: string;
        roomNumber: string;
        roomType: string;
        hotel: {
            id: string;
            name: string;
            contactEmail: string;
            contactPhone: string;
        };
    };
    booking?: {
        id: string;
        bookingReference: string;
        guestName: string;
    } | null;
}

export interface RoomFilters {
    status?: string;
    type?: string;
    available?: boolean;
}

export interface RoomsResponse {
    success: boolean;
    rooms: Room[];
}

export const roomService = {
    // Get all rooms with optional filters
    getRooms: (filters?: RoomFilters): Promise<RoomsResponse> =>
        api.get("/rooms", { params: filters }),

    // Get single room by ID
    getRoom: (id: string) => api.get(`/rooms/${id}`),

    // Create new room
    createRoom: (data: CreateRoomData) => api.post("/rooms", data),

    // Update room
    updateRoom: (id: string, data: UpdateRoomData) =>
        api.put(`/rooms/${id}`, data),

    // Delete room
    deleteRoom: (id: string) => api.delete(`/rooms/${id}`),

    // Generate QR code for room
    generateQRCode: (id: string) => api.get(`/rooms/${id}/qr-code`),

    // Get room access (for guests)
    getRoomAccess: (params: {
        hotelId: string;
        roomNumber: string;
        accessCode: string;
    }): Promise<RoomAccessResponse> => api.get("/guest/room-access", { params })
};
