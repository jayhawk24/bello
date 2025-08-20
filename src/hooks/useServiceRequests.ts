import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    serviceRequestService,
    type ServiceRequest,
    type UpdateServiceRequestData,
    type ServiceRequestFilters,
    type ServiceRequestsResponse
} from "@/services";

// Query Keys
export const serviceRequestKeys = {
    all: ["service-requests"] as const,
    staff: () => [...serviceRequestKeys.all, "staff"] as const,
    staffList: (filters: ServiceRequestFilters = {}) =>
        [...serviceRequestKeys.staff(), "list", filters] as const
};

// Staff hooks
export function useStaffServiceRequests(filters?: ServiceRequestFilters) {
    return useQuery<ServiceRequestsResponse>({
        queryKey: serviceRequestKeys.staffList(filters),
        queryFn: () => serviceRequestService.staff.getServiceRequests(filters)
    });
}

export function useUpdateServiceRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateServiceRequestData & { requestId: string }) =>
            serviceRequestService.staff.updateServiceRequest(data),
        onMutate: async (newData) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({
                queryKey: serviceRequestKeys.staff()
            });

            // Snapshot the previous value
            const previousRequests = queryClient.getQueriesData({
                queryKey: serviceRequestKeys.staff()
            });

            // Optimistically update the cache
            queryClient.setQueriesData(
                { queryKey: serviceRequestKeys.staff() },
                (old: any) => {
                    if (!old) return old;

                    return old.map((request: ServiceRequest) =>
                        request.id === newData.requestId
                            ? {
                                  ...request,
                                  ...newData,
                                  updatedAt: new Date().toISOString()
                              }
                            : request
                    );
                }
            );

            return { previousRequests };
        },
        onError: (err, newData, context) => {
            // Rollback on error
            if (context?.previousRequests) {
                context.previousRequests.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
        },
        onSettled: () => {
            // Always refetch after error or success
            queryClient.invalidateQueries({
                queryKey: serviceRequestKeys.staff()
            });
        }
    });
}

export function useDeleteServiceRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (requestId: string) =>
            serviceRequestService.staff.deleteServiceRequest(requestId),
        onMutate: async (requestId) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({
                queryKey: serviceRequestKeys.staff()
            });

            // Snapshot the previous value
            const previousRequests = queryClient.getQueriesData({
                queryKey: serviceRequestKeys.staff()
            });

            // Optimistically remove from cache
            queryClient.setQueriesData(
                { queryKey: serviceRequestKeys.staff() },
                (old: any) => {
                    if (!old) return old;
                    return old.filter(
                        (request: ServiceRequest) => request.id !== requestId
                    );
                }
            );

            return { previousRequests };
        },
        onError: (err, requestId, context) => {
            // Rollback on error
            if (context?.previousRequests) {
                context.previousRequests.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
        },
        onSettled: () => {
            // Always refetch after error or success
            queryClient.invalidateQueries({
                queryKey: serviceRequestKeys.staff()
            });
        }
    });
}
