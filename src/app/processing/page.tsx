"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { ProgressBar } from "@/components/progress-bar";
import { ProcessingSteps } from "@/components/processing-steps";
import type { UploadProgress, ProcessingStep } from "@/types";

interface UploadResult {
  filename: string;
  public_id: string;
  url: string;
  size_mb: number;
  duration?: number;
}

export default function ProcessingPage() {
  const [progressItems, setProgressItems] = useState<UploadProgress[]>([]);
  const [steps, setSteps] = useState<ProcessingStep[]>([
    { id: "1", label: "Subir a Cloudinary", status: "complete" },
    { id: "2", label: "Analizar calidad", status: "in_progress" },
    { id: "3", label: "Detectar duplicados", status: "pending" },
    { id: "4", label: "Generar shorts", status: "pending" },
  ]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const uploadsJson = sessionStorage.getItem("concert_uploads");
    if (!uploadsJson) {
      router.replace("/");
      return;
    }

    let uploads: UploadResult[] = [];
    try {
      uploads = JSON.parse(uploadsJson);
    } catch {
      router.replace("/");
      return;
    }

    const items: UploadProgress[] = uploads.map((u) => ({
      filename: u.filename,
      progress: 100,
      status: "complete" as const,
    }));
    setProgressItems(items);

    let cancelled = false;

    const run = async () => {
      setSteps((s) => s.map((x, i) => (i === 1 ? { ...x, status: "in_progress" as const } : x)));

      let analysis: { decisions: Record<string, { action: string; reason: string }>; top_shorts: string[] } | null = null;

      try {
        const analyzeRes = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            videos: uploads.map((u) => ({
              id: u.public_id,
              filename: u.filename,
              size_mb: u.size_mb,
              duration: u.duration,
            })),
          }),
        });

        if (analyzeRes.ok) {
          analysis = await analyzeRes.json();
        }
      } catch {
        // Si Groq falla, usar fallback
      }

      if (cancelled) return;
      setSteps((s) => s.map((x, i) => (i === 1 ? { ...x, status: "complete" as const } : i === 2 ? { ...x, status: "in_progress" as const } : x)));
      await new Promise((r) => setTimeout(r, 400));
      if (cancelled) return;

      setSteps((s) => s.map((x, i) => (i === 2 ? { ...x, status: "complete" as const } : i === 3 ? { ...x, status: "in_progress" as const } : x)));

      const top3Ids = analysis?.top_shorts?.slice(0, 3).filter((id) => uploads.some((u) => u.public_id === id)) ?? uploads.slice(0, 3).map((u) => u.public_id);
      const decisions = analysis?.decisions ?? {};

      const keepers: typeof uploads = [];
      const deletable: typeof uploads = [];
      for (const u of uploads) {
        const d = decisions[u.public_id];
        const action = d?.action ?? "KEEP";
        if (action === "KEEP" || action === "DUPLICATE") keepers.push(u);
        else deletable.push(u);
      }
      if (keepers.length === 0 && uploads.length > 0) keepers.push(uploads[0]);

      try {
        const res = await fetch("/api/generate-shorts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ public_ids: top3Ids }),
        });
        if (!res.ok) throw new Error("Error generando shorts");
        const { shorts } = await res.json();

        const totalSize = uploads.reduce((a, u) => a + u.size_mb, 0);
        const keptSize = keepers.reduce((a, u) => a + u.size_mb, 0);
        const savedSize = totalSize - keptSize;

        sessionStorage.setItem(
          "concert_result",
          JSON.stringify({
            artist: sessionStorage.getItem("concert_artist") || "Artista",
            date: new Date().toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" }),
            city: "",
            uploads,
            shorts,
            keepers: keepers.map((u, i) => ({
              id: String(i),
              filename: u.filename,
              cloudinary_public_id: u.public_id,
              duration: u.duration ?? 0,
              size_mb: u.size_mb,
              created_at: "",
              quality_score: 80,
              is_blurry: false,
              is_dark: false,
              phash: "",
              decision: "keep" as const,
              reason: decisions[u.public_id]?.reason ?? "",
            })),
            deletable: deletable.map((u, i) => ({
              id: String(i),
              filename: u.filename,
              cloudinary_public_id: u.public_id,
              duration: u.duration ?? 0,
              size_mb: u.size_mb,
              created_at: "",
              quality_score: 30,
              is_blurry: false,
              is_dark: false,
              phash: "",
              decision: "delete" as const,
              reason: decisions[u.public_id]?.reason ?? "",
            })),
            original_size_gb: totalSize / 1024,
            optimized_size_gb: keptSize / 1024,
            savings_gb: savedSize / 1024,
            savings_percentage: totalSize > 0 ? Math.round((savedSize / totalSize) * 100) : 0,
            folder_name: `Concert_${(sessionStorage.getItem("concert_artist") || "Artista").replace(/\s/g, "")}_${new Date().toISOString().slice(0, 10)}`,
          })
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error");
        return;
      }

      if (cancelled) return;
      setSteps((s) => s.map((x, i) => (i === 3 ? { ...x, status: "complete" as const } : x)));
      await new Promise((r) => setTimeout(r, 400));
      router.push("/results");
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-md px-5 py-12">
        <Header subtitle="Analizando…" />

        <div className="mt-12 space-y-8">
          <ProgressBar items={progressItems} />
          <p className="text-center text-xs text-zinc-400">
            {progressItems.filter((i) => i.status === "complete").length} / {progressItems.length}
          </p>
          {error && <p className="text-xs text-zinc-500">{error}</p>}
          <ProcessingSteps steps={steps} />
        </div>
      </div>
    </div>
  );
}
