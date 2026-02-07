import { NextResponse } from "next/server";

/**
 * API Generate Shorts - Integración Cloudinary COMENTADA
 * Descomentar cuando CLOUDINARY_* env vars estén configuradas
 */

// import { getShortUrl } from "@/lib/cloudinary";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { public_ids } = body;

    if (!public_ids || !Array.isArray(public_ids)) {
      return NextResponse.json(
        { error: "Se requiere un array de public_ids" },
        { status: 400 }
      );
    }

    // ========== INTEGRACIÓN CLOUDINARY - COMENTADA ==========
    // const shorts = public_ids.map((id: string) => ({
    //   video_id: id,
    //   short_url: getShortUrl(id),
    //   thumbnail_url: getShortUrl(id) + ".jpg",
    // }));
    // return NextResponse.json({ shorts });

    // Respuesta mock hasta integrar
    const shorts = public_ids.map((id: string) => ({
      video_id: id,
      short_url: "",
      thumbnail_url: "",
    }));

    return NextResponse.json({
      shorts,
      message: "Shorts mock - integrar Cloudinary",
    });
  } catch (error) {
    console.error("Generate shorts error:", error);
    return NextResponse.json(
      { error: "Error al generar shorts" },
      { status: 500 }
    );
  }
}
