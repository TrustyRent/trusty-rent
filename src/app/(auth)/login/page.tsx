"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      router.push("/dashboard");
    } catch (e: any) {
      setErr(e?.message ?? "Login fallita");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-[#0b0b0f] to-[#111] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-[#0f1020]/70 border border-white/10 rounded-2xl shadow-2xl backdrop-blur p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-semibold">Accedi</h1>
            <p className="text-sm text-white/60 mt-1">
              Entra nel tuo account Affitti per gestire annunci e profilo.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-white/80 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@email.com"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none ring-0 focus:border-violet-400 focus:bg-white/10 transition"
              />
            </div>

            <div>
              <label className="block text-sm text-white/80 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 pr-12 outline-none focus:border-violet-400 focus:bg-white/10 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute inset-y-0 right-2 my-auto text-xs text-white/70 hover:text-white px-2 rounded-md"
                  aria-label={showPw ? "Nascondi password" : "Mostra password"}
                >
                  {showPw ? "Nascondi" : "Mostra"}
                </button>
              </div>
            </div>

            {err && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-sm px-3 py-2">
                {err}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-60 disabled:cursor-not-allowed transition px-4 py-2.5 font-semibold"
            >
              {loading ? "Accesso..." : "Entra"}
            </button>
          </form>

          <div className="mt-5 flex items-center justify-between text-sm">
            <Link href="/register" className="text-violet-300 hover:text-violet-200">
              Registrati
            </Link>
            <Link href="/forgot" className="text-white/60 hover:text-white/80">
              Password dimenticata?
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-white/40 mt-4">
          © {new Date().getFullYear()} Affitti — tutti i diritti riservati.
        </p>
      </div>
    </div>
  );
}
