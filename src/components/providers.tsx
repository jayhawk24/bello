"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { NotificationProvider } from "./NotificationProvider";
import { Toaster } from 'react-hot-toast';

interface ProvidersProps {
    children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    return (
        <SessionProvider>
            <NotificationProvider>
                {children}
                <Toaster
                    position="bottom-right"
                />
            </NotificationProvider>
        </SessionProvider>
    );
}
