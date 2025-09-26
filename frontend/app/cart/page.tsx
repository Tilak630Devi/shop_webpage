"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navigation/navbar";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { CartItem } from "@/components/cart/cart-item";
import { AuthGuard } from "@/components/auth-guard";
import { useCart } from "@/hooks/use-cart";

export default function CartPage() {
  const router = useRouter();
  const { items, totals, isLoading, checkout, updateItemQuantity } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    try {
      setIsCheckingOut(true);
      const response = await checkout();
      window.open(response.link, "_blank");
      router.push("/checkout/confirmation");
    } catch (error) {
      console.error("Checkout failed:", error);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const savings = totals.mrpTotal - totals.subtotal;
  const shippingFee = totals.subtotal >= 699 ? 0 : 99;
  const totalWithShipping = totals.subtotal + shippingFee;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100">
        <Navbar />

        <main className="pt-20 sm:pt-24 pb-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold gradient-text-pink mb-3 sm:mb-4">
                Shopping Cart
              </h1>
              <p className="text-gray-600 text-sm sm:text-base mb-2">
                {items.length === 0
                  ? "Your cart is empty"
                  : `${items.length} item${items.length > 1 ? "s" : ""} in your cart`}
              </p>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <GlassCard key={i} className="p-4 sm:p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </GlassCard>
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <p>Your cart is empty</p>
                <GradientButton onClick={() => router.push("/products")}>
                  Continue Shopping
                </GradientButton>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                  {items.map((item) => (
                    <CartItem
                      key={item.productId}
                      item={item}
                      onQtyChange={(newQty) =>
                        updateItemQuantity(item.productId, newQty)
                      }
                    />
                  ))}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <div className="lg:sticky lg:top-24">
                    <GlassCard className="p-4 sm:p-6">
                      <h3 className="text-lg sm:text-xl font-serif font-bold text-gray-800 mb-4 sm:mb-6">
                        Order Summary
                      </h3>

                      <div className="space-y-3 sm:space-y-4 mb-6">
                        <div className="flex justify-between text-gray-600 text-sm sm:text-base">
                          <span>
                            Subtotal ({items.reduce((sum, i) => sum + i.qty, 0)} items)
                          </span>
                          <span>₹{totals.subtotal}</span>
                        </div>

                        {savings > 0 && (
                          <div className="flex justify-between text-green-600 font-medium text-sm sm:text-base">
                            <span>You Save</span>
                            <span>-₹{savings}</span>
                          </div>
                        )}

                        <div className="flex justify-between text-gray-600 text-sm sm:text-base">
                          <span>Shipping (Free on orders &gt; 699₹)</span>
                          {shippingFee === 0 ? (
                            <span className="text-green-600 font-medium">FREE</span>
                          ) : (
                            <span>₹{shippingFee}</span>
                          )}
                        </div>

                        <div className="border-t border-white/30 pt-3 sm:pt-4">
                          <div className="flex justify-between text-lg sm:text-xl font-bold text-gray-800">
                            <span>Total</span>
                            <span className="gradient-text-pink">
                              ₹{totalWithShipping}
                            </span>
                          </div>
                        </div>
                      </div>

                      <GradientButton
                        onClick={handleCheckout}
                        loading={isCheckingOut}
                        className="w-full py-3 sm:py-4 text-sm sm:text-lg neon-pink"
                      >
                        Proceed to Checkout
                      </GradientButton>

                      <div className="mt-4 text-center">
                        <button
                          onClick={() => router.push("/products")}
                          className="text-pink-600 hover:text-pink-700 font-medium text-sm sm:text-base transition-colors"
                        >
                          Continue Shopping
                        </button>
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
  );
}
