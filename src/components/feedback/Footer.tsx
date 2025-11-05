// src/components/Footer.tsx
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-neutral-800">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-neutral-300">
        {/* Links documenti */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="text-neutral-400">
            <h3 className="mb-2 font-medium text-neutral-200">Privacy e documenti</h3>
            <ul className="space-y-1">
              <li>
                <a href="/privacy" className="hover:text-white underline underline-offset-2">
                  Informativa Privacy
                </a>
              </li>
              <li>
                <a href="/termini" className="hover:text-white underline underline-offset-2">
                  Termini di Servizio
                </a>
              </li>
              <li>
                <a
                  href="/docs/modulo-privacy-locatari"
                  className="hover:text-white underline underline-offset-2"
                >
                  Modulo Privacy Locatari
                </a>
              </li>
            </ul>
          </div>

          {/* Spazio libero per eventuali contatti o link futuri */}
          <div className="text-neutral-400">
            {/* Lasciato volutamente vuoto per non rompere layout esistente */}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 text-center text-neutral-500">
          © {year} Affitti — Tutti i diritti riservati
        </div>
      </div>
    </footer>
  );
}
