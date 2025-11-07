// src/middleware.ts
import type { NextRequest } from "next/server";

// Nessun rewrite/proxy verso 127.0.0.1:8000.
// Lasciamo passare tutto: le chiamate vanno direttamente
// all'API di base configurata in src/lib/api.ts.
export function middleware(_req: NextRequest) {
  return;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
