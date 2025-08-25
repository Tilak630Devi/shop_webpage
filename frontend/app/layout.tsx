import type React from "react"
import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { AdminProvider } from "@/contexts/admin-context"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
})

export const metadata: Metadata = {
  title: "AAVRA GENERAL - Premium Beauty & Cosmetics",
  description: "Discover premium beauty products and cosmetics designed for modern women",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} antialiased`}>
      <body className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100">
        <AdminProvider>
          <AuthProvider>{children}</AuthProvider>
        </AdminProvider>
      </body>
    </html>
  )
}
