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
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-amber-900">Instala Concert Vault</p>
          <p className="mt-1 text-sm text-amber-800">
            {isIOS ? (
              <>
                Toca el botón compartir <span className="inline-block">⎋</span> y luego &quot;Añadir a la pantalla de inicio&quot;.
              </>
            ) : (
              <>Añade la app a tu pantalla de inicio para acceder rápido desde tu galería.</>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="shrink-0 text-amber-600 hover:text-amber-800"
          aria-label="Cerrar"
        >
          ×
        </button>
      </div>
    </div>
  );
}
