"use client";

import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { UploadZone } from "@/components/upload-zone";
import { InstallPrompt } from "@/components/install-prompt";
import { useConcert } from "@/context/concert-context";

export default function Home() {
  const { artist, setArtist, files, setFiles, setPending } = useConcert();
  const router = useRouter();

  const handleAnalyze = () => {
    if (files.length === 0) return;
    setPending([...files], artist || "Artista");
    router.push("/processing");
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-md px-5 py-12">
        <Header />

        <div className="mt-4 space-y-2 rounded-lg border border-zinc-100 bg-zinc-50/50 px-4 py-3">
          <p className="text-xs leading-relaxed text-zinc-600">
            <span className="font-medium text-zinc-700">Problema</span> — Videos de conciertos que ocupan espacio sin saber cuáles borrar.
          </p>
          <p className="text-xs leading-relaxed text-zinc-600">
            <span className="font-medium text-zinc-700">Valor</span> — Detectamos cuáles eliminar y generamos los 3 mejores shorts.
          </p>
          <p className="text-xs leading-relaxed text-zinc-600">
            <span className="font-medium text-zinc-700">Uso</span> — Sube videos, analizamos y te decimos qué guardar.
          </p>
        </div>

        <div className="mt-6">
          <InstallPrompt />
        </div>

        <div className="mt-12 space-y-6">
          <div>
            <input
              id="artist"
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="Nombre del artista"
              className="w-full border-b border-zinc-200 bg-transparent py-3 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none"
            />
          </div>

          <UploadZone onFilesSelected={setFiles} selectedFiles={files} />

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={files.length === 0}
            className="w-full border border-zinc-900 bg-zinc-900 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Analizar
          </button>
        </div>
      </div>
    </div>
  );
}
