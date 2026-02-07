"use client";

import type { SessionResult } from "@/types";

interface ResultsSummaryProps {
  result: SessionResult;
}

export function ResultsSummary({ result }: ResultsSummaryProps) {
  const photosEquivalent = Math.round((result.savings_gb * 1024) / 5); // ~5MB por foto

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-zinc-800">💾 AHORRO DE MEMORIA</h2>

      <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <span className="text-sm font-medium text-zinc-600">
            Original: {result.original_size_gb.toFixed(1)} GB
          </span>
          <span className="text-zinc-400">→</span>
          <span className="text-sm font-medium text-zinc-600">
            Optimizado: {result.optimized_size_gb.toFixed(1)} GB
          </span>
        </div>

        <div className="mb-4 h-3 overflow-hidden rounded-full bg-zinc-200">
          <div
            className="h-full bg-emerald-500 transition-all"
            style={{ width: `${100 - result.savings_percentage}%` }}
          />
        </div>

        <div className="space-y-1">
          <p className="text-lg font-semibold text-zinc-800">
            🎯 Puedes liberar {result.savings_gb.toFixed(1)} GB ({result.savings_percentage}%)
          </p>
          <p className="text-sm text-zinc-600">
            📱 Equivale a ~{photosEquivalent.toLocaleString()} fotos más
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
          <p className="text-2xl font-bold text-emerald-700">🟢 {result.keepers.length} Keepers</p>
          <p className="text-sm text-zinc-600">({result.optimized_size_gb.toFixed(1)} GB)</p>
        </div>
        <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4">
          <p className="text-2xl font-bold text-rose-700">🔴 {result.deletable.length} Borrables</p>
          <p className="text-sm text-zinc-600">({result.savings_gb.toFixed(1)} GB)</p>
        </div>
      </div>
    </div>
  );
}
