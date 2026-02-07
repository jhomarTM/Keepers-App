"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface ConcertContextValue {
  artist: string;
  setArtist: (v: string) => void;
  files: File[];
  setFiles: (v: File[]) => void;
  clearPending: () => void;
  pendingFiles: File[] | null;
  pendingArtist: string | null;
  setPending: (files: File[], artist: string) => void;
  consumePending: () => { files: File[]; artist: string } | null;
}

const ConcertContext = createContext<ConcertContextValue | null>(null);

export function ConcertProvider({ children }: { children: ReactNode }) {
  const [artist, setArtist] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[] | null>(null);
  const [pendingArtist, setPendingArtist] = useState<string | null>(null);

  const setPending = useCallback((f: File[], a: string) => {
    setPendingFiles(f);
    setPendingArtist(a);
  }, []);

  const consumePending = useCallback(() => {
    if (!pendingFiles || pendingFiles.length === 0) return null;
    const result = { files: [...pendingFiles], artist: pendingArtist || "Artista" };
    setPendingFiles(null);
    setPendingArtist(null);
    return result;
  }, [pendingFiles, pendingArtist]);

  const clearPending = useCallback(() => {
    setPendingFiles(null);
    setPendingArtist(null);
  }, []);

  return (
    <ConcertContext.Provider
      value={{
        artist,
        setArtist,
        files,
        setFiles,
        clearPending,
        pendingFiles,
        pendingArtist,
        setPending,
        consumePending,
      }}
    >
      {children}
    </ConcertContext.Provider>
  );
}

export function useConcert() {
  const ctx = useContext(ConcertContext);
  if (!ctx) throw new Error("useConcert must be used within ConcertProvider");
  return ctx;
}
