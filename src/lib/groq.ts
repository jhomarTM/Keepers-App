/**
 * Groq integration - COMENTADO hasta integrar
 * Descomentar cuando se configure GROQ_API_KEY
 */

// import Groq from "groq-sdk";

// const groq = new Groq({
//   apiKey: process.env.GROQ_API_KEY,
// });

// export async function analyzeVideos(videosData: unknown[]) {
//   const decision = await groq.chat.completions.create({
//     model: "llama-3.1-70b-versatile",
//     messages: [
//       {
//         role: "user",
//         content: `Analiza estos videos y decide cuáles conservar... ${JSON.stringify(videosData)}`,
//       },
//     ],
//   });
//   return decision;
// }

export const groqPlaceholder = "// Groq client - integrar cuando esté listo";
