"use client";

import { useRef, useState } from "react";

export default function ModuloPrivacyLocatari() {
  const docRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  // Scarica direttamente un PDF del SOLO modulo (senza navbar/footer)
  const handleDownloadPdf = async () => {
    if (!docRef.current || downloading) return;
    setDownloading(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      await html2pdf()
        .set({
          margin: 12, // mm
          filename: "modulo-privacy-locatari.pdf",
          image: { type: "jpeg", quality: 0.98 },
          // ⚠️ Niente colori complessi: forziamo sfondo bianco e scala alta
          html2canvas: { scale: 2, backgroundColor: "#ffffff" },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(docRef.current) // cattura solo il modulo
        .save();
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => window.print();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      {/* Stili: versione "PDF-safe" senza oklab/trasparenze */}
      <style>{`
        /* Nascondi navbar/footer e pulsanti durante la stampa */
        @media print {
          header, footer, nav, .print\\:hidden { display: none !important; }
          body { background: #ffffff !important; }
        }
        /* Tema bianco/nero per l'area PDF: colori fissi HEX/RGB (niente oklab) */
        .pdf-safe, .pdf-safe * {
          color: #111111 !important;
          background: #ffffff !important;
          border-color: #222222 !important;
          -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
        }
        .pdf-safe h1, .pdf-safe h2, .pdf-safe h3 { color: #111111 !important; }
        .pdf-safe .muted { color: #333333 !important; }
        .pdf-safe .hr { border-top: 1px solid #222222 !important; }
        .btn { border: 1px solid rgba(255,255,255,.15); background: rgba(255,255,255,.08); }
        .btn:hover { background: rgba(255,255,255,.14); }
      `}</style>

      {/* Barra azioni (nascosta in stampa) */}
      <div className="flex items-center justify-between mb-6 print:hidden text-white">
        <h1 className="text-2xl font-semibold">Modulo Privacy Locatari</h1>
        <div className="flex gap-2">
          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="btn rounded-xl px-4 py-2 text-sm"
          >
            {downloading ? "Preparazione…" : "Scarica PDF"}
          </button>
          <button
            onClick={handlePrint}
            className="btn rounded-xl px-4 py-2 text-sm"
          >
            Stampa
          </button>
        </div>
      </div>

      {/* --- SOLO QUESTA SEZIONE VA NEL PDF --- */}
      <section ref={docRef} className="pdf-safe" style={{
        padding: "24px",
        borderRadius: "0px",           // niente bordi arrotondati nel PDF
        border: "1px solid #222222",
      }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Informativa Privacy per Locatari</h2>
        <p className="muted" style={{ marginBottom: 16 }}>
          (Artt. 13–14 Reg. UE 2016/679) – Testo generico, personalizzabile con il tuo consulente.
        </p>

        <div style={{ display: "grid", rowGap: 8 }}>
          <p><strong>Titolare del trattamento:</strong> TrustyRent – [Ragione sociale / indirizzo / email privacy / PEC].</p>
          <p><strong>Finalità:</strong> gestione rapporti di locazione/noleggio, adempimenti legali, amministrazione pagamenti, prevenzione frodi, esercizio/ difesa di diritti.</p>
          <p><strong>Basi giuridiche:</strong> esecuzione di contratto; obblighi di legge; legittimo interesse; consenso (ove richiesto).</p>
          <p><strong>Dati trattati:</strong> anagrafici e di contatto; fiscali; contrattuali; pagamenti; comunicazioni.</p>
          <p><strong>Conservazione:</strong> per la durata del rapporto e successivamente nei termini di legge.</p>
          <p><strong>Destinatari:</strong> fornitori/consulenti; istituti bancari; autorità competenti; soggetti autorizzati.</p>
          <p><strong>Trasferimenti extra-UE:</strong> ove presenti, nel rispetto del Capo V GDPR (garanzie adeguate / Clausole Standard).</p>
          <p><strong>Diritti dell’interessato:</strong> accesso, rettifica, cancellazione, limitazione, portabilità, opposizione; reclamo al Garante.</p>
          <p><strong>Contatti privacy:</strong> [email / PEC]; <strong>DPO (se nominato):</strong> [contatti].</p>
        </div>

        <div className="hr" style={{ margin: "16px 0" }} />

        <h3 style={{ fontWeight: 600, marginBottom: 8 }}>Consenso (solo ove richiesto)</h3>
        <div style={{ display: "grid", rowGap: 6 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ display: "inline-block", height: 16, width: 16, border: "1px solid #222222" }} />
            Acconsento a ricevere comunicazioni informative/commerciali relative ai servizi TrustyRent.
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ display: "inline-block", height: 16, width: 16, border: "1px solid #222222" }} />
            Non acconsento.
          </label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 24 }}>
          <div>
            <p><strong>Luogo e data:</strong> _____________________________</p>
          </div>
          <div>
            <p><strong>Firma locatario:</strong> ___________________________</p>
          </div>
        </div>
      </section>
      {/* --- FINE AREA PDF --- */}
    </main>
  );
}
