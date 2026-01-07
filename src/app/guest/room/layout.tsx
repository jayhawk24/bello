import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata.guestRoom;

export default function GuestRoomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
