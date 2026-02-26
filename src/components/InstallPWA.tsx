"use client";
import { useEffect, useState } from "react";

export default function InstallPWA() {
  const [prompt, setPrompt] = useState<any>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const handler = (e: any) => {
      e.preventDefault();
      setPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setDismissed(true));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!prompt || dismissed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-5"
      style={{ background: "rgba(15,23,42,0.97)", borderTop: "1px solid rgba(79,191,159,0.3)", backdropFilter: "blur(12px)" }}>
      <div className="max-w-md mx-auto flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">Instalar Sinergya</p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Adicione à tela inicial para acesso rápido</p>
        </div>
        <button onClick={() => setDismissed(true)}
          className="text-xs px-3 py-2 rounded-lg"
          style={{ color: "rgba(255,255,255,0.4)" }}>
          Agora não
        </button>
        <button
          onClick={async () => {
            prompt.prompt();
            const { outcome } = await prompt.userChoice;
            if (outcome === "accepted") setDismissed(true);
            setPrompt(null);
          }}
          className="text-xs px-4 py-2.5 rounded-xl font-bold text-white whitespace-nowrap"
          style={{ background: "linear-gradient(135deg, #4FBF9F, #3A7BD5)" }}>
          Instalar app
        </button>
      </div>
    </div>
  );
}