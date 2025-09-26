"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navigation/navbar";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { ProductFilters } from "@/components/products/product-filters";
import { productsApi } from "@/lib/api";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/contexts/auth-context";

interface Product {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  images?: string[];
  mrp: number;
  sellingPrice: number;
  category: string;
  description: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  // Load all categories
  useEffect(() => {
    (async () => {
      try {
        const resp = await productsApi.list({
          page: 1,
          limit: 100,
          sort: "newest",
        });
        const unique = [
          ...new Set(
            resp.items.map((p: Product) => p.category).filter(Boolean)
          ),
        ];
        setCategories(unique);
      } catch (e) {
        console.error("Failed to load categories:", e);
      }
    })();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await productsApi.list({
        page: currentPage,
        limit: 100,
        sort: sortBy,
      });

      let filtered = response.items;

      // search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (p: Product) =>
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
        );
      }

      // category filter
      if (selectedCategory) {
        filtered = filtered.filter(
          (p: Product) => p.category === selectedCategory
        );
      }

      setProducts(filtered);
      setTotalPages(Math.ceil(filtered.length / 12));
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, selectedCategory, sortBy, searchQuery]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100">
      <Navbar />

      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-serif font-bold gradient-text-pink mb-4">
              Our Collection
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover premium beauty products carefully curated for the modern
              woman
            </p>
          </div>

          {/* Filters */}
          <div className="mb-8">
            <ProductFilters
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              sortBy={sortBy}
              onSortChange={(s) => {
                setSortBy(s);
                setCurrentPage(1);
              }}
              searchQuery={searchQuery}
              onSearchChange={(q) => {
                setSearchQuery(q);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Products */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(6)].map((_, i) => (
                <GlassCard key={i} className="p-6 animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-lg mb-4" />
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-4" />
                  <div className="h-8 bg-gray-200 rounded" />
                </GlassCard>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No products found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
{products.map((product) => {
  const discount = product.mrp > product.sellingPrice
    ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)
    : 0;

  return (
    <GlassCard key={product._id} className="overflow-hidden">
      <div className="relative">
        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold shadow-lg z-10">
            {discount}% OFF
          </div>
        )}

        <div className="aspect-square bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
          {product.images?.[0] || product.image ? (
            <img
              src={product.images?.[0] || product.image || "/placeholder.svg"}
              alt={product.name}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-500">No Image</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        <span className="text-xs text-purple-600 font-semibold uppercase tracking-wide">
          {product.category}
        </span>
        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between mb-4">
          <span className="text-xl font-bold text-gray-800">
            ₹{product.sellingPrice}
          </span>
          {product.mrp > product.sellingPrice && (
            <span className="text-sm text-gray-500 line-through">
              ₹{product.mrp}
            </span>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-2">
          <Link href={`/products/${product.slug}`} className="flex-1">
            <GradientButton variant="secondary" className="w-full text-xs sm:text-sm py-2">
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
    </GlassCard>
  );
})}

              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-12">
                  <div className="flex space-x-2">
                    <button
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-white/20 border border-white/30 rounded-lg disabled:opacity-50 hover:bg-white/30 transition-all duration-300"
                    >
                      Previous
                    </button>

                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                          currentPage === i + 1
                            ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                            : "bg-white/20 border border-white/30 hover:bg-white/30"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-white/20 border border-white/30 rounded-lg disabled:opacity-50 hover:bg-white/30 transition-all duration-300"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
