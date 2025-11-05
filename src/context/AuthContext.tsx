"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import api, { setAccessToken } from "@/lib/api";
import { supabase } from "@/lib/supabase";

type User = { id: string; email?: string } | null;

type AuthContextValue = {
  user: User;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthCtx = createContext<AuthContextValue>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      const r = await api.post("/auth/refresh");
      const t = r.data?.access_token ?? null;
      setAccessToken(t);

      // opzionale: carico /auth/me se disponibile
      try {
        const me = await api.get("/auth/me");
        setUser(me.data ?? null);
      } catch {
        // se /auth/me non esiste/serve, ignoro
      }
    } catch {
      setAccessToken(null);
      setUser(null);
      throw new Error("refresh failed");
    }
  }

  async function login(email: string, password: string) {
    const r = await api.post("/auth/login", { email, password });
    const t = r.data?.access_token ?? null;
    setAccessToken(t);
    try {
      const me = await api.get("/auth/me");
      setUser(me.data ?? null);
    } catch {
      setUser({ id: "me", email });
    }
  }

  /**
   * Logout "forte":
   * - prova a fare logout backend (non blocca in caso di errore)
   * - esce da Supabase (scope: local)
   * - rimuove eventuali token "sb-...-auth-token" dallo storage
   * - pulisce token axios
   * - resetta stato utente
   * - redirect alla /login
   */
  async function logout() {
    try {
      // backend (best-effort)
      await api.post("/auth/logout").catch(() => {});

      // supabase: rimuove la sessione locale
      try {
        await supabase.auth.signOut({ scope: "local" });
      } catch {}

      // pulizia storage locale di eventuali token Supabase
      try {
        Object.keys(localStorage).forEach((k) => {
          if (k.startsWith("sb-") && k.endsWith("-auth-token")) {
            localStorage.removeItem(k);
          }
        });
        sessionStorage.clear();
      } catch {}

    } finally {
      // reset client axios + stato
      setAccessToken(null);
      setUser(null);

      // redirect
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  }

  useEffect(() => {
    (async () => {
      try {
        await refresh();
      } catch {}
      setLoading(false);
    })();
  }, []);

  return (
    <AuthCtx.Provider value={{ user, loading, login, logout, refresh }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
