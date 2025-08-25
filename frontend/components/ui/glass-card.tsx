import type React from "react"
import { cn } from "@/lib/utils"

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  variant?: "default" | "dark"
}

export function GlassCard({ children, className, variant = "default" }: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/20 shadow-xl",
        variant === "default" ? "glass" : "glass-dark",
        className,
      )}
    >
      {children}
    </div>
  )
}
