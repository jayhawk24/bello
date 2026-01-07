import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata.login;

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
