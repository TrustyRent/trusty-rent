"use client";

import React, { useEffect, useMemo, useState } from "react";
import api, { setAccessToken } from "@/lib/api";

type Locatario = {
  id: string;
  nome: string;
  cognome?: string | null;
  email?: string | null;
  telefono?: string | null;
  note?: string | null;
};
type Review = { id: string; rating: number; commento?: string | null; created_at: string };

export default function LocatariPage() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Locatario[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [form, setForm] = useState({ nome: "", cognome: "", email: "", telefono: "", note: "" });
  const canSave = useMemo(() => form.nome.trim().length > 0, [form.nome]);

  const [openId, setOpenId] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newRev, setNewRev] = useState({ rating: 5, commento: "" });

  async function bootstrap() {
    try {
      const r = await api.post("/auth/refresh");
      const t = r.data?.access_token ?? null;
      setAccessToken(t);
    } catch (e: any) {
      console.warn("bootstrap refresh failed", e?.response?.status);
    }
  }

  async function fetchList() {
    setLoading(true);
    setErr(null);
    try {
      const r = await api.get("/locatari", { params: q ? { q } : undefined });
      setItems(r.data ?? []);
    } catch (e: any) {
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        e?.message ||
        "Errore caricamento";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      await bootstrap();
      await fetchList();
    })();
  }, []);

  // --- FIX: invio robusto + messaggi chiari ---
  async function addLocatario(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) return;

    const payload = {
      nome: form.nome.trim(),
      cognome: form.cognome.trim() || undefined,
      email: form.email.trim() || undefined,
      telefono: form.telefono.trim() || undefined,
      note: form.note.trim() || undefined,
    };

    try {
      await api.post("/locatari", payload, {
        headers: { "Content-Type": "application/json" },
      });
      setForm({ nome: "", cognome: "", email: "", telefono: "", note: "" });
      await fetchList();
    } catch (e: any) {
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        e?.message ||
        "Errore salvataggio locatario";
      setErr(msg);
    }
  }

  async function removeLocatario(id: string) {
    if (!confirm("Eliminare il locatario?")) return;
    try {
      await api.delete(`/locatari/${id}`);
      if (openId === id) setOpenId(null);
      await fetchList();
    } catch (e: any) {
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        e?.message ||
        "Errore eliminazione";
      setErr(msg);
    }
  }

  async function openReviews(id: string) {
    setOpenId(id);
    try {
      const r = await api.get(`/locatari/${id}/recensioni`);
      setReviews(r.data ?? []);
    } catch (e: any) {
      const msg =
        e?.response?.data?.detail || e?.response?.data?.message || e?.message || "Errore recensioni";
      setErr(msg);
    }
  }

  async function addReview() {
    if (!openId) return;
    try {
      await api.post(`/locatari/${openId}/recensioni`, newRev, {
        headers: { "Content-Type": "application/json" },
      });
      setNewRev({ rating: 5, commento: "" });
      const r = await api.get(`/locatari/${openId}/recensioni`);
      setReviews(r.data ?? []);
    } catch (e: any) {
      const msg =
        e?.response?.data?.detail || e?.response?.data?.message || e?.message || "Errore recensione";
      setErr(msg);
    }
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-[#0b0b0f] to-[#111] text-white px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-semibold">Locatari</h1>
          <div className="flex gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cerca nome, cognome, email, telefono"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 w-72"
            />
            <button onClick={fetchList} className="rounded-xl bg-violet-600 hover:bg-violet-500 px-3 py-2">
              Cerca
            </button>
          </div>
        </div>

        <form
          onSubmit={addLocatario}
          className="rounded-2xl border border-white/10 bg-white/5 p-4 grid sm:grid-cols-6 gap-3"
        >
          <input
            className="sm:col-span-2 rounded-lg border border-white/10 bg-white/10 px-3 py-2"
            placeholder="Nome *"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
          />
          <input
            className="sm:col-span-2 rounded-lg border border-white/10 bg-white/10 px-3 py-2"
            placeholder="Cognome"
            value={form.cognome}
            onChange={(e) => setForm({ ...form, cognome: e.target.value })}
          />
          <input
            className="sm:col-span-2 rounded-lg border border-white/10 bg-white/10 px-3 py-2"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="sm:col-span-2 rounded-lg border border-white/10 bg-white/10 px-3 py-2"
            placeholder="Telefono"
            value={form.telefono}
            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
          />
          <input
            className="sm:col-span-3 rounded-lg border border-white/10 bg-white/10 px-3 py-2"
            placeholder="Note"
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
          />
          <button
            disabled={!canSave}
            className="sm:col-span-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 px-3 py-2"
          >
            Aggiungi
          </button>
        </form>

        <div className="rounded-2xl border border-white/10 bg-white/5 overflow-x-auto">
          {loading ? (
            <div className="p-6">Caricamento…</div>
          ) : err ? (
            <div className="p-6 text-red-300">{err}</div>
          ) : items.length === 0 ? (
            <div className="p-6 opacity-70">Nessun locatario.</div>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="bg-white/10">
                <tr>
                  <th className="text-left px-3 py-2">Nome</th>
                  <th className="text-left px-3 py-2">Cognome</th>
                  <th className="text-left px-3 py-2">Email</th>
                  <th className="text-left px-3 py-2">Telefono</th>
                  <th className="text-left px-3 py-2">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="border-t border-white/10">
                    <td className="px-3 py-2">{it.nome}</td>
                    <td className="px-3 py-2">{it.cognome || "—"}</td>
                    <td className="px-3 py-2">{it.email || "—"}</td>
                    <td className="px-3 py-2">{it.telefono || "—"}</td>
                    <td className="px-3 py-2 space-x-2">
                      <button
                        onClick={() => openReviews(it.id)}
                        className="rounded bg-slate-700 px-2 py-1 hover:bg-slate-600"
                      >
                        Recensioni
                      </button>
                      <button
                        onClick={() => removeLocatario(it.id)}
                        className="rounded bg-rose-700 px-2 py-1 hover:bg-rose-600"
                      >
                        Elimina
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {openId && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
            <h2 className="text-lg font-semibold">Recensioni</h2>
            <div className="flex gap-2 items-center">
              <select
                value={newRev.rating}
                onChange={(e) => setNewRev({ ...newRev, rating: Number(e.target.value) })}
                className="rounded-lg border border-white/10 bg-white/10 px-3 py-2"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} ⭐
                  </option>
                ))}
              </select>
              <input
                value={newRev.commento}
                onChange={(e) => setNewRev({ ...newRev, commento: e.target.value })}
                placeholder="Scrivi un commento…"
                className="flex-1 rounded-lg border border-white/10 bg-white/10 px-3 py-2"
              />
              <button onClick={addReview} className="rounded-lg bg-violet-600 hover:bg-violet-500 px-3 py-2">
                Aggiungi
              </button>
              <button
                onClick={() => setOpenId(null)}
                className="rounded-lg bg-neutral-700 hover:bg-neutral-600 px-3 py-2"
              >
                Chiudi
              </button>
            </div>
            <ul className="space-y-2">
              {reviews.length === 0 ? (
                <li className="opacity-70">Nessuna recensione.</li>
              ) : (
                reviews.map((r) => (
                  <li key={r.id} className="rounded-lg border border-white/10 bg-white/10 px-3 py-2">
                    <div className="text-sm">{r.rating} ⭐</div>
                    <div className="text-xs opacity-80">{new Date(r.created_at).toLocaleString()}</div>
                    {r.commento && <div className="mt-1 text-sm">{r.commento}</div>}
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
