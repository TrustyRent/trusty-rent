"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Navbar, Footer } from "@/components";

export default function ChromeFrame({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const hideChrome =
    path?.startsWith("/login") ||
    path?.startsWith("/register") ||
    path?.startsWith("/forgot");

  return (
    <div className="min-h-[100dvh] bg-[#0b0b0f] text-white flex flex-col">
      {!hideChrome && <Navbar />}
      <main className="flex-1">{children}</main>
      {!hideChrome && <Footer />}
    </div>
  );
}
