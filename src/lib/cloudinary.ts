import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadVideo(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise<{
    public_id: string;
    secure_url: string;
    duration?: number;
    [key: string]: unknown;
  }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "video",
        folder: "concert-vault",
      },
      (error, result) => {
        if (error) reject(error);
        else if (result) resolve(result as { public_id: string; secure_url: string; duration?: number });
        else reject(new Error("Upload failed"));
      }
    );
    uploadStream.end(buffer);
  });
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
