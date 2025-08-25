"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navigation/navbar"
import { GlassCard } from "@/components/ui/glass-card"
import { GradientButton } from "@/components/ui/gradient-button"
import { AuthGuard } from "@/components/auth-guard"

export default function CheckoutConfirmationPage() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push("/")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100">
        <Navbar />

        <main className="pt-24 pb-12">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              {/* Success Animation */}
              <div className="mb-8">
                <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                  <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              <GlassCard className="p-8">
                <h1 className="text-3xl md:text-4xl font-serif font-bold gradient-text-pink mb-4">
                  Order Initiated Successfully!
                </h1>

                <p className="text-gray-600 mb-8 leading-relaxed">
                  Your order has been initiated and you should have been redirected to WhatsApp to complete your
                  purchase. Our team will process your order once we receive your message.
                </p>

                <div className="space-y-6">
                  <div className="bg-blue-50/50 border border-blue-200/50 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-800 mb-2">What happens next?</h3>
                    <ul className="text-sm text-blue-700 space-y-1 text-left">
                      <li>• Complete your order via WhatsApp</li>
                      <li>• Our team will confirm your order details</li>
                      <li>• We'll process and ship your items</li>
                      <li>• Track your order via WhatsApp updates</li>
                    </ul>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <GradientButton onClick={() => router.push("/products")} size="lg">
                      Continue Shopping
                    </GradientButton>
                    <GradientButton variant="secondary" onClick={() => router.push("/")} size="lg">
                      Back to Home
                    </GradientButton>
                  </div>

                  <div className="text-sm text-gray-500">Redirecting to home in {countdown} seconds...</div>
                </div>
              </GlassCard>

              {/* Contact Support */}
              <div className="mt-8">
                <GlassCard className="p-6">
                  <h3 className="font-semibold text-gray-800 mb-2">Need Help?</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    If you didn't receive the WhatsApp redirect or have any questions, contact our support team.
                  </p>
                  <a
                    href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=Hi, I need help with my order`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-green-600 hover:text-green-700 font-medium transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                    </svg>
                    <span>Contact Support</span>
                  </a>
                </GlassCard>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
