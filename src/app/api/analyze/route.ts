import { NextResponse } from "next/server";
import { analyzeVideos } from "@/lib/groq";
import { analyzeVideosWithXAI } from "@/lib/xai";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { videos } = body;

    if (!videos || !Array.isArray(videos)) {
      return NextResponse.json(
        { error: "Se requiere un array de videos" },
        { status: 400 }
      );
    }

    const videoData = videos.map(
      (v: { id: string; filename: string; size_mb: number; duration?: number; width?: number; height?: number }) => ({
        id: v.id,
        filename: v.filename,
        size_mb: v.size_mb,
        duration: v.duration,
        width: v.width,
        height: v.height,
      })
    );

    if (!process.env.XAI_API_KEY && !process.env.GROQ_API_KEY) {
      const decisions: Record<string, { action: string; reason: string }> = {};
      videos.forEach((v: { id: string }) => {
        decisions[v.id] = { action: "KEEP", reason: "Sin API configurada" };
      });
      return NextResponse.json({
        decisions,
        top_shorts: videos.slice(0, 3).map((v: { id: string }) => v.id),
        summary: { total_keepers: videos.length, total_deletable: 0, total_duplicates: 0 },
      });
    }

    // Prioridad: xAI (Grok) primero, luego Groq
    let decision;
    if (process.env.XAI_API_KEY) {
      decision = await analyzeVideosWithXAI(videoData);
    } else {
      decision = await analyzeVideos(videoData);
    }

    return NextResponse.json(decision);
  } catch (error) {
    console.error("Analyze error:", error);
    return NextResponse.json(
      { error: "Error al analizar videos" },
      { status: 500 }
    );
  }
}
