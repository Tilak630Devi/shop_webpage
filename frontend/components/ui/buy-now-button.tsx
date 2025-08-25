"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { GradientButton } from "./gradient-button"
import { checkoutApi } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"

interface BuyNowButtonProps {
  productId: string
  quantity?: number
  className?: string
  children?: React.ReactNode
}

export function BuyNowButton({ productId, quantity = 1, className, children = "Buy Now" }: BuyNowButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      router.push("/auth/login")
      return
    }

    try {
      setIsLoading(true)
      const response = await checkoutApi.buyNow({ productId, qty: quantity })
      // Open WhatsApp in new tab
      window.open(response.link, "_blank")
      // Redirect to confirmation page
      router.push("/checkout/confirmation")
    } catch (error) {
      console.error("Buy now failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <GradientButton onClick={handleBuyNow} loading={isLoading} className={className}>
      {children}
    </GradientButton>
  )
}
