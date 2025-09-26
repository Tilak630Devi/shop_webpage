"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/navigation/navbar";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { BuyNowButton } from "@/components/ui/buy-now-button";
import { ImageCarousel } from "@/components/ui/image-carousel";
import { StarRating } from "@/components/ui/star-rating";
import { FloatingInput } from "@/components/ui/floating-input";
import { productsApi, commentsApi } from "@/lib/api";
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
  stock: number;
}

interface Comment {
  _id: string;
  userPhone: string;
  text: string;
  rating?: number;
  createdAt: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [productResponse, commentsResponse] = await Promise.all([
          productsApi.getBySlug(slug),
          commentsApi.list(slug, { limit: 10 }),
        ]);
        setProduct(productResponse);
        setComments(commentsResponse.items);
      } catch (error) {
        console.error("Failed to fetch product data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) fetchData();
  }, [slug]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      window.location.href = "/auth/login";
      return;
    }
    if (!product) return;
    try {
      await addToCart(product._id, quantity);
    } catch (error) {
      console.error("Failed to add to cart:", error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !newComment.trim()) return;
    try {
      setIsSubmittingComment(true);
      const comment = await commentsApi.create(slug, {
        text: newComment.trim(),
        rating: newRating,
      });
      setComments([comment, ...comments]);
      setNewComment("");
      setNewRating(5);
    } catch (error) {
      console.error("Failed to submit comment:", error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100">
        <Navbar />
        <main className="pt-24 pb-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="aspect-square bg-gray-200 rounded-2xl animate-pulse" />
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
                <div className="h-20 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100">
        <Navbar />
        <main className="pt-24 pb-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Product not found</h1>
            <p className="text-gray-600">The product you're looking for doesn't exist.</p>
          </div>
        </main>
      </div>
    );
  }

  const averageRating =
    comments.length > 0
      ? comments.reduce((sum, comment) => sum + (comment.rating || 0), 0) / comments.length
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100">
      <Navbar />

      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Product Images */}
        <div className="w-full h-full">
          <ImageCarousel
            images={product.images?.length ? product.images : product.image ? [product.image] : []}
            alt={product.name}
            className="w-full h-full object-contain !scale-100 !hover:scale-100 !transition-none"
          />
        </div>


            {/* Product Info */}
            <div>
              <GlassCard className="p-8 h-fit">
                <div className="mb-4">
                  <span className="text-sm text-purple-600 font-semibold uppercase tracking-wide">
                    {product.category}
                  </span>
                </div>

                <h1 className="text-3xl font-serif font-bold text-gray-800 mb-4">{product.name}</h1>

                <div className="flex flex-wrap items-center space-x-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <span className="text-3xl font-bold text-gray-800">₹{product.sellingPrice}</span>
                    {product.mrp > product.sellingPrice && (
                      <span className="text-lg text-gray-500 line-through">₹{product.mrp}</span>
                    )}
                  </div>
                  {product.mrp > product.sellingPrice && (
                    <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold neon-pink">
                      {Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)}% OFF
                    </span>
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center space-x-2 mb-6">
                  <StarRating rating={averageRating} />
                  <span className="text-sm text-gray-600">({comments.length} reviews)</span>
                </div>

                <p className="text-gray-600 mb-8 leading-relaxed">{product.description}</p>

                {/* Stock Status */}
                <div className="mb-6">
                  {product.stock > 0 ? (
                    <span className="text-green-600 font-medium">✓ In Stock ({product.stock} available)</span>
                  ) : (
                    <span className="text-red-600 font-medium">✗ Out of Stock</span>
                  )}
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center space-x-4 mb-8">
                  <span className="font-medium text-gray-700">Quantity:</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 bg-white/50 border border-white/30 rounded-lg flex items-center justify-center hover:bg-white/70 transition-all duration-300"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                      className="w-10 h-10 bg-white/50 border border-white/30 rounded-lg flex items-center justify-center hover:bg-white/70 transition-all duration-300 disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col md:flex-row gap-4">
                  <GradientButton
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="w-full md:w-auto py-4 text-lg"
                  >
                    Add to Cart
                  </GradientButton>
                  <BuyNowButton productId={product._id} quantity={quantity} className="w-full md:w-auto py-4 text-lg">
                    Buy Now
                  </BuyNowButton>
                </div>
              </GlassCard>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Add Review */}
            {isAuthenticated && (
              <GlassCard className="p-8">
                <h3 className="text-2xl font-serif font-bold text-gray-800 mb-6">Write a Review</h3>
                <form onSubmit={handleSubmitComment} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                    <StarRating rating={newRating} interactive onChange={setNewRating} size="lg" />
                  </div>

                  <FloatingInput
                    id="comment"
                    label="Your Review"
                    value={newComment}
                    onChange={setNewComment}
                    required
                  />

                  <GradientButton
                    type="submit"
                    loading={isSubmittingComment}
                    disabled={!newComment.trim()}
                    className="w-full"
                  >
                    Submit Review
                  </GradientButton>
                </form>
              </GlassCard>
            )}

            {/* Reviews List */}
            <div>
              <h3 className="text-2xl font-serif font-bold text-gray-800 mb-6">Customer Reviews</h3>
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <GlassCard className="p-6 text-center">
                    <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
                  </GlassCard>
                ) : (
                  comments.map((comment, index) => (
                    <GlassCard
                      key={comment._id}
                      className="p-6 animate-in slide-in-from-bottom-2"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-medium text-gray-800">
                            {comment.userPhone.replace(/(\d{3})\d{4}(\d{3})/, "$1****$2")}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        {comment.rating && <StarRating rating={comment.rating} size="sm" />}
                      </div>
                      <p className="text-gray-700 leading-relaxed">{comment.text}</p>
                    </GlassCard>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
