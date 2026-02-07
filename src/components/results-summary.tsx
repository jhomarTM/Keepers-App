"use client";

import type { SessionResult } from "@/types";
import { formatSizeGb } from "@/lib/utils";

interface ResultsSummaryProps {
  result: SessionResult;
}

export function ResultsSummary({ result }: ResultsSummaryProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">{formatSizeGb(result.original_size_gb)}</span>
          <span className="text-zinc-500">→</span>
          <span className="text-zinc-500">{formatSizeGb(result.optimized_size_gb)}</span>
        </div>
        <div className="h-px bg-zinc-200">
          <div
            className="h-full bg-zinc-900 transition-all"
            style={{ width: `${100 - result.savings_percentage}%` }}
          />
        </div>
        <p className="text-sm text-zinc-600">
          Liberar {formatSizeGb(result.savings_gb)} ({result.savings_percentage}%)
        </p>
      </div>

      <div className="flex gap-6 text-sm">
        <span className="text-zinc-600">{result.keepers.length} guardar</span>
        <span className="text-zinc-600">{result.deletable.length} borrar</span>
      </div>
    </div>
  );
}
