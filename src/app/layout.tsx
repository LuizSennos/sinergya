import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import LGPDGate from "@/components/LGPDGate";

export const metadata: Metadata = { title: "Sinergya" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          <LGPDGate />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}