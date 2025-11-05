"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/**
 * Mostra SEMPRE i children se l'utente non è autenticato.
 * Se l'utente esiste, redireziona alla dashboard.
 * Non blocca il render in base a "loading" per evitare pagine nere.
 */
export default function RequireGuest({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  return <>{!user ? children : null}</>;
}
