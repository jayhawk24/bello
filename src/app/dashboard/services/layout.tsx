import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata.dashboardServices;

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
