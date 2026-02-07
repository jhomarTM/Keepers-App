/**
 * Upload directo desde el cliente a Cloudinary.
 * Evita FUNCTION_PAYLOAD_TOO_LARGE (413) en Vercel: el archivo no pasa por nuestro servidor.
 */

export async function uploadVideoDirect(
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ public_id: string; secure_url: string; duration?: number }> {
  const res = await fetch("/api/upload-signature");
  if (!res.ok) throw new Error("No se pudo obtener la firma");
  const { signature, timestamp, api_key, cloud_name } = await res.json();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("api_key", api_key);
  formData.append("folder", "concert-vault");
  formData.append("resource_type", "video");

  const xhr = new XMLHttpRequest();
  xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloud_name}/video/upload`);

  const result = await new Promise<{ public_id: string; secure_url: string; duration?: number }>((resolve, reject) => {
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        resolve({
          public_id: data.public_id,
          secure_url: data.secure_url,
          duration: data.duration,
        });
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          reject(new Error(err.error?.message || err.error || `Upload ${xhr.status}`));
        } catch {
          reject(new Error(`Upload falló: ${xhr.status}`));
        }
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Error de red")));
    xhr.send(formData);
  });

  return result;
}
