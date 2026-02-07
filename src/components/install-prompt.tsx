"use client";

import { useEffect, useState } from "react";

export function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: boolean }).MSStream);
    setIsStandalone(
      window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as Navigator & { standalone?: boolean }).standalone === true
    );
  }, []);

  if (isStandalone || dismissed) return null;

  return (
    <div className="flex items-center justify-between gap-2 border-b border-zinc-100 pb-4">
      <p className="text-xs text-zinc-500">
        {isIOS ? "Compartir → Añadir a pantalla de inicio" : "Añadir a pantalla de inicio para acceso rápido"}
      </p>
      <button type="button" onClick={() => setDismissed(true)} className="shrink-0 text-zinc-400 hover:text-zinc-600" aria-label="Cerrar">
        ×
      </button>
    </div>
  );
}
