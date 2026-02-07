import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY?.toString(),
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadVideo(file: File) {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary no configurado: faltan CLOUDINARY_CLOUD_NAME, API_KEY o API_SECRET");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = buffer.toString("base64");
  const mimeType = file.type || "video/mp4";
  const dataUri = `data:${mimeType};base64,${base64}`;

  try {
    const result = await cloudinary.uploader.upload(dataUri, {
      resource_type: "video",
      folder: "concert-vault",
      chunk_size: 6000000,
    });

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      duration: (result as { duration?: number }).duration,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const ext = err && typeof err === "object" && "error" in err ? ` (${String((err as { error?: unknown }).error)})` : "";
    throw new Error(`Cloudinary: ${msg}${ext}`);
  }
}

export function getShortUrl(publicId: string): string {
  return cloudinary.url(publicId, {
    resource_type: "video",
    transformation: [
      { effect: "preview:duration_5" },
      { aspect_ratio: "9:16", crop: "fill" },
      { quality: "auto" },
    ],
  });
}

export function getThumbnailUrl(publicId: string): string {
  return cloudinary.url(publicId, {
    resource_type: "video",
    format: "jpg",
    transformation: [
      { start_offset: "0" },
      { aspect_ratio: "9:16", crop: "fill" },
    ],
  });
}

/** Genera firma para upload directo desde el cliente (evita FUNCTION_PAYLOAD_TOO_LARGE en Vercel) */
export function getUploadSignature() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY?.toString();
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary no configurado");
  }
  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = { timestamp, folder: "concert-vault" };
  const cloudinaryRoot = require("cloudinary");
  const signature = cloudinaryRoot.utils.api_sign_request(paramsToSign, apiSecret);
  return { signature, timestamp, api_key: apiKey, cloud_name: cloudName };
}
