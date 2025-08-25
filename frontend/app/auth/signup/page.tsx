"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { GlassCard } from "@/components/ui/glass-card"
import { FloatingInput } from "@/components/ui/floating-input"
import { GradientButton } from "@/components/ui/gradient-button"
import { useAuth } from "@/contexts/auth-context"

export default function SignupPage() {
  const router = useRouter()
  const { signup, isLoading, error, clearError } = useAuth()
  const [formData, setFormData] = useState({
    phone: "",
    name: "",
    address: {
      label: "Primary",
      line1: "",
      city: "",
      state: "",
      pincode: "",
    },
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const errors: Record<string, string> = {}

    // Phone validation
    if (!/^\d{10}$/.test(formData.phone)) {
      errors.phone = "Please enter a valid 10-digit phone number"
    }

    // Name validation
    if (formData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters"
    }

    // Address validation
    if (formData.address.line1.trim().length < 3) {
      errors.line1 = "Address must be at least 3 characters"
    }
    if (formData.address.city.trim().length < 2) {
      errors.city = "City must be at least 2 characters"
    }
    if (formData.address.state.trim().length < 2) {
      errors.state = "State must be at least 2 characters"
    }
    if (formData.address.pincode.trim().length < 4) {
      errors.pincode = "Pincode must be at least 4 characters"
    }

    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    const errors = validateForm()
    setValidationErrors(errors)

    if (Object.keys(errors).length > 0) {
      return
    }

    try {
      await signup(formData)
      router.push("/")
    } catch (err) {
      // Error is handled by the auth context
    }
  }

  const updateFormData = (field: string, value: string) => {
    if (field.startsWith("address.")) {
      const addressField = field.split(".")[1]
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-purple-400/20 rounded-full blur-3xl float" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-indigo-400/20 rounded-full blur-3xl float-delay" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-br from-indigo-400/10 to-pink-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg">
        <GlassCard className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif font-bold gradient-text-pink mb-2">Join Glamour Shop</h1>
            <p className="text-gray-600">Create your account to start shopping</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FloatingInput
                id="phone"
                label="Phone Number"
                type="tel"
                value={formData.phone}
                onChange={(value) => updateFormData("phone", value)}
                error={validationErrors.phone}
                required
                className="md:col-span-2"
              />

              <FloatingInput
                id="name"
                label="Full Name"
                value={formData.name}
                onChange={(value) => updateFormData("name", value)}
                error={validationErrors.name}
                required
                className="md:col-span-2"
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 border-b border-gray-200 pb-2">Delivery Address</h3>

              <FloatingInput
                id="line1"
                label="Address Line 1"
                value={formData.address.line1}
                onChange={(value) => updateFormData("address.line1", value)}
                error={validationErrors.line1}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FloatingInput
                  id="city"
                  label="City"
                  value={formData.address.city}
                  onChange={(value) => updateFormData("address.city", value)}
                  error={validationErrors.city}
                  required
                />

                <FloatingInput
                  id="state"
                  label="State"
                  value={formData.address.state}
                  onChange={(value) => updateFormData("address.state", value)}
                  error={validationErrors.state}
                  required
                />
              </div>

              <FloatingInput
                id="pincode"
                label="Pincode"
                value={formData.address.pincode}
                onChange={(value) => updateFormData("address.pincode", value)}
                error={validationErrors.pincode}
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-100/50 border border-red-200 rounded-lg text-red-700 text-sm animate-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <GradientButton type="submit" size="lg" loading={isLoading} className="w-full">
              Create Account
            </GradientButton>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-pink-600 hover:text-pink-700 font-semibold transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
