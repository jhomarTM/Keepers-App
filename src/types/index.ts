export interface VideoAnalysis {
  id: string;
  filename: string;
  cloudinary_public_id: string;
  video_url?: string; // URL para previsualización

  // Metadata
  duration: number; // segundos
  size_mb: number;
  created_at: string; // fecha de grabación

  // Análisis de Cloudinary
  quality_score: number; // 0-100
  is_blurry: boolean;
  is_dark: boolean;
  phash: string; // para detectar duplicados

  // Decisión de Groq
  decision: "keep" | "delete" | "duplicate";
  reason: string;
  similar_to?: string; // id del video similar (si es duplicado)
}

export interface SessionResult {
  artist: string;
  date: string;
  city: string;

  // Videos procesados
  total_videos: number;
  keepers: VideoAnalysis[];
  deletable: VideoAnalysis[];
  duplicates: VideoAnalysis[];

  // Métricas de ahorro
  original_size_gb: number;
  optimized_size_gb: number;
  savings_gb: number;
  savings_percentage: number;

  // Top 3 shorts
  top_shorts: {
    video_id: string;
    short_url: string; // URL de Cloudinary transformado
    thumbnail_url: string;
  }[];

  // Descarga
  zip_url: string;
  folder_name: string; // Concert_BadBunny_2024-06-15_Lima
}

export interface UploadProgress {
  filename: string;
  progress: number;
  status: "pending" | "uploading" | "complete" | "error";
}

export interface ProcessingStep {
  id: string;
  label: string;
  status: "pending" | "in_progress" | "complete";
}
