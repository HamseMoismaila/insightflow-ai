import { Brain, Check, Database, Loader2, Microscope, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

interface AnalysisStatusProps {
  filename: string;
}

interface Step {
  id: number;
  label: string;
  description: string;
  status: "pending" | "active" | "done";
  icon: typeof Database;
}

const INITIAL_STEPS: Step[] = [
  {
    id: 1,
    label: "Validating dataset structure",
    description: "Confirming the file shape and preparing the uploaded dataset for analysis.",
    status: "active",
    icon: Database,
  },
  {
    id: 2,
    label: "Generating statistical profile",
    description: "Collecting the summary information that powers insights and charts.",
    status: "pending",
    icon: Microscope,
  },
  {
    id: 3,
    label: "Building AI insight prompt",
    description: "Preparing the prompt and safety filters before analysis completes.",
    status: "pending",
    icon: Brain,
  },
  {
    id: 4,
    label: "Finalizing dashboard output",
    description: "Waiting for the backend report and chart payload to be ready.",
    status: "pending",
    icon: Sparkles,
  },
];

export default function AnalysisStatus({ filename }: AnalysisStatusProps) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveStep((current) => (current < INITIAL_STEPS.length - 1 ? current + 1 : current));
    }, 1600);

    return () => window.clearInterval(interval);
  }, []);

  const steps = INITIAL_STEPS.map((step, index) => ({
    ...step,
    status: index < activeStep ? "done" : index === activeStep ? "active" : "pending",
  }));

  return (
    <div className="mx-auto w-full max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 shadow-sm shadow-blue-50">
          <Brain className="h-6 w-6" />
        </div>
        <h3 className="text-md font-bold text-slate-900">Analyzing your dataset</h3>
        <p className="mt-1 text-xs text-slate-500">
          Working on <span className="font-semibold text-slate-800">{filename}</span>. This may take a moment.
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = step.status === "active";
          const isDone = step.status === "done";

          return (
            <div
              key={step.id}
              className={`flex items-start gap-3.5 rounded-lg border p-3 transition-all duration-300 ${
                isActive
                  ? "border-blue-200 bg-blue-50/35 shadow-sm shadow-blue-50"
                  : isDone
                  ? "border-transparent bg-slate-50/50"
                  : "border-transparent bg-white opacity-60"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isDone ? (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <Check className="h-3 w-3" />
                  </div>
                ) : isActive ? (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
                    <Loader2 className="h-3 w-3 animate-spin" />
                  </div>
                ) : (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-200 text-slate-400">
                    <span className="text-[9px] font-bold">{step.id}</span>
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className={`text-xs font-semibold ${isActive ? "text-blue-950" : "text-slate-900"}`}>
                    {step.label}
                  </h4>
                  {isActive ? <span className="inline-flex h-1.5 w-1.5 animate-ping rounded-full bg-blue-600" /> : null}
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{step.description}</p>
              </div>

              <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-blue-600" : isDone ? "text-emerald-500" : "text-slate-300"}`} />
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5 font-mono text-[10px] font-bold text-slate-400">
        <span>PROCESSING</span>
        <span>DO NOT CLOSE THIS TAB</span>
      </div>
    </div>
  );
}
