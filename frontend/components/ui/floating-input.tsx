"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface FloatingInputProps {
  id: string
  label: string
  type?: string
  value: string
  onChange: (value: string) => void
}

export function FloatingInput({
  id,
  label,
  type = "text",
  value,
  onChange,
}: FloatingInputProps) {
  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)} // ✅ always return string
        className={cn(
          "peer w-full px-3 pt-5 pb-2 border rounded-lg bg-white/50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-400/50"
        )}
        placeholder=" "
      />
      <label
        htmlFor={id}
        className="absolute left-3 top-2 text-gray-500 text-sm peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm peer-focus:text-pink-600 transition-all"
      >
        {label}
      </label>
    </div>
  )
}
