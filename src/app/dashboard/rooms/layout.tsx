import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata.dashboardRooms;

export default function RoomsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
