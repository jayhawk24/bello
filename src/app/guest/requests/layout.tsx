import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata.guestRequests;

export default function GuestRequestsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
