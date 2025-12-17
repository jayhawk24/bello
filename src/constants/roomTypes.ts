export const ROOM_TYPE_OPTIONS = [
    "Standard Single",
    "Standard Double",
    "Deluxe Single",
    "Deluxe Double",
    "Junior Suite",
    "Executive Suite",
    "Presidential Suite",
    "Family Room",
    "Connecting Rooms",
    "Accessible Room"
] as const;

export type RoomTypeOption = (typeof ROOM_TYPE_OPTIONS)[number];
