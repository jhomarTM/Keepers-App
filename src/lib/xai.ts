interface VideoInput {
  id: string;
  filename: string;
  size_mb: number;
  duration?: number;
}

interface AnalyzeDecision {
  decisions: Record<string, { action: string; reason: string }>;
  top_shorts: string[];
  summary: { total_keepers: number; total_deletable: number; total_duplicates: number };
}

export async function analyzeVideosWithXAI(videos: VideoInput[]): Promise<AnalyzeDecision> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) throw new Error("XAI_API_KEY no configurada");

  const prompt = `Eres un asistente experto en análisis de videos de conciertos.

Tu tarea es analizar los datos de cada video y decidir:
- KEEP: Videos que vale la pena conservar (buen tamaño, nombre sugiere momento relevante)
- DELETE: Videos que se pueden borrar (muy pequeños, posibles duplicados por nombre)
- DUPLICATE: Videos muy similares a otros (conservar el mejor)

Datos de los videos:
${JSON.stringify(videos, null, 2)}

Reglas de decisión:
1. Videos muy cortos (< 3 segundos aprox, size_mb < 5) → DELETE
2. Nombres muy similares (ej: video_001, video_002 del mismo evento) → elegir KEEP para los mejores, DUPLICATE para el resto
3. El resto → KEEP

Para el TOP 3 SHORTS, selecciona los 3 videos con id que prefieras para clips de 5 seg en 9:16. Prioriza variedad.

Responde SOLO en JSON válido, sin markdown ni texto extra:
{
  "decisions": {
    "video_id": {
      "action": "KEEP" | "DELETE" | "DUPLICATE",
      "reason": "explicación breve"
    }
  },
  "top_shorts": ["video_id_1", "video_id_2", "video_id_3"],
  "summary": {
    "total_keepers": number,
    "total_deletable": number,
    "total_duplicates": number
  }
}`;

  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "grok-4-latest",
      messages: [{ role: "user", content: prompt }],
      stream: false,
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`xAI API error: ${res.status} ${err}`);
  }

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("Empty response from xAI");

  const jsonStr = content.replace(/```json\n?|\n?```/g, "").trim();
  const parsed = JSON.parse(jsonStr) as AnalyzeDecision;

  if (!parsed.decisions || !parsed.top_shorts || !parsed.summary) {
    throw new Error("Invalid xAI response format");
  }

  return parsed;
}
