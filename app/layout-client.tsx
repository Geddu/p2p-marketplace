"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Providers from "./providers";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/auth";

  return (
    <Providers>
      <AuthGuard>
        <div className="flex min-h-screen flex-col">
          {!isAuthPage && <Navbar />}
          <main className="flex-1">{children}</main>
        </div>
      </AuthGuard>
    </Providers>
  );
}
