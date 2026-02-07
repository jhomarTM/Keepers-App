import { NextResponse } from "next/server";
import { getThumbnailUrl } from "@/lib/cloudinary";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const publicId = searchParams.get("public_id");
  if (!publicId) {
    return NextResponse.json({ error: "public_id requerido" }, { status: 400 });
  }
  try {
    const url = getThumbnailUrl(publicId);
    return NextResponse.redirect(url);
  } catch (error) {
    console.error("Thumbnail error:", error);
    return NextResponse.json({ error: "Error al generar thumbnail" }, { status: 500 });
  }
}
