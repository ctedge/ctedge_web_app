import * as React from "react";
import { cn } from "@/lib/utils";

const palette: Record<string, string> = {
  default: "bg-teal-100 text-teal-900",
  secondary: "bg-slate-100 text-slate-800",
  success: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-900",
  danger: "bg-red-100 text-red-800",
  outline: "border border-slate-300 text-slate-700",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: keyof typeof palette }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        palette[variant],
        className
      )}
      {...props}
    />
  );
}
