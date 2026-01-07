import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata.superAdmin;

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
