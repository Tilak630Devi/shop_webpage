"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navigation/navbar";
import { GradientButton } from "@/components/ui/gradient-button";
import { useAdmin } from "@/contexts/admin-context";

export default function AddProductPage() {
  const router = useRouter();
  const { getToken } = useAdmin();

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    image: "",
    mrp: 0,
    sellingPrice: 0,
    slug: "",
    stock: 0,
    visible: true,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = getToken();
      const payload = { ...formData, image: formData.image || "" };
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/products`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to add product");
      router.push("/admin/products");
    } catch (err) {
      console.error(err);
      alert("Error adding product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100">
      <Navbar />
      <main className="pt-24 pb-12">
        <div className="container mx-auto max-w-3xl px-4">
          <h1 className="text-3xl font-serif font-bold gradient-text-pink mb-8 text-center">
            Add New Product
          </h1>
          <form
            onSubmit={handleSubmit}
            className="bg-white/70 backdrop-blur-lg shadow-xl rounded-2xl p-6 sm:p-8 border border-gray-200 space-y-6"
          >
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm"
              />
            </div>

            {/* Image */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">
                  Image URL
                </label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm"
                />
              </div>
              {formData.image && (
                <div className="mt-4 sm:mt-0 flex-shrink-0">
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>

            {/* Prices */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  MRP
                </label>
                <input
                  type="number"
                  name="mrp"
                  value={formData.mrp}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Selling Price
                </label>
                <input
                  type="number"
                  name="sellingPrice"
                  value={formData.sellingPrice}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm"
                />
              </div>
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Slug
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm"
              />
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Stock
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm"
              />
            </div>

            {/* Visible */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="visible"
                checked={formData.visible}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, visible: e.target.checked }))
                }
                className="h-4 w-4 text-pink-600 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">Visible</label>
            </div>

            <GradientButton type="submit" className="w-full">
              {loading ? "Adding..." : "Add Product"}
            </GradientButton>
          </form>
        </div>
      </main>
    </div>
  );
}
