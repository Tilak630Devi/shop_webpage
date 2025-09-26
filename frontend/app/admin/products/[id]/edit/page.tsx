"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Navbar } from "@/components/navigation/navbar";
import { GradientButton } from "@/components/ui/gradient-button";
import { useAdmin } from "@/contexts/admin-context";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
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
  const [fetching, setFetching] = useState(true);

  // Fetch existing product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = getToken();
        const res = await fetch(`${API_BASE_URL}/admin/products/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch product");
        const data = await res.json();

        setFormData({
          name: data.name || "",
          category: data.category || "",
          description: data.description || "",
          image: data.image || "",
          mrp: data.mrp || 0,
          sellingPrice: data.sellingPrice || 0,
          slug: data.slug || "",
          stock: data.stock || 0,
          visible: data.visible ?? true,
        });
      } catch (err) {
        console.error(err);
        alert("Error loading product");
      } finally {
        setFetching(false);
      }
    };
    fetchProduct();
  }, [params.id, getToken]);

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number"
          ? value === ""
            ? 0
            : Number(value)
          : value,
    }));
  };

  // Submit update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/admin/products/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to update product");

      alert("✅ Product updated successfully!");
      router.push("/admin/products");
    } catch (err) {
      console.error(err);
      alert("❌ Error updating product");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading product...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100">
      <Navbar />
      <main className="pt-24 pb-12">
        <div className="container mx-auto max-w-3xl px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold gradient-text-pink mb-8 text-center">
            Edit Product
          </h1>

          <form
            onSubmit={handleSubmit}
            className="bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl p-6 sm:p-8 border border-gray-200 space-y-6"
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
            <div>
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
              {formData.image && (
                <img
                  src={formData.image}
                  alt="Preview"
                  className="mt-4 max-w-[150px] w-full h-auto object-cover rounded-lg border"
                />
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
                  setFormData((prev) => ({
                    ...prev,
                    visible: e.target.checked,
                  }))
                }
                className="h-4 w-4 text-pink-600 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">Visible</label>
            </div>

            <GradientButton type="submit" className="w-full">
              {loading ? "Saving..." : "Save Changes"}
            </GradientButton>
          </form>
        </div>
      </main>
    </div>
  );
}
