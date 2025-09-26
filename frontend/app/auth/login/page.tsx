"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { GlassCard } from "@/components/ui/glass-card"
import { FloatingInput } from "@/components/ui/floating-input"
import { GradientButton } from "@/components/ui/gradient-button"
import { useAuth } from "@/contexts/auth-context"

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading, error, clearError } = useAuth()
  const [phone, setPhone] = useState("")
  const [validationError, setValidationError] = useState("")

  // Validate 10-digit phone numbers
  const validatePhone = (phone: string) => {
    const phoneRegex = /^\d{10}$/
    return phoneRegex.test(phone)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setValidationError("")

    if (!validatePhone(phone)) {
      setValidationError("Please enter a valid 10-digit phone number")
      return
    }

    try {
      // login from auth-context now sets cookies internally
      await login(phone)
      router.push("/") // redirect after successful login
    } catch (err) {
      // errors are handled by the auth context
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-purple-400/20 rounded-full blur-3xl float" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-indigo-400/20 rounded-full blur-3xl float-delay" />
      </div>

      <div className="relative w-full max-w-md">
        <GlassCard className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif font-bold gradient-text-pink mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <FloatingInput
              id="phone"
              label="Phone Number"
              type="tel"
              value={phone}
              onChange={setPhone}
              error={validationError}
              required
            />

            {error && (
              <div className="p-3 bg-red-100/50 border border-red-200 rounded-lg text-red-700 text-sm animate-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <GradientButton type="submit" size="lg" loading={isLoading} className="w-full">
              Sign In
            </GradientButton>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link href="/auth/signup" className="text-pink-600 hover:text-pink-700 font-semibold transition-colors">
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">By signing in, you agree to our Terms of Service and Privacy Policy</p>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
