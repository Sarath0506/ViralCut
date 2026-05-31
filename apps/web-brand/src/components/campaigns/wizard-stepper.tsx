import { cn } from "@/lib/utils";

const steps = [
  { path: "/campaigns/new", label: "Basics" },
  { path: "/campaigns/new/brief", label: "Brief & rules" },
  { path: "/campaigns/new/payout", label: "Payout & budget" },
  { path: "/campaigns/new/review", label: "Review" },
];

export function WizardStepper({ currentPath }: { currentPath: string }) {
  const currentIndex = steps.findIndex((s) => s.path === currentPath);

  return (
    <ol className="mb-8 flex flex-wrap gap-2" aria-label="Campaign steps">
      {steps.map((step, i) => (
        <li
          key={step.path}
          className={cn(
            "rounded-full px-4 py-1.5 text-xs font-bold",
            i <= currentIndex
              ? "bg-primary text-primary-foreground"
              : "bg-surface-variant text-muted",
          )}
        >
          {i + 1}. {step.label}
        </li>
      ))}
    </ol>
  );
}
