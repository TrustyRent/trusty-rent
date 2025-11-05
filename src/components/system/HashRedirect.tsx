// src/components/HashRedirect.tsx
"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function HashRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash || "";
    const hasToken = hash.includes("access_token=");
    const hasError = hash.includes("error=");

    if (hasToken && !hasError && pathname !== "/reset") {
      router.replace(`/reset${hash}`);
    }
  }, [pathname, router]);

  return null;
}
