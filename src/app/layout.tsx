import "@/styles/globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { HashRedirect, ChromeFrame } from "@/components";

export const metadata: Metadata = {
  title: "Affitti",
  description: "App Affitti",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="it">
      <body>
        <AuthProvider>
          <HashRedirect />
          <ChromeFrame>{children}</ChromeFrame>
        </AuthProvider>
      </body>
    </html>
  );
}
