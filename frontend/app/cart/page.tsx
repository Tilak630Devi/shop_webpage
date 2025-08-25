"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navigation/navbar"
import { GlassCard } from "@/components/ui/glass-card"
import { GradientButton } from "@/components/ui/gradient-button"
import { CartItem } from "@/components/cart/cart-item"
import { AuthGuard } from "@/components/auth-guard"
import { useCart } from "@/hooks/use-cart"

export default function CartPage() {
  const router = useRouter()
  const { items, totals, isLoading, checkout } = useCart()
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const handleCheckout = async () => {
    try {
      setIsCheckingOut(true)
      const response = await checkout()
      // Redirect to WhatsApp
      window.open(response.link, "_blank")
      // Optionally redirect to a confirmation page
      router.push("/checkout/confirmation")
    } catch (error) {
      console.error("Checkout failed:", error)
    } finally {
      setIsCheckingOut(false)
    }
  }

  const savings = totals.mrpTotal - totals.subtotal

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100">
        <Navbar />

        <main className="pt-24 pb-12">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-serif font-bold gradient-text-pink mb-4">Shopping Cart</h1>
              <p className="text-gray-600">
                {items.length === 0
                  ? "Your cart is empty"
                  : `${items.length} item${items.length > 1 ? "s" : ""} in your cart`}
              </p>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <GlassCard key={i} className="p-6 animate-pulse">
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 bg-gray-200 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-32 h-32 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-8">
                  <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9m-9 0V19a2 2 0 002 2h7a2 2 0 002-2v-4"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-serif font-bold text-gray-800 mb-4">Your cart is empty</h2>
                <p className="text-gray-600 mb-8">Discover our amazing products and add them to your cart</p>
                <GradientButton onClick={() => router.push("/products")} size="lg">
                  Continue Shopping
                </GradientButton>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                  {items.map((item) => (
                    <CartItem key={item.productId} item={item} />
                  ))}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <div className="sticky top-24">
                    <GlassCard className="p-6">
                      <h3 className="text-xl font-serif font-bold text-gray-800 mb-6">Order Summary</h3>

                      <div className="space-y-4 mb-6">
                        <div className="flex justify-between text-gray-600">
                          <span>Subtotal ({items.reduce((sum, item) => sum + item.qty, 0)} items)</span>
                          <span>₹{totals.subtotal}</span>
                        </div>

                        {savings > 0 && (
                          <div className="flex justify-between text-green-600 font-medium">
                            <span>You Save</span>
                            <span>-₹{savings}</span>
                          </div>
                        )}

                        <div className="flex justify-between text-gray-600">
                          <span>Shipping</span>
                          <span className="text-green-600 font-medium">FREE</span>
                        </div>

                        <div className="border-t border-white/30 pt-4">
                          <div className="flex justify-between text-xl font-bold text-gray-800">
                            <span>Total</span>
                            <span className="gradient-text-pink">₹{totals.subtotal}</span>
                          </div>
                        </div>
                      </div>

                      {/* Checkout Button */}
                      <GradientButton
                        onClick={handleCheckout}
                        loading={isCheckingOut}
                        className="w-full py-4 text-lg neon-pink"
                      >
                        Proceed to Checkout
                      </GradientButton>

                      <div className="mt-4 text-center">
                        <button
                          onClick={() => router.push("/products")}
                          className="text-pink-600 hover:text-pink-700 font-medium transition-colors"
                        >
                          Continue Shopping
                        </button>
                      </div>

                      {/* Security Badge */}
                      <div className="mt-6 p-4 bg-green-50/50 rounded-lg border border-green-200/50">
                        <div className="flex items-center space-x-2 text-green-700">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                            />
                          </svg>
                          <span className="text-sm font-medium">Secure Checkout via WhatsApp</span>
                        </div>
                      </div>
                    </GlassCard>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
