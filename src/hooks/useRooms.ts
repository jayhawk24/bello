import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    roomService,
    type RoomFilters,
    type RoomAccessResponse,
    type RoomsResponse
} from "@/services";

// Query Keys
export const roomKeys = {
    all: ["rooms"] as const,
    lists: () => [...roomKeys.all, "list"] as const,
    list: (filters: RoomFilters = {}) =>
        [...roomKeys.lists(), filters] as const
};

// Get all rooms
export function useRooms(filters?: RoomFilters) {
    return useQuery<RoomsResponse>({
        queryKey: roomKeys.list(filters),
        queryFn: () => roomService.getRooms(filters)
    });
}

// Room access for guests
export function useRoomAccess(params: {
    hotelId: string;
    roomNumber: string;
    accessCode: string;
}) {
    return useQuery<RoomAccessResponse>({
        queryKey: ["room-access", params],
        queryFn: () => roomService.getRoomAccess(params),
        enabled: !!(params.hotelId && params.roomNumber && params.accessCode)
    });
}
