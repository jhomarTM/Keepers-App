"use client";

import type { ProcessingStep } from "@/types";

interface ProcessingStepsProps {
  steps: ProcessingStep[];
}

export function ProcessingSteps({ steps }: ProcessingStepsProps) {
  return (
    <div className="space-y-3 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4">
      {steps.map((step) => (
        <div key={step.id} className="flex items-center gap-3">
          <span className="text-lg">
            {step.status === "complete" && "☑️"}
            {step.status === "in_progress" && "⏳"}
            {step.status === "pending" && "⬜"}
          </span>
          <span
            className={
              step.status === "complete"
                ? "text-zinc-700 line-through"
                : step.status === "in_progress"
                  ? "font-medium text-zinc-900"
                  : "text-zinc-500"
            }
          >
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
}
