import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata.guestDashboard;

export default function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
