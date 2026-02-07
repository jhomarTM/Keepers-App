"use client";

import type { ProcessingStep } from "@/types";

interface ProcessingStepsProps {
  steps: ProcessingStep[];
}

export function ProcessingSteps({ steps }: ProcessingStepsProps) {
  return (
    <div className="space-y-2 text-xs">
      {steps.map((step) => (
        <div key={step.id} className="flex items-center gap-2">
          <span className="w-4 text-zinc-400">
            {step.status === "complete" && "✓"}
            {step.status === "in_progress" && "…"}
            {step.status === "pending" && "·"}
          </span>
          <span className={step.status === "complete" ? "text-zinc-400 line-through" : "text-zinc-600"}>
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
}
