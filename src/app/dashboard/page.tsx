"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

type Me = {
  id: string;
  email: string;
  email_confirmed_at?: string | null;
  user_metadata?: { first_name?: string; last_name?: string; username?: string };
};

function StatusBadge({ emailOk }: { emailOk: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
        emailOk
          ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
          : "bg-yellow-500/15 text-yellow-300 border border-yellow-500/30"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          emailOk ? "bg-emerald-400" : "bg-yellow-400"
        }`}
      />
      {emailOk ? "Profilo attivo" : "Email da confermare"}
    </span>
  );
}

function SummaryCard({
  title,
  value,
  hint,
}: {
  title: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="text-sm text-white/60">{title}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      {hint && <div className="mt-2 text-xs text-white/50">{hint}</div>}
    </div>
  );
}

function QuickButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-4 py-2 text-sm transition"
    >
      {label}
    </a>
  );
}

export default function Dashboard() {
  const { logout } = useAuth();
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        const r = await api.get("/auth/me");
        setMe(r.data);
      } catch (e: any) {
        setErr(e?.response?.data?.detail ?? e?.message ?? "Errore /auth/me");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const fullName =
    me?.user_metadata?.first_name || me?.user_metadata?.last_name
      ? `${me?.user_metadata?.first_name ?? ""} ${
          me?.user_metadata?.last_name ?? ""
        }`.trim()
      : me?.user_metadata?.username || me?.email || "Utente";

  const emailOk = Boolean(me?.email_confirmed_at);

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-[#0b0b0f] to-[#111] text-white px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold">
              Ciao, {fullName} 👋
            </h1>
            <p className="text-sm text-white/60">
              Benvenuto nella tua area personale.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge emailOk={emailOk} />
            <button
              onClick={logout}
              className="rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-4 py-2 text-sm"
            >
              Esci
            </button>
          </div>
        </div>

        {/* Stato caricamento/errore */}
        {loading && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            Caricamento…
          </div>
        )}
        {err && !loading && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-300">
            {err}
          </div>
        )}

        {/* KPI cards */}
        {!loading && !err && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SummaryCard
                title="Annunci attivi"
                value={0}
                hint="Presto qui i tuoi annunci"
              />
              <SummaryCard
                title="Contratti"
                value={0}
                hint="Totale contratti in corso"
              />
              <SummaryCard
                title="Recensioni"
                value={0}
                hint="Media & ultime recensioni"
              />
              <SummaryCard
                title="Saldo"
                value="—"
                hint="Canoni da ricevere/pagare"
              />
            </div>

            {/* Azioni rapide */}
            <div className="flex flex-wrap gap-3 justify-start mt-6">
              <QuickButton href="/annunci/nuovo" label="➕ Nuovo annuncio" />
              <QuickButton href="/contratti/nuovo" label="🧾 Crea contratto" />
              <QuickButton href="/recensioni" label="⭐ Lascia recensione" />
              <QuickButton href="/pagamenti" label="💰 Registra pagamento" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
