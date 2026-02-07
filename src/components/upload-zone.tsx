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
    <div className="space-y-3">
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
        onClick={() => galleryInputRef.current?.click()}
        className={`
          min-h-[120px] cursor-pointer border border-dashed transition-colors touch-manipulation
          flex flex-col items-center justify-center
          ${isDragOver ? "border-zinc-400 bg-zinc-50" : "border-zinc-200 hover:border-zinc-300"}
        `}
      >
        <p className="text-sm text-zinc-500">Arrastra o toca para seleccionar</p>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); galleryInputRef.current?.click(); }}
            className="text-xs text-zinc-400 underline hover:text-zinc-600"
          >
            Galería
          </button>
          <span className="text-zinc-300">·</span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}
            className="text-xs text-zinc-400 underline hover:text-zinc-600"
          >
            Cámara
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-zinc-500">{error}</p>}

      {selectedFiles.length > 0 && (
        <div className="space-y-1.5">
          {selectedFiles.map((file, i) => (
            <div key={`${file.name}-${i}`} className="flex items-center justify-between text-sm">
              <span className="truncate text-zinc-600">{file.name}</span>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="shrink-0 text-zinc-400 hover:text-zinc-600"
                aria-label="Eliminar"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
