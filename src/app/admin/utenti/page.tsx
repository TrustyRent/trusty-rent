"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

type Utente = {
  id: string;
  email: string | null;
  nome: string | null;
  username: string | null;
  tipo: "privato" | "azienda" | null;
  codice_fiscale?: string | null;
  partita_iva?: string | null;
  ragione_sociale?: string | null;
  created_at?: string | null;
  stato?: "pending" | "approved" | "rejected" | null;
};

export default function AdminUtentiPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [rows, setRows] = useState<Utente[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // redirect se non loggato; il controllo "admin" lo fa comunque il backend
  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  async function load() {
    setError(null);
    try {
      const r = await api.get<Utente[]>("/utenti/admin/pending");
      setRows(r.data || []);
      setInfo(r.data?.length ? null : "Nessun utente in attesa.");
    } catch (e: any) {
      const msg =
        e?.response?.data?.detail ||
        e?.message ||
        "Errore nel caricamento degli utenti.";
      setError(msg);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function approve(id: string) {
    setBusy(id);
    setError(null);
    setInfo(null);
    try {
      await api.patch(`/utenti/admin/${id}`, { azione: "approve" });
      setRows((prev) => prev.filter((r) => r.id !== id));
      setInfo("Utente approvato con successo.");
    } catch (e: any) {
      const msg =
        e?.response?.data?.detail ||
        e?.message ||
        "Errore durante l'approvazione.";
      setError(msg);
    } finally {
      setBusy(null);
    }
  }

  async function reject(id: string) {
    const motivo =
      window.prompt("Motivo del rifiuto (obbligatorio):")?.trim() || "";
    if (!motivo) return;
    setBusy(id);
    setError(null);
    setInfo(null);
    try {
      await api.patch(`/utenti/admin/${id}`, {
        azione: "reject",
        motivo_rifiuto: motivo,
      });
      setRows((prev) => prev.filter((r) => r.id !== id));
      setInfo("Utente rifiutato.");
    } catch (e: any) {
      const msg =
        e?.response?.data?.detail ||
        e?.message ||
        "Errore durante il rifiuto.";
      setError(msg);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="min-h-[calc(100vh-120px)] w-full px-4 py-6 flex justify-center">
      <div className="w-full max-w-5xl">
        <h1 className="text-2xl font-semibold mb-1">Utenti in attesa</h1>
        <p className="text-sm text-zinc-400 mb-6">
          Approva o rifiuta le richieste di registrazione.
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-200 text-sm p-3">
            {error}
          </div>
        )}
        {info && (
          <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 text-sm p-3">
            {info}
          </div>
        )}

        <div className="overflow-x-auto rounded-xl border border-zinc-800">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-900/60">
              <tr className="text-zinc-300">
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Nome</th>
                <th className="px-4 py-3 text-left">Username</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Dettagli</th>
                <th className="px-4 py-3 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-zinc-800">
                  <td className="px-4 py-3">{r.email || "-"}</td>
                  <td className="px-4 py-3">{r.nome || "-"}</td>
                  <td className="px-4 py-3">{r.username || "-"}</td>
                  <td className="px-4 py-3 capitalize">{r.tipo || "-"}</td>
                  <td className="px-4 py-3 text-zinc-400">
                    {r.tipo === "privato" ? (
                      <>CF: {r.codice_fiscale || "-"}</>
                    ) : (
                      <>
                        P.IVA: {r.partita_iva || "-"}
                        {r.ragione_sociale ? ` • ${r.ragione_sociale}` : ""}
                      </>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => approve(r.id)}
                        disabled={busy === r.id}
                        className="rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 disabled:opacity-50"
                        title="Approva"
                      >
                        {busy === r.id ? "..." : "Approva"}
                      </button>
                      <button
                        onClick={() => reject(r.id)}
                        disabled={busy === r.id}
                        className="rounded-lg bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 disabled:opacity-50"
                        title="Rifiuta"
                      >
                        {busy === r.id ? "..." : "Rifiuta"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-zinc-400"
                  >
                    Nessun utente in attesa.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={load}
            className="rounded-lg border border-zinc-700 hover:bg-zinc-800 px-3 py-2 text-sm"
          >
            Aggiorna
          </button>
          <span className="text-xs text-zinc-500">
            Le azioni inviano automaticamente le email all’utente.
          </span>
        </div>
      </div>
    </div>
  );
}
