"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface QuantityControlProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  disabled?: boolean
  className?: string
}

export function QuantityControl({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
  className,
}: QuantityControlProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  const handleChange = (newValue: number) => {
    if (newValue >= min && newValue <= max && !disabled) {
      setIsAnimating(true)
      onChange(newValue)
      setTimeout(() => setIsAnimating(false), 200)
    }
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <button
        onClick={() => handleChange(value - 1)}
        disabled={disabled || value <= min}
        className="w-10 h-10 bg-white/50 border border-white/30 rounded-lg flex items-center justify-center hover:bg-white/70 hover:scale-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </button>

      <div
        className={cn(
          "w-16 h-10 bg-white/30 border border-white/30 rounded-lg flex items-center justify-center font-semibold text-gray-800 transition-all duration-200",
          isAnimating && "scale-110 bg-gradient-to-r from-pink-100 to-purple-100",
        )}
      >
        {value}
      </div>

      <button
        onClick={() => handleChange(value + 1)}
        disabled={disabled || value >= max}
        className="w-10 h-10 bg-white/50 border border-white/30 rounded-lg flex items-center justify-center hover:bg-white/70 hover:scale-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
    </div>
  )
}
