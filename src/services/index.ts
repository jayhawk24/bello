// Export all services from a central location
export * from "./api";
export * from "./auth";
export * from "./rooms";
export * from "./serviceRequests";
export * from "./hotel";
export * from "./staff";
export * from "./notifications";

// Re-export commonly used services
export { authService } from "./auth";
export { roomService } from "./rooms";
export { serviceRequestService } from "./serviceRequests";
export { hotelService } from "./hotel";
export { staffService } from "./staff";
export { notificationService } from "./notifications";
