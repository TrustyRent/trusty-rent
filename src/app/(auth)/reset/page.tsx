"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  // Legge il token dall'hash (#access_token=...)
  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const params = new URLSearchParams(hash.startsWith("#") ? hash.substring(1) : hash);
    const t = params.get("access_token");
    setToken(t);
    if (!t) setErr("Link non valido o scaduto. Richiedi un nuovo reset.");
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setErr(null); setOk(null); setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ new_password: pw }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.detail ?? `Errore ${res.status}`);
      }
      setOk("Password aggiornata con successo. Torno alla login…");
      setTimeout(() => router.replace("/login?reset=1"), 1000);
    } catch (e: any) {
      setErr(e?.message ?? "Impossibile aggiornare la password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-[#0b0b0f] to-[#111] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#0f1020]/70 border border-white/10 rounded-2xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-semibold mb-2">Imposta nuova password</h1>
        <p className="text-sm text-white/60 mb-6">Minimo 8 caratteri.</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-white/80 mb-1">Nuova password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                minLength={8}
                required
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 pr-12 outline-none focus:border-violet-400 focus:bg-white/10"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute inset-y-0 right-2 my-auto text-xs text-white/70 hover:text-white px-2 rounded-md"
              >
                {showPw ? "Nascondi" : "Mostra"}
              </button>
            </div>
          </div>

          {err && <div className="rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-sm px-3 py-2">{err}</div>}
          {ok  && <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-sm px-3 py-2">{ok}</div>}

          <button
            type="submit"
            disabled={!token || loading}
            className="w-full rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-60 px-4 py-2.5 font-semibold"
          >
            {loading ? "Aggiorno…" : "Aggiorna password"}
          </button>
        </form>
      </div>
    </div>
  );
}
