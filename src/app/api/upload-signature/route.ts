import { NextResponse } from "next/server";
import { getUploadSignature } from "@/lib/cloudinary";

export async function GET() {
  try {
    const sig = getUploadSignature();
    return NextResponse.json(sig);
  } catch (error) {
    console.error("Upload signature error:", error);
    return NextResponse.json(
      { error: "Error al generar firma de upload" },
      { status: 500 }
    );
  }
}
