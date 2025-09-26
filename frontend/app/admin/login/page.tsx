"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { GlassCard } from "@/components/ui/glass-card"
import { FloatingInput } from "@/components/ui/floating-input"
import { GradientButton } from "@/components/ui/gradient-button"
import { useAdmin } from "@/contexts/admin-context"

export default function AdminLoginPage() {
  const router = useRouter()
  const { login, isLoading, error, clearError } = useAdmin()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    if (!username.trim() || !password.trim()) return

    try {
      await login(username, password)
      router.push("/admin")
    } catch {
      // error handled by context
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      <div className="relative w-full max-w-md">
        <GlassCard className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-serif font-bold gradient-text mb-2">Admin Portal</h1>
            <p className="text-gray-600">Sign in to manage your store</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <FloatingInput id="username" label="Username" value={username} onChange={setUsername} required />
            <FloatingInput id="password" label="Password" type="password" value={password} onChange={setPassword} required />

            {error && (
              <div className="p-3 bg-red-100/50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <GradientButton type="submit" size="lg" loading={isLoading} className="w-full">
              Sign In
            </GradientButton>
          </form>
        </GlassCard>
      </div>
    </div>
  )
}
