"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { ProgressBar } from "@/components/progress-bar";
import { ProcessingSteps } from "@/components/processing-steps";
import { useConcert } from "@/context/concert-context";
import { uploadVideoDirect } from "@/lib/cloudinary-client";
import type { UploadProgress, ProcessingStep } from "@/types";

interface UploadResult {
  filename: string;
  public_id: string;
  url: string;
  size_mb: number;
  duration?: number;
  width?: number;
  height?: number;
}

function heuristicDecision(u: UploadResult): "KEEP" | "DELETE" {
  if (u.duration != null && u.duration < 5) return "DELETE";
  if (u.size_mb < 1 && (u.duration ?? 0) > 10) return "DELETE";
  if (u.width != null && u.height != null && (u.width < 720 || u.height < 480)) return "DELETE";
  return "KEEP";
}

export default function ProcessingPage() {
  const { consumePending } = useConcert();
  const [progressItems, setProgressItems] = useState<UploadProgress[]>([]);
  const [steps, setSteps] = useState<ProcessingStep[]>([
    { id: "1", label: "Subir a Cloudinary", status: "in_progress" },
    { id: "2", label: "Analizar calidad", status: "pending" },
    { id: "3", label: "Detectar duplicados", status: "pending" },
    { id: "4", label: "Generar shorts", status: "pending" },
  ]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const pending = consumePending();

    if (pending) {
      // Flujo nuevo: tenemos archivos, hacer upload
      const { files, artist } = pending;
      sessionStorage.setItem("concert_artist", artist);

      const items: UploadProgress[] = files.map((f, i) => ({
        filename: f.name,
        progress: 0,
        status: i === 0 ? ("uploading" as const) : ("pending" as const),
      }));
      setProgressItems(items);

      let cancelled = false;

      const run = async () => {
        const results: UploadResult[] = [];
        for (let i = 0; i < files.length; i++) {
          if (cancelled) return;
          setProgressItems((prev) =>
            prev.map((p, j) =>
              j === i ? { ...p, status: "uploading" as const } : j < i ? { ...p, status: "complete" as const, progress: 100 } : p
            )
          );

          const data = await uploadVideoDirect(files[i], (p) => {
            setProgressItems((prev) => prev.map((pp, j) => (j === i ? { ...pp, progress: p } : pp)));
          });
          results.push({
            filename: files[i].name,
            public_id: data.public_id,
            url: data.secure_url,
            size_mb: files[i].size / (1024 * 1024),
            duration: data.duration,
            width: data.width,
            height: data.height,
          });

          setProgressItems((prev) => prev.map((p, j) => (j === i ? { ...p, progress: 100, status: "complete" as const } : p)));
        }

        if (cancelled) return;
        setSteps((s) => s.map((x, i) => (i === 0 ? { ...x, status: "complete" as const } : i === 1 ? { ...x, status: "in_progress" as const } : x)));
        sessionStorage.setItem("concert_uploads", JSON.stringify(results));
        await processAnalysis(results);
      };

      const processAnalysis = async (uploads: UploadResult[]) => {
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
                width: u.width,
                height: u.height,
              })),
            }),
          });
          if (analyzeRes.ok) {
            analysis = await analyzeRes.json();
          } else {
            const errText = await analyzeRes.text();
            console.error("Analyze API error:", analyzeRes.status, errText);
          }
        } catch (e) {
          console.error("Analyze failed:", e);
        }

        if (cancelled) return;
        setSteps((s) => s.map((x, i) => (i === 1 ? { ...x, status: "complete" as const } : i === 2 ? { ...x, status: "in_progress" as const } : x)));
        await new Promise((r) => setTimeout(r, 300));
        if (cancelled) return;

        setSteps((s) => s.map((x, i) => (i === 2 ? { ...x, status: "complete" as const } : i === 3 ? { ...x, status: "in_progress" as const } : x)));

        const top3Ids = analysis?.top_shorts?.slice(0, 3).filter((id) => uploads.some((u) => u.public_id === id)) ?? uploads.slice(0, 3).map((u) => u.public_id);
        const decisions = analysis?.decisions ?? {};

        const keepers: UploadResult[] = [];
        const deletable: UploadResult[] = [];
        for (const u of uploads) {
          const action = decisions[u.public_id]?.action ?? heuristicDecision(u);
          if (action === "KEEP" || action === "DUPLICATE") keepers.push(u);
          else deletable.push(u);
        }
        if (keepers.length === 0 && uploads.length > 0) keepers.push(uploads[0]);

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

        if (cancelled) return;
        setSteps((s) => s.map((x, i) => (i === 3 ? { ...x, status: "complete" as const } : x)));
        await new Promise((r) => setTimeout(r, 300));
        router.push("/results");
      };

      run().catch((e) => {
        setError(e instanceof Error ? e.message : "Error");
      });

      return () => {
        cancelled = true;
      };
    }

    // Flujo legacy: ya tenemos uploads en sessionStorage (refresh directo)
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

    const items: UploadProgress[] = uploads.map((u) => ({ filename: u.filename, progress: 100, status: "complete" as const }));
    setProgressItems(items);
    setSteps((s) => s.map((x) => (x.id === "1" ? { ...x, status: "complete" as const } : x)));

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
              width: u.width,
              height: u.height,
            })),
          }),
        });
        if (analyzeRes.ok) {
          analysis = await analyzeRes.json();
        } else {
          console.error("Analyze API error:", analyzeRes.status, await analyzeRes.text());
        }
      } catch (e) {
        console.error("Analyze failed:", e);
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
        const action = decisions[u.public_id]?.action ?? heuristicDecision(u);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, [router]);

  const completed = progressItems.filter((i) => i.status === "complete").length;
  const total = progressItems.length || 1;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-5">
      <div className="w-full max-w-md space-y-8">
        <div className="flex justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900" />
        </div>
        <Header subtitle="Analizando…" />
        <div className="space-y-4">
          <ProgressBar items={progressItems} />
          <p className="text-center text-xs text-zinc-400">
            {completed} / {total}
          </p>
          {error && <p className="text-center text-xs text-zinc-500">{error}</p>}
          <ProcessingSteps steps={steps} />
        </div>
      </div>
    </div>
  );
}