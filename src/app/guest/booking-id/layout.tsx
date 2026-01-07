import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata.guestBookingId;

export default function GuestBookingIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
