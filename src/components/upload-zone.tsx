"use client";

import { useCallback, useRef, useState } from "react";
import { ACCEPTED_VIDEO_EXTENSIONS, MAX_VIDEOS_PER_SESSION, MAX_VIDEO_SIZE_MB } from "@/lib/utils";

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  selectedFiles: File[];
}

export function UploadZone({ onFilesSelected, selectedFiles }: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = useCallback((files: FileList | File[]): File[] => {
    const fileArray = Array.from(files);
    const valid: File[] = [];
    const errors: string[] = [];

    for (const file of fileArray) {
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      const isVideoMime = file.type.startsWith("video/");
      const isVideoExt = ACCEPTED_VIDEO_EXTENSIONS.includes(ext);
      if (!isVideoMime && !isVideoExt) {
        errors.push(`${file.name}: formato no soportado`);
        continue;
      }
      if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
        errors.push(`${file.name}: máximo ${MAX_VIDEO_SIZE_MB} MB`);
        continue;
      }
      valid.push(file);
    }

    if (valid.length + selectedFiles.length > MAX_VIDEOS_PER_SESSION) {
      setError(`Máximo ${MAX_VIDEOS_PER_SESSION} videos por sesión`);
      return valid.slice(0, MAX_VIDEOS_PER_SESSION - selectedFiles.length);
    }

    setError(errors.length > 0 ? errors[0] : null);
    return valid;
  }, [selectedFiles.length]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const newFiles = validateFiles(e.dataTransfer.files);
      if (newFiles.length > 0) {
        onFilesSelected([...selectedFiles, ...newFiles]);
      }
    },
    [onFilesSelected, selectedFiles, validateFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        const newFiles = validateFiles(files);
        if (newFiles.length > 0) {
          onFilesSelected([...selectedFiles, ...newFiles]);
        }
      }
      e.target.value = "";
    },
    [onFilesSelected, selectedFiles, validateFiles]
  );

  const removeFile = (index: number) => {
    const updated = selectedFiles.filter((_, i) => i !== index);
    onFilesSelected(updated);
    setError(null);
  };

  return (
    <div className="space-y-4">
      {/* Inputs ocultos: uno para galería (sin capture) y otro para cámara */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="video/*"
        multiple
        onChange={handleFileInput}
        className="sr-only"
        aria-hidden
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="video/*"
        capture="environment"
        multiple
        onChange={handleFileInput}
        className="sr-only"
        aria-hidden
      />

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative rounded-xl border-2 border-dashed p-8 text-center transition-colors
          min-h-[160px] touch-manipulation
          ${isDragOver ? "border-amber-500 bg-amber-50/50" : "border-zinc-300 hover:border-zinc-400 active:border-amber-500"}
        `}
      >
        <div
          role="button"
          tabIndex={0}
          onClick={() => galleryInputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && galleryInputRef.current?.click()}
          className="flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-2"
        >
          <span className="text-4xl">📁</span>
          <p className="text-base font-medium text-zinc-700 md:text-lg">
            Arrastra o toca para adjuntar
          </p>
          <p className="text-sm text-zinc-500">Desde tu galería o dispositivo</p>
        </div>
      </div>

      {/* Botones explícitos para móvil: Galería y Cámara */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => galleryInputRef.current?.click()}
          className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 active:bg-amber-50 touch-manipulation"
        >
          <span>🖼️</span>
          Desde galería
        </button>
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 active:bg-amber-50 touch-manipulation"
        >
          <span>📷</span>
          Grabar nuevo
        </button>
      </div>
      <p className="text-center text-xs text-zinc-400">Formatos: MP4, MOV, M4V • Máx. {MAX_VIDEO_SIZE_MB} MB por video</p>

      {error && (
        <p className="text-sm text-rose-600">{error}</p>
      )}

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-zinc-600">
            {selectedFiles.length} video(s) seleccionado(s)
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedFiles.map((file, i) => (
              <span
                key={`${file.name}-${i}`}
                className="inline-flex items-center gap-1 rounded-lg bg-zinc-100 px-3 py-1.5 text-sm"
              >
                {file.name}
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="ml-1 text-zinc-500 hover:text-rose-600"
                  aria-label="Eliminar"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
