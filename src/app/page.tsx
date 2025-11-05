// src/app/page.tsx
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default async function HomePage() {
  // Verifica se l'utente ha già una sessione attiva
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Se esiste una sessione → vai alla dashboard
  if (session?.access_token) {
    redirect("/dashboard");
  }

  // Altrimenti → vai al login
  redirect("/login");
}
