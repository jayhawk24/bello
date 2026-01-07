import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata.guestServices;

export default function GuestServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
