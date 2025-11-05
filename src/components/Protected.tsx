"use client";

import React from "react";
import RequireAuth from "./auth/RequireAuth";

export default function Protected({ children }: { children: React.ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}
