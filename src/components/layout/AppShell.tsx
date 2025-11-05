"use client";

import React from "react";

/**
 * AppShell minimale.
 * Non aggiunge nessun wrapper o provider.
 * Serve solo per mantenere compatibilità con i vecchi import.
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
