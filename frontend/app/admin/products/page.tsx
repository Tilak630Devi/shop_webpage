"use client";

import { useState, useEffect } from "react";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminNavbar } from "@/components/admin/admin-navbar";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { FloatingInput } from "@/components/ui/floating-input";
import { adminApi } from "@/lib/api";

interface Product {
  _id: string;
  name: string;
  slug: string;
  category: string;
  image: string;
  mrp: number;
  sellingPrice: number;
  stock: number;
  visible: boolean;
  description: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Omit<Product, "_id">>({
    name: "",
    slug: "",
    category: "",
    image: "",
    mrp: 0,
    sellingPrice: 0,
    stock: 0,
    visible: true,
    description: "",
  });

const fetchProducts = async () => {
  try {
    setIsLoading(true);

    const response = await adminApi.products.list({
      page: currentPage,
      limit: 100, // fetch more items so client-side filtering works
      category: selectedCategory || undefined,
    });

    // Start with items from API
    let filtered = response.items;

    // Apply search filter (name, description, category)
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p: Product) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    // Apply category filter (extra safety in case backend doesn't handle it)
    if (selectedCategory) {
      filtered = filtered.filter((p: Product) => p.category === selectedCategory);
    }

    // Handle pagination manually (since filtering happens client-side)
    const pageSize = 10;
    const startIndex = (currentPage - 1) * pageSize;
    const paginated = filtered.slice(startIndex, startIndex + pageSize);

    setProducts(paginated);
    setTotalPages(Math.ceil(filtered.length / pageSize));
  } catch (error) {
    console.error("Failed to fetch products:", error);
  } finally {
    setIsLoading(false);
  }
};

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchQuery, selectedCategory]);

  const handleToggleVisibility = async (product: Product) => {
    try {
      await adminApi.products.update(product._id, { visible: !product.visible });
      fetchProducts();
    } catch (error) {
      console.error("Failed to update product:", error);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await adminApi.products.delete(productId);
      fetchProducts();
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      slug: "",
      category: "",
      image: "",
      mrp: 0,
      sellingPrice: 0,
      stock: 0,
      visible: true,
      description: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({ ...product });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await adminApi.products.update(editingProduct._id, formData);
      } else {
        console.log(formData);
        await adminApi.products.create(formData);
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error("Failed to save product:", error);
    }
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
        <AdminNavbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-serif font-bold gradient-text mb-2">Products</h1>
              <p className="text-gray-600">Manage your product catalog</p>
            </div>
            <GradientButton onClick={openAddModal}>Add Product</GradientButton>
          </div>

          {/* Filters */}
          <GlassCard className="p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FloatingInput
                id="search"
                label="Search products..."
                value={searchQuery}
                onChange={setSearchQuery}
              />
              <FloatingInput
                id="category"
                label="Filter by category"
                value={selectedCategory}
                onChange={setSelectedCategory}
              />
            </div>
          </GlassCard>

          {/* Products Table */}
          <GlassCard className="overflow-hidden">
            {isLoading ? (
              <div className="p-6">Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-white/20">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Product</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Category</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Price</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Stock</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/20">
                    {products.map((product) => (
                      <tr key={product._id} className="hover:bg-white/10 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center overflow-hidden">
                              {product.image ? (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <span className="text-gray-500 text-xs">No Image</span>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{product.name}</p>
                              <p className="text-sm text-gray-600 line-clamp-1">{product.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 capitalize">{product.category}</td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <p className="font-medium text-gray-800">₹{product.sellingPrice}</p>
                            {product.mrp > product.sellingPrice && (
                              <p className="text-gray-500 line-through">₹{product.mrp}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{product.stock}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleVisibility(product)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                              product.visible
                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                : "bg-red-100 text-red-800 hover:bg-red-200"
                            }`}
                          >
                            {product.visible ? "Visible" : "Hidden"}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openEditModal(product)}
                              className="text-blue-600 hover:text-blue-700 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product._id)}
                              className="text-red-600 hover:text-red-700 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-white/20">
                <div className="flex justify-center flex-wrap gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-white/20 border border-white/30 rounded disabled:opacity-50 hover:bg-white/30 transition-colors"
                  >
                    Previous
                  </button>

                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1 rounded transition-colors ${
                        currentPage === i + 1
                          ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                          : "bg-white/20 border border-white/30 hover:bg-white/30"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-white/20 border border-white/30 rounded disabled:opacity-50 hover:bg-white/30 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </GlassCard>

          {/* Add/Edit Product Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 px-4">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">
                <h2 className="text-xl font-bold mb-4">
                  {editingProduct ? "Edit Product" : "Add Product"}
                </h2>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <FloatingInput id="name" label="Name" value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} />
                  <FloatingInput id="slug" label="Slug" value={formData.slug} onChange={(v) => setFormData({ ...formData, slug: v })} />
                  <FloatingInput id="category" label="Category" value={formData.category} onChange={(v) => setFormData({ ...formData, category: v })} />
                  <FloatingInput id="image" label="Image URL" value={formData.image} onChange={(v) => setFormData({ ...formData, image: v })} />
                  {formData.image && <img src={formData.image} alt="preview" className="w-24 h-24 object-cover rounded" />}
                  <FloatingInput id="mrp" label="MRP" type="number" value={formData.mrp.toString()} onChange={(v) => setFormData({ ...formData, mrp: Number(v) })} />
                  <FloatingInput id="sellingPrice" label="Selling Price" type="number" value={formData.sellingPrice.toString()} onChange={(v) => setFormData({ ...formData, sellingPrice: Number(v) })} />
                  <FloatingInput id="stock" label="Stock" type="number" value={formData.stock.toString()} onChange={(v) => setFormData({ ...formData, stock: Number(v) })} />
                  <FloatingInput id="description" label="Description" value={formData.description} onChange={(v) => setFormData({ ...formData, description: v })} />

                  <div className="flex items-center space-x-2">
                    <input type="checkbox" checked={formData.visible} onChange={(e) => setFormData({ ...formData, visible: e.target.checked })} />
                    <label>Visible</label>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 rounded bg-gray-200"
                    >
                      Cancel
                    </button>
                    <GradientButton type="submit">
                      {editingProduct ? "Update" : "Add"}
                    </GradientButton>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </AdminGuard>
  );
}
