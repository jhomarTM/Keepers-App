import { NextResponse } from "next/server";

/**
 * API Analyze - Integración Groq COMENTADA
 * Descomentar cuando GROQ_API_KEY esté configurada
 */

// import { analyzeVideos } from "@/lib/groq";

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

    // ========== INTEGRACIÓN GROQ - COMENTADA ==========
    // const decision = await analyzeVideos(videos);
    // return NextResponse.json(decision);

    // Respuesta mock hasta integrar - reglas simples locales
    const decisions: Record<string, { action: string; reason: string }> = {};
    videos.forEach((v: { id: string; quality_score?: number }) => {
      const score = v.quality_score ?? 50;
      decisions[v.id] = {
        action: score >= 40 ? "KEEP" : "DELETE",
        reason: score >= 40 ? "Calidad aceptable" : "Calidad baja",
      };
    });

    return NextResponse.json({
      decisions,
      top_shorts: videos.slice(0, 3).map((v: { id: string }) => v.id),
      summary: {
        total_keepers: Object.values(decisions).filter((d) => d.action === "KEEP").length,
        total_deletable: Object.values(decisions).filter((d) => d.action === "DELETE").length,
        total_duplicates: 0,
      },
      message: "Análisis mock - integrar Groq",
    });
  } catch (error) {
    console.error("Analyze error:", error);
    return NextResponse.json(
      { error: "Error al analizar videos" },
      { status: 500 }
    );
  }
}
