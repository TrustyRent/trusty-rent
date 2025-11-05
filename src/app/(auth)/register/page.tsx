"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import api, { setAccessToken } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type TipoUtente = "privato" | "azienda";
const CF_RE = /^[A-Z0-9]{16}$/i;

function validaPIVA(piva: string) {
  const v = (piva || "").trim();
  if (!/^\d{11}$/.test(v)) return false;
  let s = 0;
  for (let i = 0; i < 10; i++) {
    const n = v.charCodeAt(i) - 48;
    if (i % 2 === 0) s += n;
    else {
      let n2 = 2 * n;
      if (n2 > 9) n2 -= 9;
      s += n2;
    }
  }
  const controllo = (10 - (s % 10)) % 10;
  return controllo === v.charCodeAt(10) - 48;
}

export default function RegisterPage() {
  const { logout } = useAuth();

  // UI state
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Step 1
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptPrivacy, setAcceptPrivacy] = useState(false); // ✅ nuovo

  // Step 2
  const [tipo, setTipo] = useState<TipoUtente>("privato");
  const [nome, setNome] = useState("");
  const [username, setUsername] = useState("");
  const [codiceFiscale, setCodiceFiscale] = useState("");
  const [partitaIVA, setPartitaIVA] = useState("");
  const [ragioneSociale, setRagioneSociale] = useState("");

  // Se c'è già una sessione: vai a Step 2
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.access_token) {
        setAccessToken(data.session.access_token);
        setStep(2);
      }
    })();
  }, []);

  // In Step 2, email = email della sessione
  useEffect(() => {
    (async () => {
      if (step !== 2) return;
      const { data } = await supabase.auth.getUser();
      const mail = data.user?.email || "";
      if (mail) setEmail(mail);
    })();
  }, [step]);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      if (data.session?.access_token) {
        setAccessToken(data.session.access_token);
        setMsg("Account creato. Completa ora il profilo.");
        setStep(2);
      } else {
        setMsg(
          "Ti abbiamo inviato una mail di conferma. Dopo averla confermata, torna qui per completare il profilo."
        );
      }
    } catch (e: any) {
      setErr(e?.message || "Errore durante la registrazione.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreaProfilo(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);

    if (!username) return setErr("Inserisci uno username.");
    if (!email) return setErr("Email mancante.");

    if (tipo === "privato") {
      if (!CF_RE.test(codiceFiscale.trim()))
        return setErr("Codice fiscale non valido (16 caratteri alfanumerici).");
    } else {
      if (!validaPIVA(partitaIVA)) return setErr("Partita IVA non valida.");
      if (!ragioneSociale.trim()) return setErr("Inserisci la ragione sociale.");
    }

    setLoading(true);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        setErr("Sessione assente: effettua il login e riprova.");
        return;
      }
      setAccessToken(token);

      const url =
        tipo === "privato"
          ? "/utenti/register/privato"
          : "/utenti/register/azienda";

      const payload =
        tipo === "privato"
          ? {
              email,
              nome: nome || null,
              username: username || null,
              codice_fiscale: codiceFiscale.trim().toUpperCase(),
            }
          : {
              email,
              nome: nome || null,
              username: username || null,
              partita_iva: partitaIVA.trim(),
              ragione_sociale: ragioneSociale.trim(),
            };

      await api.post(url, payload);
      setMsg("✅ Richiesta inviata! Attendi l’email di conferma dall’amministratore.");
    } catch (e: any) {
      const code = e?.response?.status;
      const text =
        code === 409
          ? "Profilo già presente per questo account. Esci e riprova con un nuovo account."
          : e?.response?.data?.detail ||
            e?.message ||
            "Errore durante il salvataggio del profilo.";
      setErr(text);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-120px)] w-full flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur p-6 md:p-8 shadow-2xl">
        <h1 className="text-2xl font-semibold mb-1">Registrati</h1>
        <p className="text-sm text-zinc-400 mb-6">
          Crea il tuo account TrustyRent. Dopo la registrazione completerai il profilo.
        </p>

        {msg && (
          <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 text-sm p-3">
            {msg}
          </div>
        )}
        {err && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-200 text-sm p-3">
            {err}
            {err.toLowerCase().includes("profilo già presente") && (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={logout}
                  className="text-xs underline text-violet-300 hover:text-violet-200"
                >
                  Esci e cambia account
                </button>
              </div>
            )}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input
                type="email"
                className="w-full h-11 rounded-xl border border-zinc-700 bg-zinc-800/60 px-3 outline-none focus:ring-2 focus:ring-violet-600"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@esempio.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Password</label>
              <input
                type="password"
                className="w-full h-11 rounded-xl border border-zinc-700 bg-zinc-800/60 px-3 outline-none focus:ring-2 focus:ring-violet-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 caratteri"
                minLength={8}
                required
              />
            </div>

            {/* ✅ Consenso privacy obbligatorio (solo UI) */}
            <label className="flex items-start gap-3 text-sm text-zinc-300">
              <input
                type="checkbox"
                className="mt-[3px] h-4 w-4 rounded border-zinc-600 bg-zinc-800"
                checked={acceptPrivacy}
                onChange={(e) => setAcceptPrivacy(e.target.checked)}
                required
              />
              <span>
                Dichiaro di aver letto e accettato l’{" "}
                <a
                  href="/privacy"
                  className="text-violet-400 hover:text-violet-300 underline"
                  target="_blank"
                >
                  Informativa Privacy
                </a>{" "}
                e i{" "}
                <a
                  href="/termini"
                  className="text-violet-400 hover:text-violet-300 underline"
                  target="_blank"
                >
                  Termini di Servizio
                </a>
                .
              </span>
            </label>

            <button
              type="submit"
              disabled={loading || !acceptPrivacy}
              className="w-full h-11 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition"
            >
              {loading ? "Creazione in corso..." : "Crea account"}
            </button>

            <div className="mt-2 text-xs text-zinc-500">
              Dopo aver creato l’account completerai il profilo.
            </div>
          </form>
        ) : (
          <form onSubmit={handleCreaProfilo} className="space-y-4">
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => setTipo("privato")}
                className={`flex-1 h-9 rounded-lg border text-sm transition ${
                  tipo === "privato"
                    ? "bg-violet-600 text-white border-violet-600"
                    : "bg-zinc-800/60 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                }`}
              >
                Privato
              </button>
              <button
                type="button"
                onClick={() => setTipo("azienda")}
                className={`flex-1 h-9 rounded-lg border text-sm transition ${
                  tipo === "azienda"
                    ? "bg-violet-600 text-white border-violet-600"
                    : "bg-zinc-800/60 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                }`}
              >
                Azienda
              </button>
            </div>

            <div>
              <label className="block text-sm mb-1">Email</label>
              <input
                type="email"
                className="w-full h-11 rounded-xl border border-zinc-700 bg-zinc-800/60 px-3 outline-none focus:ring-2 focus:ring-violet-600"
                value={email}
                readOnly
              />
              <p className="text-xs text-zinc-500 mt-1">
                L’email è presa dalla sessione attuale.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">Nome</label>
                <input
                  className="w-full h-11 rounded-xl border border-zinc-700 bg-zinc-800/60 px-3 outline-none focus:ring-2 focus:ring-violet-600"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Mario"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Username</label>
                <input
                  className="w-full h-11 rounded-xl border border-zinc-700 bg-zinc-800/60 px-3 outline-none focus:ring-2 focus:ring-violet-600"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="mario"
                  required
                />
              </div>
            </div>

            {tipo === "privato" ? (
              <div>
                <label className="block text-sm mb-1">Codice Fiscale</label>
                <input
                  className="w-full h-11 rounded-xl border border-zinc-700 bg-zinc-800/60 px-3 uppercase outline-none focus:ring-2 focus:ring-violet-600"
                  value={codiceFiscale}
                  onChange={(e) => setCodiceFiscale(e.target.value)}
                  placeholder="RSSMRA80A01H501U"
                  maxLength={16}
                  required
                />
                {!CF_RE.test(codiceFiscale.trim()) && codiceFiscale && (
                  <p className="text-xs text-red-400 mt-1">
                    Inserisci un CF valido (16 caratteri alfanumerici).
                  </p>
                )}
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm mb-1">Partita IVA</label>
                  <input
                    className="w-full h-11 rounded-xl border border-zinc-700 bg-zinc-800/60 px-3 outline-none focus:ring-2 focus:ring-violet-600"
                    value={partitaIVA}
                    onChange={(e) => setPartitaIVA(e.target.value)}
                    placeholder="12345678901"
                    maxLength={11}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Ragione Sociale</label>
                  <input
                    className="w-full h-11 rounded-xl border border-zinc-700 bg-zinc-800/60 px-3 outline-none focus:ring-2 focus:ring-violet-600"
                    value={ragioneSociale}
                    onChange={(e) => setRagioneSociale(e.target.value)}
                    placeholder="ACME Srl"
                    required
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium transition"
            >
              {loading ? "Invio in corso..." : "Completa registrazione"}
            </button>

            <p className="text-xs text-zinc-500">
              Dopo l’invio il tuo profilo resterà in <strong>attesa di approvazione</strong> da parte
              dell’amministratore.
            </p>

            <div className="mt-4 text-xs text-zinc-500">
              Non sei tu?{" "}
              <button
                type="button"
                onClick={logout}
                className="text-violet-400 hover:text-violet-300 underline"
              >
                Esci e cambia account
              </button>
            </div>
          </form>
        )}

        <div className="mt-5 text-sm text-zinc-400">
          Hai già un account?{" "}
          <a href="/login" className="text-violet-400 hover:text-violet-300">
            Accedi
          </a>
        </div>
      </div>
    </div>
  );
}
