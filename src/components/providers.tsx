"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { NotificationProvider } from "./NotificationProvider";
import { ReactQueryProvider } from "./providers/ReactQueryProvider";

interface ProvidersProps {
    children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    return (
        <SessionProvider>
            <ReactQueryProvider>
                <NotificationProvider>
                    {children}
                </NotificationProvider>
            </ReactQueryProvider>
        </SessionProvider>
    );
}
