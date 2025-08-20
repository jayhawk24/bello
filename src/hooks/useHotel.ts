import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    hotelService,
    type HotelService,
    type CreateHotelServiceData,
    type UpdateHotelServiceData,
    type HotelProfile,
    type UpdateHotelProfileData
} from "@/services";

// Query Keys
export const hotelKeys = {
    all: ["hotel"] as const,
    profile: () => [...hotelKeys.all, "profile"] as const,
    services: () => [...hotelKeys.all, "services"] as const,
    servicesList: () => [...hotelKeys.services(), "list"] as const,
    service: (id: string) => [...hotelKeys.services(), id] as const,
    guestServices: (params: { roomId: string; hotelId: string }) =>
        [...hotelKeys.services(), "guest", params] as const
};

// Hotel Profile hooks
export function useHotelProfile() {
    return useQuery({
        queryKey: hotelKeys.profile(),
        queryFn: () => hotelService.profile.getProfile()
    });
}

export function useUpdateHotelProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateHotelProfileData) =>
            hotelService.profile.updateProfile(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: hotelKeys.profile() });
        }
    });
}

// Hotel Services hooks
export function useHotelServices() {
    return useQuery({
        queryKey: hotelKeys.servicesList(),
        queryFn: () => hotelService.services.getServices()
    });
}

export function useHotelService(id: string) {
    return useQuery({
        queryKey: hotelKeys.service(id),
        queryFn: () => hotelService.services.getService(id),
        enabled: !!id
    });
}

export function useCreateHotelService() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateHotelServiceData) =>
            hotelService.services.createService(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: hotelKeys.servicesList()
            });
        }
    });
}

export function useUpdateHotelService() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            data
        }: {
            id: string;
            data: UpdateHotelServiceData;
        }) => hotelService.services.updateService(id, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: hotelKeys.service(variables.id)
            });
            queryClient.invalidateQueries({
                queryKey: hotelKeys.servicesList()
            });
        }
    });
}

export function useDeleteHotelService() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => hotelService.services.deleteService(id),
        onSuccess: (data, id) => {
            queryClient.removeQueries({ queryKey: hotelKeys.service(id) });
            queryClient.invalidateQueries({
                queryKey: hotelKeys.servicesList()
            });
        }
    });
}

// Guest services hook
export function useGuestServices(params: { roomId: string; hotelId: string }) {
    return useQuery({
        queryKey: hotelKeys.guestServices(params),
        queryFn: () => hotelService.guest.getAvailableServices(params),
        enabled: !!(params.roomId && params.hotelId)
    });
}
