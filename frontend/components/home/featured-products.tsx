"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { GradientButton } from "@/components/ui/gradient-button";
import { productsApi } from "@/lib/api";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/contexts/auth-context";

interface Product {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  images?: string[];
  sellingPrice: number;
  mrp: number;
  category: string;
}

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productsApi.list({ limit: 12 }); // fetch more, we’ll sort
        const items = response.items || [];

        // Sort products by discount percentage (max → min)
        const sorted = [...items].sort((a, b) => {
          const discountA =
            a.mrp > a.sellingPrice
              ? ((a.mrp - a.sellingPrice) / a.mrp) * 100
              : 0;
          const discountB =
            b.mrp > b.sellingPrice
              ? ((b.mrp - b.sellingPrice) / b.mrp) * 100
              : 0;
          return discountB - discountA;
        });

        setProducts(sorted);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = async (productId: string) => {
    if (!isAuthenticated) {
      window.location.href = "/auth/login";
      return;
    }
    try {
      await addToCart(productId, 1);
    } catch (error) {
      console.error("Failed to add to cart:", error);
    }
  };

  return (
    <section className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-black transition-colors duration-500">
      {/* Decorative gradient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-72 h-72 bg-pink-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-300" />
      </div>

      <div className="container mx-auto relative z-10">
        {/* Section heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent drop-shadow-md mb-4">
            ✨ Featured Products ✨
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-xl sm:max-w-2xl mx-auto text-sm sm:text-base">
            Discover our best deals and discounts on beauty essentials
          </p>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
          {isLoading
            ? [...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="p-6 animate-pulse rounded-2xl bg-white/40 dark:bg-white/5 shadow-lg backdrop-blur-md border border-white/20"
                >
                  <div className="aspect-square bg-gray-200/40 dark:bg-gray-700/40 rounded-lg mb-4" />
                  <div className="h-4 bg-gray-200/40 dark:bg-gray-700/40 rounded mb-2" />
                  <div className="h-4 bg-gray-200/40 dark:bg-gray-700/40 rounded w-2/3" />
                </div>
              ))
            : products.map((product) => {
                const discount =
                  product.mrp > product.sellingPrice
                    ? Math.round(
                        ((product.mrp - product.sellingPrice) / product.mrp) *
                          100
                      )
                    : 0;

                return (
                  <div
                    key={product._id}
                    className="group overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-800 hover:shadow-pink-200/50 dark:hover:shadow-pink-500/20 transition-all duration-300"
                  >
                    {/* Product Image */}
                    <div className="relative">
                      <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                        {(product.images && product.images.length > 0) ||
                        product.image ? (
                          <img
                            src={
                              product.images?.[0] ||
                              product.image ||
                              "/placeholder.svg"
                            }
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                            No Image
                          </div>
                        )}
                      </div>

                      {discount > 0 && (
                        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold shadow-lg">
                          {discount}% OFF
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4 sm:p-6">
                      <div className="mb-1 sm:mb-2">
                        <span className="text-[10px] sm:text-xs text-pink-500 dark:text-pink-400 font-semibold uppercase tracking-wide">
                          {product.category}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2 line-clamp-2">
                        {product.name}
                      </h3>

                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                            ₹{product.sellingPrice}
                          </span>
                          {product.mrp > product.sellingPrice && (
                            <span className="text-xs sm:text-sm text-gray-500 line-through">
                              ₹{product.mrp}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <Link href={`/products/${product.slug}`} className="flex-1">
                          <GradientButton
                            variant="secondary"
                            className="w-full text-xs sm:text-sm py-2"
                          >
                            View Details
                          </GradientButton>
                        </Link>
                        <GradientButton
                          onClick={() => handleAddToCart(product._id)}
                          className="w-full sm:w-auto px-3 sm:px-4 text-xs sm:text-sm py-2"
                        >
                          Add to Cart
                        </GradientButton>
                      </div>
                    </div>
                  </div>
                );
              })}
        </div>

        {/* CTA */}
        <div className="text-center mt-10 sm:mt-12">
          <Link href="/products">
            <GradientButton size="lg" className="px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base">
              View All Products
            </GradientButton>
          </Link>
        </div>
      </div>
    </section>
  );
}
