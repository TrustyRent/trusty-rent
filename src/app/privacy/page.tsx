export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-white">
      <h1 className="text-3xl font-semibold mb-4">Informativa Privacy</h1>
      <p className="text-white/70 mb-6">
        Questa è un’informativa privacy generica per TrustyRent. Personalizza i dati del Titolare,
        i contatti e le basi giuridiche con il tuo consulente.
      </p>

      <section className="space-y-3 text-sm leading-6 text-white/80">
        <p><strong>Titolare del trattamento:</strong> [Ragione sociale], [indirizzo], [email privacy / PEC].</p>
        <p><strong>Finalità:</strong> gestione registrazione e autenticazione, gestione locazioni/contratti, adempimenti legali, difesa di diritti.</p>
        <p><strong>Basi giuridiche:</strong> esecuzione di contratto, obblighi di legge, legittimo interesse, consenso (ove richiesto).</p>
        <p><strong>Dati trattati:</strong> anagrafici, di contatto, fiscali, documentali, pagamento.</p>
        <p><strong>Conservazione:</strong> per la durata del rapporto e oltre nei termini di legge.</p>
        <p><strong>Diritti:</strong> accesso, rettifica, cancellazione, limitazione, portabilità, opposizione; reclamo al Garante.</p>
        <p><strong>Contatti privacy:</strong> [email / PEC].</p>
      </section>
    </main>
  );
}
