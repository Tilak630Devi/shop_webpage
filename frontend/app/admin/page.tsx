"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminGuard } from "@/components/admin/admin-guard"

export default function AdminDashboard() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/admin/products")
  }, [router])

  return (
    <AdminGuard>
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Redirecting to products...</p>
      </div>
    </AdminGuard>
  )
}
