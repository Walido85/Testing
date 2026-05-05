import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "glass"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-[var(--accent-color)] text-white hover:bg-[var(--accent-color)]/90",
    secondary: "bg-[var(--hover-bg)] text-[var(--text-color)] hover:bg-[var(--hover-bg)]/80",
    outline: "border border-[var(--border-color)] text-[var(--text-color)] hover:bg-[var(--hover-bg)]",
    glass: "bg-[var(--card-bg)]/10 text-white backdrop-blur-md border border-[var(--border-color)] shadow-sm",
  }
  return (
    <div 
      className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors", variants[variant], className)} 
      {...props} 
    />
  )
}

export { Badge }
