"use client"

import { useState } from "react"
import Link from "next/link"
import { GlassCard } from "@/components/ui/glass-card"
import { QuantityControl } from "@/components/ui/quantity-control"
import { useCart } from "@/hooks/use-cart"

interface CartItemProps {
  item: {
    productId: string
    name: string
    qty: number
    price: number
    mrp: number
    slug: string 
  }
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart()
  const [isUpdating, setIsUpdating] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  const handleQuantityChange = async (newQty: number) => {
    try {
      setIsUpdating(true)
      await updateQuantity(item.productId, newQty)
    } catch (error) {
      console.error("Failed to update quantity:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRemove = async () => {
    try {
      setIsRemoving(true)
      await removeItem(item.productId)
    } catch (error) {
      console.error("Failed to remove item:", error)
      setIsRemoving(false)
    }
  }

  const savings = (item.mrp - item.price) * item.qty

  return (
    <GlassCard className={`p-6 hover-lift transition-all duration-300 ${isRemoving ? "opacity-50 scale-95" : ""}`}>
      <div className="flex items-center space-x-4">
        {/* Product Image */}
        <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <img
            src={`/abstract-geometric-shapes.png?height=80&width=80&query=${encodeURIComponent(item.name)}`}
            alt={item.name}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <Link
            href={`/products/${item.slug}`}
            className="text-lg font-semibold text-gray-800 hover:text-pink-600 transition-colors line-clamp-1"
          >
            {item.name}
          </Link>

          <div className="flex items-center space-x-2 mt-1">
            <span className="text-xl font-bold text-gray-800">₹{item.price}</span>
            {item.mrp > item.price && <span className="text-sm text-gray-500 line-through">₹{item.mrp}</span>}
          </div>

          {savings > 0 && <div className="text-sm text-green-600 font-medium mt-1">You save ₹{savings}</div>}
        </div>

        {/* Quantity Control */}
        <div className="flex flex-col items-center space-y-2">
          <QuantityControl value={item.qty} onChange={handleQuantityChange} disabled={isUpdating} />
          <span className="text-sm text-gray-600">Qty</span>
        </div>

        {/* Total Price */}
        <div className="text-right min-w-0">
          <div className="text-xl font-bold text-gray-800">₹{item.price * item.qty}</div>
          {item.mrp > item.price && <div className="text-sm text-gray-500 line-through">₹{item.mrp * item.qty}</div>}
        </div>

        {/* Remove Button */}
        <button
          onClick={handleRemove}
          disabled={isRemoving}
          className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </GlassCard>
  )
}
