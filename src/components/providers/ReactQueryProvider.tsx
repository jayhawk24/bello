'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                // Stale time: 5 minutes
                staleTime: 5 * 60 * 1000,
                // Cache time: 10 minutes
                gcTime: 10 * 60 * 1000,
                // Don't refetch on window focus by default
                refetchOnWindowFocus: false,
                // Retry configuration
                retry: (failureCount, error: any) => {
                    // Don't retry on 4xx errors (client errors)
                    if (error?.response?.status >= 400 && error?.response?.status < 500) {
                        return false;
                    }
                    // Retry up to 3 times for other errors
                    return failureCount < 3;
                },
                // Retry delay with exponential backoff
                retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            },
            mutations: {
                // Retry mutations once on network errors
                retry: (failureCount, error: any) => {
                    if (error?.code === 'NETWORK_ERROR' && failureCount < 1) {
                        return true;
                    }
                    return false;
                },
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <ReactQueryDevtools
                initialIsOpen={false}
            />
        </QueryClientProvider>
    );
}
