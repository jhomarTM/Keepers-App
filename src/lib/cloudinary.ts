/**
 * Cloudinary integration - COMENTADO hasta integrar
 * Descomentar cuando se configure CLOUDINARY_CLOUD_NAME, API_KEY, API_SECRET
 */

// import { v2 as cloudinary } from "cloudinary";

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// export async function uploadVideo(file: File) {
//   const result = await cloudinary.uploader.upload(file, {
//     resource_type: "video",
//     quality_analysis: true,
//   });
//   return result;
// }

// export function getShortUrl(publicId: string) {
//   return cloudinary.url(publicId, {
//     resource_type: "video",
//     transformation: [
//       { effect: "preview:duration_5" },
//       { aspect_ratio: "9:16", crop: "fill" },
//       { quality: "auto" },
//     ],
//   });
// }

export const cloudinaryPlaceholder = "// Cloudinary client - integrar cuando esté listo";
