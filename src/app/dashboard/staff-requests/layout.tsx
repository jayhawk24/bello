import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata.dashboardStaffRequests;

export default function StaffRequestsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
