"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { UploadZone } from "@/components/upload-zone";
import { InstallPrompt } from "@/components/install-prompt";
import type { UploadProgress } from "@/types";

interface UploadResult {
  filename: string;
  public_id: string;
  url: string;
  size_mb: number;
  duration?: number;
}

export default function Home() {
  const [artist, setArtist] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const router = useRouter();

  const handleAnalyze = async () => {
    if (files.length === 0) return;
    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(files.map((f, i) => ({ filename: f.name, progress: 0, status: i === 0 ? "uploading" : "pending" })));

    const results: UploadResult[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        setUploadProgress((prev) => prev.map((p, j) => (j === i ? { ...p, status: "uploading" } : j < i ? { ...p, status: "complete", progress: 100 } : p)));

        const formData = new FormData();
        formData.append("file", files[i]);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Error al subir");
        }

        const data = await res.json();
        results.push({
          filename: files[i].name,
          public_id: data.public_id,
          url: data.url,
          size_mb: files[i].size / (1024 * 1024),
          duration: data.duration,
        });

        setUploadProgress((prev) => prev.map((p, j) => (j === i ? { ...p, progress: 100, status: "complete" } : p)));
      }

      sessionStorage.setItem("concert_artist", artist || "Artista");
      sessionStorage.setItem("concert_uploads", JSON.stringify(results));
      router.push("/processing");
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Error al subir");
      setIsUploading(false);
    }
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

          {isUploading && (
            <div className="space-y-2">
              {uploadProgress.map((p) => (
                <div key={p.filename} className="flex items-center justify-between text-xs">
                  <span className="truncate text-zinc-600">{p.filename}</span>
                  <span className="text-zinc-400">{p.status === "complete" ? "✓" : "Subiendo…"}</span>
                </div>
              ))}
            </div>
          )}

          {uploadError && <p className="text-xs text-zinc-500">{uploadError}</p>}

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={files.length === 0 || isUploading}
            className="w-full border border-zinc-900 bg-zinc-900 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isUploading ? "Subiendo…" : "Analizar"}
          </button>
        </div>
      </div>
    </div>
  );
}
