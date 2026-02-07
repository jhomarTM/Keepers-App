import { NextResponse } from "next/server";
import { uploadVideo } from "@/lib/cloudinary";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No se recibió ningún archivo" },
        { status: 400 }
      );
    }

    const result = await uploadVideo(file);
    return NextResponse.json({
      public_id: result.public_id,
      url: result.secure_url,
      duration: result.duration ?? undefined,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al subir el video";
    const details = error instanceof Error && "error" in error ? String((error as { error?: unknown }).error) : "";
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: message + (details ? ` - ${details}` : "") },
      { status: 500 }
    );
  }
}
