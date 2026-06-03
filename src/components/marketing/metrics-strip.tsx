export const COMPANY_METRICS = [
  { stat: "20+", label: "Years of combined experience" },
  { stat: "130+", label: "Families sold to" },
  { stat: "6+", label: "Estates owned" },
  { stat: "20%", label: "Average yearly ROI" },
] as const;

type Variant = "light" | "dark" | "muted";

const variantClasses: Record<Variant, { container: string; stat: string; label: string }> = {
  light: {
    container: "bg-white",
    stat: "text-[#011F54]",
    label: "text-slate-600",
  },
  dark: {
    container: "",
    stat: "text-white",
    label: "text-teal-100",
  },
  muted: {
    container: "bg-slate-50",
    stat: "text-[#011F54]",
    label: "text-slate-600",
  },
};

export function MetricsStrip({
  variant = "light",
  className = "",
}: {
  variant?: Variant;
  className?: string;
}) {
  const v = variantClasses[variant];
  return (
    <div className={`${v.container} ${className}`}>
      <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        {COMPANY_METRICS.map((m, idx) => (
          <div
            key={m.label}
            className="animate-fade-in text-center sm:text-left"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className={`text-3xl font-bold md:text-4xl ${v.stat}`}>{m.stat}</div>
            <div className={`mt-1 text-sm ${v.label}`}>{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
