"use client";

import React from "react";

/**
 * ClientLayout minimale.
 * Non gestisce nulla, semplicemente restituisce i children.
 * Utile per non rompere i vecchi export nel barrel.
 */
export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
