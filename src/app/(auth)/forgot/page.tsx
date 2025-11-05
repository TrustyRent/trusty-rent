"use client";

import { useState } from "react";

export default function ForgotPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setMsg(null); setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/forgot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.detail ?? `Errore ${res.status}`);
      }
      setMsg("Email inviata. Controlla la casella e segui il link per impostare la nuova password.");
    } catch (e: any) {
      setErr(e?.message ?? "Impossibile inviare l'email di reset");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-[#0b0b0f] to-[#111] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#0f1020]/70 border border-white/10 rounded-2xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-semibold mb-2">Password dimenticata</h1>
        <p className="text-sm text-white/60 mb-6">
          Inserisci la tua email: ti invieremo un link di reimpostazione.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-white/80 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-violet-400 focus:bg-white/10"
              placeholder="nome@email.com"
            />
          </div>

          {err && <div className="rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-sm px-3 py-2">{err}</div>}
          {msg && <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-sm px-3 py-2">{msg}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-60 px-4 py-2.5 font-semibold"
          >
            {loading ? "Invio..." : "Invia link di reset"}
          </button>
        </form>
      </div>
    </div>
  );
}
