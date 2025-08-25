"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { AdminGuard } from "@/components/admin/admin-guard"
import { AdminNavbar } from "@/components/admin/admin-navbar"
import { GlassCard } from "@/components/ui/glass-card"
import { adminApi } from "@/lib/api"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    visibleProducts: 0,
    totalComments: 0,
    recentProducts: [],
    categories: [] as string[],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("all")

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [allProducts, visibleProducts] = await Promise.all([
          adminApi.products.list({ limit: 1 }),
          adminApi.products.list({ limit: 10, visible: true }),
        ])

        // Extract categories
        const categories = Array.from(new Set(visibleProducts.items.map((p: any) => p.category))).filter(Boolean)

        setStats({
          totalProducts: allProducts.totalItems,
          visibleProducts: visibleProducts.totalItems,
          totalComments: 0, // Needs comments endpoint
          recentProducts: visibleProducts.items,
          categories,
        })
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  // Filter products by category
  const filteredProducts =
    selectedCategory === "all"
      ? stats.recentProducts
      : stats.recentProducts.filter((p: any) => p.category === selectedCategory)

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
        <AdminNavbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
          {/* Header */}
          <div className="mb-8 text-center sm:text-left">
            <h1 className="text-3xl font-serif font-bold gradient-text mb-2">Dashboard</h1>
            <p className="text-gray-600">Welcome to your admin dashboard</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <GlassCard className="p-6 hover-lift">
              <p className="text-sm text-gray-600 mb-1">Total Products</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalProducts}</p>
            </GlassCard>
            <GlassCard className="p-6 hover-lift">
              <p className="text-sm text-gray-600 mb-1">Visible Products</p>
              <p className="text-2xl font-bold text-gray-800">{stats.visibleProducts}</p>
            </GlassCard>
            <GlassCard className="p-6 hover-lift">
              <p className="text-sm text-gray-600 mb-1">Total Orders</p>
              <p className="text-2xl font-bold text-gray-800">0</p>
            </GlassCard>
            <GlassCard className="p-6 hover-lift">
              <p className="text-sm text-gray-600 mb-1">Revenue</p>
              <p className="text-2xl font-bold text-gray-800">₹0</p>
            </GlassCard>
          </div>

          {/* Recent Products + Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Products */}
            <GlassCard className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
                <h3 className="text-xl font-serif font-bold text-gray-800">Recent Products</h3>

                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm bg-white"
                >
                  <option value="all">All Categories</option>
                  {stats.categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {isLoading ? (
                <p className="text-gray-500">Loading...</p>
              ) : filteredProducts.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No products found</p>
              ) : (
                <div className="space-y-3">
                  {filteredProducts.map((product: any) => (
                    <div
                      key={product._id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 sm:space-x-3 p-3 bg-white/20 rounded-lg"
                    >
                      {/* Product Info */}
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center overflow-hidden">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <span className="text-gray-500 text-xs">No Img</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800 truncate">{product.name}</p>
                          <p className="text-sm text-gray-600">₹{product.sellingPrice}</p>
                          <p className="text-xs text-gray-500">{product.category}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <Link
                          href={`/products/${product.slug}`}
                          target="_blank"
                          className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          View
                        </Link>
                        <Link
                          href={`/admin/products/${product._id}/edit`}
                          className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
            <AdminNavbar />
          </div>
        </main>
      </div>
    </AdminGuard>
  )
}
