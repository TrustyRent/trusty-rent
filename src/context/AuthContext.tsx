"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import api, { setAccessToken } from "@/lib/api";

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
      const t = r.data?.access_token ?? r.data?.accessToken ?? null;
      setAccessToken(t);

      // carica profilo se esiste l'endpoint
      try {
        const me = await api.get("/auth/me");
        setUser(me.data ?? null);
      } catch {
        // se /auth/me non esiste, considera utente loggato ma senza dettagli
        setUser((prev) => prev ?? { id: "me" });
      }
    } catch {
      setAccessToken(null);
      setUser(null);
      // non rilancio errori: lo stato scende a loading=false e la UI decide
    }
  }

  async function login(email: string, password: string) {
    const r = await api.post("/auth/login", { email, password });
    const t = r.data?.access_token ?? r.data?.accessToken ?? null;
    setAccessToken(t);
    try {
      const me = await api.get("/auth/me");
      setUser(me.data ?? null);
    } catch {
      setUser({ id: "me", email });
    }
  }

  async function logout() {
    try {
      await api.post("/auth/logout").catch(() => {});
    } finally {
      setAccessToken(null);
      setUser(null);
      if (typeof window !== "undefined") window.location.href = "/login";
    }
  }

  useEffect(() => {
    (async () => {
      await refresh();
      setLoading(false); // SEMPRE scendi dal loading, anche se refresh fallisce
    })();
  }, []);

  return (
    <AuthCtx.Provider value={{ user, loading, login, logout, refresh }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
