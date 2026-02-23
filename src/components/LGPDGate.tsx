"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import LGPDConsent from "@/components/LGPDConsent";

const SKIP_ROUTES = ["/", "/login", "/landing"];

export default function LGPDGate() {
  const { user, loading, refreshUser } = useAuth();
  const pathname = usePathname();

  if (loading) return null;
  if (!user) return null;
  if (SKIP_ROUTES.includes(pathname)) return null;
  if (user.lgpd_consent) return null;

  return (
    <LGPDConsent
      onAccept={() => {
        localStorage.setItem("lgpd_consent", "true");
        refreshUser();
      }}
    />
  );
}
