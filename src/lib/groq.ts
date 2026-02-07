import Groq from "groq-sdk";

interface VideoInput {
  id: string;
  filename: string;
  size_mb: number;
  duration?: number;
  width?: number;
  height?: number;
}

interface GroqDecision {
  decisions: Record<string, { action: string; reason: string }>;
  top_shorts: string[];
  summary: { total_keepers: number; total_deletable: number; total_duplicates: number };
}

export async function analyzeVideos(videos: VideoInput[]): Promise<GroqDecision> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY no configurada");

  const groq = new Groq({ apiKey });
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

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
  });

  const content = completion.choices[0]?.message?.content?.trim();
  if (!content) throw new Error("Empty response from Groq");

  // Limpiar posible markdown
  const jsonStr = content.replace(/```json\n?|\n?```/g, "").trim();
  const parsed = JSON.parse(jsonStr) as GroqDecision;

  if (!parsed.decisions || !parsed.top_shorts || !parsed.summary) {
    throw new Error("Invalid Groq response format");
  }

  return parsed;
}
