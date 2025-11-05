// src/components/nav/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

/** Logo inline SVG: "TRUSTYRENT" con icona-chiave integrata.
 *  Nessun asset esterno: non rompe il build e funziona subito. */
function TRLogo({ className = "h-7 w-auto" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 220 36"
      role="img"
      aria-label="TrustyRent"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <style>
          {`.t{fill:#0EA5E9}.g{fill:#7BC043}.w{fill:#F3F4F6}`}
        </style>
      </defs>
      {/* Key icon stilizzata (azzurro + verde) */}
      <g transform="translate(0,2)">
        <rect x="2" y="2" width="8" height="22" rx="2" className="t"/>
        <rect x="2" y="2" width="18" height="6" rx="2" className="t"/>
        <circle cx="18" cy="17" r="5" fill="none" stroke="#7BC043" strokeWidth="3"/>
        <rect x="18" y="19" width="10" height="3" rx="1.5" className="g"/>
      </g>
      {/* Wordmark */}
      <text x="38" y="22" className="w" style={{ font: "800 18px Inter, Arial, sans-serif", letterSpacing: "1.2px" }}>
        TRUSTY<tspan fill="#7BC043">RENT</tspan>
      </text>
    </svg>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [elevated, setElevated] = useState(false);

  useEffect(() => {
    const onScroll = () => setElevated(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function handleLogout() {
    try {
      await logout();
      router.replace("/login");
    } catch {}
  }

  const Item = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link
      href={href}
      className={`rounded px-3 py-2 text-sm hover:bg-neutral-800 ${
        pathname === href ? "text-white" : "text-neutral-300"
      }`}
    >
      {children}
    </Link>
  );

  return (
    <header
      className={`sticky top-0 z-40 border-b border-neutral-800 bg-neutral-950/70 backdrop-blur transition-shadow ${
        elevated ? "shadow-2xl" : ""
      }`}
    >
      {/* Top-bar contatti (ispirazione Azure) – nascosta su mobile */}
      <div
        className="hidden md:flex items-center justify-end gap-6 text-xs px-4 lg:px-8"
        style={{ color: "#CBD5E1", borderBottom: "1px solid #1F2937" }}
      >
        <a href="tel:800404011" className="py-2 hover:opacity-80">800&nbsp;40&nbsp;40&nbsp;11</a>
        <a href="mailto:info@trustedrentals.it" className="py-2 hover:opacity-80">info@trustedrentals.it</a>
      </div>

      {/* Barra principale (immutata nelle rotte/condizioni) */}
      <nav className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-3 font-semibold">
          <TRLogo className="h-7 w-auto" />
          <span className="sr-only">TrustyRent</span>
        </Link>

        <div className="flex items-center gap-1">
          <Item href="/locatari">Locatari</Item>
          <Item href="/chi-siamo">Chi siamo</Item>
          <Item href="/contatti">Contatti</Item>

          {!user ? (
            <>
              <Item href="/login">Login</Item>
              <Link
                href="/login"
                className="ml-1 rounded bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-500"
              >
                Registrati
              </Link>
            </>
          ) : (
            <>
              <Item href="/dashboard">Dashboard</Item>
              <button
                onClick={handleLogout}
                className="ml-1 rounded bg-neutral-800 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-700"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
