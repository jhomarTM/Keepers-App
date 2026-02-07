interface VideoInput {
  id: string;
  filename: string;
  size_mb: number;
  duration?: number;
  width?: number;
  height?: number;
}

interface AnalyzeDecision {
  decisions: Record<string, { action: string; reason: string }>;
  top_shorts: string[];
  summary: { total_keepers: number; total_deletable: number; total_duplicates: number };
}

export async function analyzeVideosWithXAI(videos: VideoInput[]): Promise<AnalyzeDecision> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) throw new Error("XAI_API_KEY no configurada");

  const prompt = `Eres un experto en curaduría de videos de conciertos. Tu objetivo es identificar qué videos BORRAR para liberar espacio, conservando solo los buenos.

Datos de cada video (id, filename, size_mb, duration en segundos, width, height en píxeles):
${JSON.stringify(videos, null, 2)}

Acciones:
- DELETE: Videos que NO vale la pena conservar. DEBES marcar como DELETE cuando:
  * Duración muy corta (< 5 segundos) → fragmentos sin valor
  * Baja resolución (width < 720 O height < 480) → calidad pobre
  * Tamaño muy pequeño para la duración: si size_mb < 2 para un video > 30 seg → compresión alta, mala calidad
  * Nombres que sugieren grabación accidental: IMG_, VID_, screen, capture, grabación, etc.
  * Videos de menos de 1 MB con duración > 10 seg → imposible que sea buena calidad
- DUPLICATE: Muy similares a otro (mismo evento, nombres consecutivos). KEEP el mejor, DUPLICATE el resto.
- KEEP: Solo videos con buena duración, resolución aceptable y que parecen momentos relevantes del concierto.

IMPORTANTE: NO marques todo como KEEP. Si hay videos malos (cortos, baja resolución, mala calidad), márcalos como DELETE. El usuario quiere distinguir entre guardar y borrar.

Para top_shorts: los 3 mejores ids para clips de 5 seg en 9:16. Prioriza resolución y variedad.

Responde SOLO JSON válido, sin markdown:
{
  "decisions": {
    "id_del_video": { "action": "KEEP" | "DELETE" | "DUPLICATE", "reason": "motivo breve" }
  },
  "top_shorts": ["id1", "id2", "id3"],
  "summary": { "total_keepers": N, "total_deletable": N, "total_duplicates": N }
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
