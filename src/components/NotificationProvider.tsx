"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import NotificationService from '@/lib/notificationService';

interface NotificationContextType {
    isInitialized: boolean;
    hasPermission: boolean;
    requestPermission: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

interface NotificationProviderProps {
    children: React.ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
    const { data: session } = useSession();
    const [isInitialized, setIsInitialized] = useState(false);
    const [hasPermission, setHasPermission] = useState(false);

    const requestPermission = async (): Promise<boolean> => {
        try {
            const notificationService = NotificationService.getInstance();
            const permission = await notificationService.requestPermission();
            const granted = permission === 'granted';
            setHasPermission(granted);
            return granted;
        } catch (error) {
            console.error('Failed to request notification permission:', error);
            return false;
        }
    };

    const initializeNotifications = async () => {
        if (!session?.user || !['hotel_staff', 'hotel_admin'].includes(session.user.role)) {
            return;
        }

        try {
            const notificationService = NotificationService.getInstance();
            const initialized = await notificationService.initialize();
            
            setIsInitialized(initialized);
            setHasPermission(initialized);

            if (initialized) {
                // Start polling for notifications
                notificationService.startPolling(30000); // Poll every 30 seconds
            }
        } catch (error) {
            console.error('Failed to initialize notifications:', error);
        }
    };

    useEffect(() => {
        initializeNotifications();
    }, [session]);

    const value: NotificationContextType = {
        isInitialized,
        hasPermission,
        requestPermission
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};
