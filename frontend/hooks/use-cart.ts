"use client"

import { useState, useEffect } from "react"
import { cartApi, ApiError } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"

interface CartItem {
  productId: string
  name: string
  qty: number
  price: number
  mrp: number
  slug: string
}

interface CartTotals {
  subtotal: number
  mrpTotal: number
}

export function useCart() {
  const { isAuthenticated } = useAuth()
  const [items, setItems] = useState<CartItem[]>([])
  const [totals, setTotals] = useState<CartTotals>({ subtotal: 0, mrpTotal: 0 })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCart = async () => {
    if (!isAuthenticated) return

    try {
      setIsLoading(true)
      setError(null)
      const response = await cartApi.get()
      setItems(response.items)
      setTotals(response.totals)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError("Failed to load cart")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const addToCart = async (productId: string, qty = 1) => {
    try {
      setError(null)
      await cartApi.add({ productId, qty })
      await fetchCart() // Refresh cart
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError("Failed to add item to cart")
      }
      throw err
    }
  }

  const updateQuantity = async (productId: string, qty: number) => {
    try {
      setError(null)
      await cartApi.updateItem(productId, { qty })
      await fetchCart() // Refresh cart
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError("Failed to update item")
      }
      throw err
    }
  }

  const removeItem = async (productId: string) => {
    try {
      setError(null)
      await cartApi.removeItem(productId)
      await fetchCart() // Refresh cart
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError("Failed to remove item")
      }
      throw err
    }
  }

  const checkout = async () => {
    try {
      setError(null)
      const response = await cartApi.checkout()
      return response
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError("Checkout failed")
      }
      throw err
    }
  }

  useEffect(() => {
    fetchCart()
  }, [isAuthenticated])

  return {
    items,
    totals,
    isLoading,
    error,
    addToCart,
    updateQuantity,
    removeItem,
    checkout,
    refreshCart: fetchCart,
    itemCount: items.reduce((sum, item) => sum + item.qty, 0),
  }
}
