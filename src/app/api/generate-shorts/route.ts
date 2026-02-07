import { NextResponse } from "next/server";
import { getShortUrl, getThumbnailUrl } from "@/lib/cloudinary";

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

    const shorts = public_ids.map((id: string) => ({
      video_id: id,
      short_url: getShortUrl(id),
      thumbnail_url: getThumbnailUrl(id),
    }));

    return NextResponse.json({ shorts });
  } catch (error) {
    console.error("Generate shorts error:", error);
    return NextResponse.json(
      { error: "Error al generar shorts" },
      { status: 500 }
    );
  }
}
