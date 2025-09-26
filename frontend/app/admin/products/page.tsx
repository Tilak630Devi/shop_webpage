"use client";

import { useState, useEffect, useCallback } from "react";
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
  mrp: number;
  sellingPrice: number;
  stock: number;
  visible: boolean;
  description: string;
  image: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // newest, price-low, price-high

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Omit<Product, "_id">>({
    name: "",
    slug: "",
    category: "",
    mrp: 0,
    sellingPrice: 0,
    stock: 0,
    visible: true,
    description: "",
    image: "",
  });

  // Prevent body scroll when modal open + close on Escape
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsModalOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await adminApi.products.list({ limit: 1000 });
        const unique = [
          ...new Set(
            response.items.map((p: Product) => p.category).filter(Boolean)
          ),
        ];
        setCategories(unique);
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.products.list({ limit: 1000 });
      let filtered: Product[] = response.items;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (p: Product) =>
            (p.name || "").toLowerCase().includes(q) ||
            (p.description || "").toLowerCase().includes(q) ||
            (p.category || "").toLowerCase().includes(q)
        );
      }

      if (selectedCategory) {
        filtered = filtered.filter((p: Product) => p.category === selectedCategory);
      }

      filtered.sort((a, b) => {
        if (sortBy === "price-low") return a.sellingPrice - b.sellingPrice;
        if (sortBy === "price-high") return b.sellingPrice - a.sellingPrice;
        return 0;
      });

      setProducts(filtered);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedCategory, sortBy]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleToggleVisibility = async (product: Product) => {
    try {
      await adminApi.products.update(product._id, {
        visible: !product.visible,
      });
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
      mrp: 0,
      sellingPrice: 0,
      stock: 0,
      visible: true,
      description: "",
      image: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    const { _id, ...data } = product;
    setFormData(data);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await adminApi.products.update(editingProduct._id, formData);
      } else {
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
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-serif font-bold gradient-text mb-2">
                Products
              </h1>
              <p className="text-gray-600">Manage your product catalog</p>
            </div>
            <div className="w-full sm:w-auto">
              <GradientButton onClick={openAddModal} className="w-full sm:w-auto">
                Add Product
              </GradientButton>
            </div>
          </div>

          {/* Category + Sort + Search */}
          <GlassCard className="p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Categories - horizontally scrollable on mobile */}
              <div className="flex items-center w-full sm:w-auto">
                <div className="flex gap-2 overflow-x-auto pb-1 -mx-2 px-2 scrollbar-hide">
                  <button
                    onClick={() => setSelectedCategory("")}
                    className={`px-3 py-1 rounded-full text-sm font-medium shrink-0 ${
                      selectedCategory === ""
                        ? "bg-purple-600 text-white"
                        : "bg-white/20 text-gray-700 hover:bg-white/30"
                    }`}
                  >
                    All
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 rounded-full text-sm font-medium shrink-0 ${
                        selectedCategory === cat
                          ? "bg-purple-600 text-white"
                          : "bg-white/20 text-gray-700 hover:bg-white/30"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search + Sort */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full sm:w-auto">
                <div className="w-full sm:w-[320px]">
                  {/* wrapper ensures FloatingInput becomes full width on mobile */}
                  <FloatingInput
                    id="search"
                    label="Search products..."
                    value={searchQuery}
                    onChange={setSearchQuery}
                  />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full sm:w-auto border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </GlassCard>

          {/* Products Table / Cards */}
          <GlassCard className="overflow-visible">
            {isLoading ? (
              <div className="p-6">Loading...</div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block">
                  <table className="w-full table-auto">
                    <thead className="bg-white/20">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800">
                          Name
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800">
                          Category
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800">
                          Price
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800">
                          Stock
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800">
                          Status
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/20">
                      {products.map((p) => (
                        <tr key={p._id} className="hover:bg-white/10 transition-colors">
                          <td className="px-4 py-3 text-sm text-gray-800">{p.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 capitalize">{p.category}</td>
                          <td className="px-4 py-3 text-sm text-gray-800">
                            ₹{p.sellingPrice}{" "}
                            {p.mrp > p.sellingPrice && (
                              <span className="line-through text-gray-500">₹{p.mrp}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{p.stock}</td>
                          <td className="px-4 py-3 text-sm">
                            <button
                              onClick={() => handleToggleVisibility(p)}
                              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                                p.visible
                                  ? "bg-green-100 text-green-800 hover:bg-green-200"
                                  : "bg-red-100 text-red-800 hover:bg-red-200"
                              }`}
                            >
                              {p.visible ? "Visible" : "Hidden"}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex gap-2">
                              <button
                                onClick={() => openEditModal(p)}
                                className="text-xs px-3 py-1 bg-blue-600 text-white rounded"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p._id)}
                                className="text-xs px-3 py-1 bg-red-600 text-white rounded"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {products.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-6 text-gray-600">
                            No products found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card List */}
                <div className="space-y-4 md:hidden">
                  {products.map((p) => (
                    <div key={p._id} className="p-4 bg-white/10 rounded-lg shadow-sm">
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{p.name}</h3>
                          <p className="text-sm text-gray-600 truncate">{p.category}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">₹{p.sellingPrice}</div>
                          {p.mrp > p.sellingPrice && (
                            <div className="text-xs line-through text-gray-500">₹{p.mrp}</div>
                          )}
                        </div>
                      </div>

                      <div className="mt-2 flex items-center justify-between gap-3">
                        <div className="text-sm text-gray-600">Stock: {p.stock}</div>
                        <div>
                          <button
                            onClick={() => handleToggleVisibility(p)}
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              p.visible ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            {p.visible ? "Visible" : "Hidden"}
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="flex-1 text-sm px-3 py-2 bg-blue-600 text-white rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p._id)}
                          className="flex-1 text-sm px-3 py-2 bg-red-600 text-white rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}

                  {products.length === 0 && (
                    <div className="text-center py-6 text-gray-600">No products found</div>
                  )}
                </div>
              </>
            )}
          </GlassCard>

          {/* Add/Edit Modal */}
          {isModalOpen && (
            <div
              className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/50 px-4 py-6"
              aria-hidden={false}
            >
              <div
                role="dialog"
                aria-modal="true"
                className="w-full sm:max-w-2xl bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-start justify-between p-4 border-b">
                  <h2 className="text-lg font-semibold" id="product-modal-title">
                    {editingProduct ? "Edit Product" : "Add Product"}
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setIsModalOpen(false);
                      }}
                      aria-label="Close"
                      className="text-gray-500 hover:text-gray-700 p-1 rounded"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <form onSubmit={handleFormSubmit} className="p-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <FloatingInput
                        id="name"
                        label="Name"
                        value={formData.name}
                        onChange={(v) => setFormData({ ...formData, name: v })}
                      />
                    </div>
                    <div>
                      <FloatingInput
                        id="slug"
                        label="Slug"
                        value={formData.slug}
                        onChange={(v) => setFormData({ ...formData, slug: v })}
                      />
                    </div>

                    <div>
                      <FloatingInput
                        id="category"
                        label="Category"
                        value={formData.category}
                        onChange={(v) => setFormData({ ...formData, category: v })}
                      />
                    </div>

                    <div>
                      <FloatingInput
                        id="image"
                        label="Image URL"
                        value={formData.image}
                        onChange={(v) => setFormData({ ...formData, image: v })}
                      />
                    </div>

                    <div>
                      <FloatingInput
                        id="mrp"
                        label="MRP"
                        type="number"
                        value={formData.mrp.toString()}
                        onChange={(v) => setFormData({ ...formData, mrp: Number(v) })}
                      />
                    </div>

                    <div>
                      <FloatingInput
                        id="sellingPrice"
                        label="Selling Price"
                        type="number"
                        value={formData.sellingPrice.toString()}
                        onChange={(v) =>
                          setFormData({ ...formData, sellingPrice: Number(v) })
                        }
                      />
                    </div>

                    <div>
                      <FloatingInput
                        id="stock"
                        label="Stock"
                        type="number"
                        value={formData.stock.toString()}
                        onChange={(v) => setFormData({ ...formData, stock: Number(v) })}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <FloatingInput
                        id="description"
                        label="Description"
                        value={formData.description}
                        onChange={(v) => setFormData({ ...formData, description: v })}
                      />
                    </div>
                  </div>

                  {/* Image preview */}
                  {formData.image && (
                    <div className="mt-2">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="w-full max-h-40 object-contain rounded border"
                      />
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <input
                      id="visible"
                      type="checkbox"
                      checked={formData.visible}
                      onChange={(e) =>
                        setFormData({ ...formData, visible: e.target.checked })
                      }
                      className="h-4 w-4"
                    />
                    <label htmlFor="visible" className="text-sm">
                      Visible
                    </label>
                  </div>

                  <div className="flex justify-end space-x-2 pt-2 border-t">
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
