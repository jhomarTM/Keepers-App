"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { UploadZone } from "@/components/upload-zone";
import { InstallPrompt } from "@/components/install-prompt";

export default function Home() {
  const [artist, setArtist] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const router = useRouter();

  const handleAnalyze = () => {
    if (files.length === 0) return;
    // Guardar datos para la página de procesamiento (Cloudinary/Groq comentados - simulamos)
    if (typeof window !== "undefined") {
      sessionStorage.setItem("concert_artist", artist || "Artista");
      sessionStorage.setItem("concert_file_count", String(files.length));
      sessionStorage.setItem("concert_filenames", JSON.stringify(files.map((f) => f.name)));
    }
    router.push("/processing");
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-md px-5 py-12">
        <Header />

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
