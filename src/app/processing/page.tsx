"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { ProgressBar } from "@/components/progress-bar";
import { ProcessingSteps } from "@/components/processing-steps";
import type { UploadProgress, ProcessingStep } from "@/types";

export default function ProcessingPage() {
  const [progressItems, setProgressItems] = useState<UploadProgress[]>([]);
  const [steps, setSteps] = useState<ProcessingStep[]>([
    { id: "1", label: "Subir a Cloudinary", status: "in_progress" },
    { id: "2", label: "Analizar calidad", status: "pending" },
    { id: "3", label: "Detectar duplicados", status: "pending" },
    { id: "4", label: "Generar shorts", status: "pending" },
  ]);
  const router = useRouter();

  useEffect(() => {
    let filenames: string[] = [];
    if (typeof window !== "undefined") {
      try {
        filenames = JSON.parse(sessionStorage.getItem("concert_filenames") || "[]");
      } catch {
        filenames = ["video_001.mov", "video_002.mov", "video_003.mov"];
      }
    }
    if (filenames.length === 0) filenames = ["video_001.mov", "video_002.mov"];

    const items: UploadProgress[] = filenames.map((f, i) => ({
      filename: f,
      progress: 0,
      status: i === 0 ? "uploading" : "pending",
    }));
    setProgressItems(items);

    // Simular progreso (Cloudinary/Groq comentados - UI simulada)
    const totalDuration = 4000;
    const itemDuration = totalDuration / items.length;

    items.forEach((_, idx) => {
      const start = idx * itemDuration;
      for (let p = 0; p <= 100; p += 10) {
        setTimeout(() => {
          setProgressItems((prev) => {
            const next = [...prev];
            next[idx] = {
              ...next[idx],
              progress: p,
              status: p === 100 ? "complete" : "uploading",
            };
            if (p === 100 && idx < next.length - 1) {
              next[idx + 1].status = "uploading";
            }
            return next;
          });
        }, start + (p / 100) * itemDuration);
      }
    });

    const stepInterval = totalDuration / 4;
    const stepTimes = [0, stepInterval, stepInterval * 2, stepInterval * 3];

    stepTimes.forEach((t, i) => {
      setTimeout(() => {
        setSteps((prev) =>
          prev.map((s, j) => ({
            ...s,
            status:
              j < i ? "complete" : j === i ? "in_progress" : "pending",
          }))
        );
      }, t);
    });

    // Redirigir a resultados cuando termine (con datos mock)
    const redirectTimer = setTimeout(() => {
      sessionStorage.setItem("concert_processed", "true");
      router.push("/results");
    }, totalDuration + 500);

    return () => clearTimeout(redirectTimer);
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
          <ProcessingSteps steps={steps} />
        </div>
      </div>
    </div>
  );
}
