import { NextResponse } from "next/server";

/**
 * API Upload - Integración Cloudinary COMENTADA
 * Descomentar cuando CLOUDINARY_* env vars estén configuradas
 */

// import { uploadVideo } from "@/lib/cloudinary";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No se recibió ningún archivo" },
        { status: 400 }
      );
    }

    // ========== INTEGRACIÓN CLOUDINARY - COMENTADA ==========
    // const result = await uploadVideo(file);
    // return NextResponse.json({
    //   public_id: result.public_id,
    //   url: result.secure_url,
    //   ...result.quality_analysis,
    // });

    // Respuesta mock hasta integrar
    return NextResponse.json({
      public_id: `mock_${Date.now()}`,
      url: URL.createObjectURL(file),
      message: "Upload deshabilitado - integrar Cloudinary",
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Error al subir el video" },
      { status: 500 }
    );
  }
}
