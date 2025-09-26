"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { QuantityControl } from "@/components/ui/quantity-control";
import { useCart } from "@/hooks/use-cart";

interface CartItemProps {
  item: {
    productId: string;
    name: string;
    qty: number;
    price: number;
    mrp: number;
    slug: string;
  };
  // Optional callback to trigger page refresh
  onQtyUpdated?: () => void;
}

export function CartItem({ item, onQtyUpdated }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();
  const [quantity, setQuantity] = useState(item.qty);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

const handleQuantityChange = async (newQty: number) => {
  if (newQty === quantity) return;
  const prevQty = quantity;
  setQuantity(newQty);
  setIsUpdating(true);

  try {
    await updateQuantity(item.productId, newQty);
    // Force page reload to refresh totals
    window.location.reload();
  } catch (error) {
    console.error(error);
    setQuantity(prevQty);
  } finally {
    setIsUpdating(false);
  }
};


const handleRemove = async () => {
  try {
    setIsRemoving(true);
    await removeItem(item.productId);
    window.location.reload(); // refresh the page after removal
  } catch (error) {
    console.error(error);
    setIsRemoving(false);
  }
};


  useEffect(() => {
    setQuantity(item.qty);
  }, [item.qty]);

  const savings = (item.mrp - item.price) * quantity;

  return (
    <GlassCard
      className={`p-4 hover-lift transition-all duration-300 ${
        isRemoving ? "opacity-50 scale-95" : ""
      } ${isUpdating ? "ring-2 ring-pink-200 ring-opacity-50" : ""}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <Link
            href={`/products/${item.slug}`}
            className="text-base font-semibold text-gray-800 hover:text-pink-600 line-clamp-1"
          >
            {item.name}
          </Link>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-lg font-bold text-gray-800">₹{item.price}</span>
            {item.mrp > item.price && (
              <span className="text-sm text-gray-500 line-through">₹{item.mrp}</span>
            )}
          </div>
          {savings > 0 && <div className="text-sm text-green-600 mt-1">You save ₹{savings}</div>}
        </div>

        {/* Quantity + Total + Remove */}
        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
          <div className="flex flex-col items-center space-y-1">
            <QuantityControl
              value={quantity}
              onChange={handleQuantityChange}
              disabled={isUpdating}
            />
            <span className="text-xs text-gray-600">Qty</span>
          </div>

          <div className="text-right">
            <div className="text-base font-bold text-gray-800">₹{item.price * quantity}</div>
            {item.mrp > item.price && (
              <div className="text-xs text-gray-500 line-through">₹{item.mrp * quantity}</div>
            )}
          </div>

          <button
            onClick={handleRemove}
            disabled={isRemoving}
            className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-50 transition-colors"
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
      </div>
    </GlassCard>
  );
}
