import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/** Formatea size en GB: muestra MB cuando < 1 GB para valores legibles */
export function formatSizeGb(sizeGb: number): string {
  if (sizeGb <= 0) return "0 MB";
  const sizeMb = sizeGb * 1024;
  if (sizeGb >= 1) return `${sizeGb.toFixed(1)} GB`;
  if (sizeMb >= 1) return `${sizeMb < 10 ? (Math.round(sizeMb * 10) / 10) : Math.round(sizeMb)} MB`;
  return `${Math.round(sizeMb * 1024)} KB`;
}

export const ACCEPTED_VIDEO_EXTENSIONS = [".mp4", ".mov", ".m4v"];
export const MAX_VIDEOS_PER_SESSION = 30;
export const MAX_VIDEO_SIZE_MB = 100;
