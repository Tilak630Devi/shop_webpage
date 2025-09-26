// @ts-ignore
import Cookies from "js-cookie"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

export interface ApiResponse<T = any> {
  ok: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
}

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

// Admin Token management (still using localStorage)
const adminTokenStorage = {
  get: () => {
    if (typeof window === "undefined") return null
    return localStorage.getItem("admin_token")
  },
  set: (token: string) => {
    if (typeof window === "undefined") return
    localStorage.setItem("admin_token", token)
  },
  remove: () => {
    if (typeof window === "undefined") return
    localStorage.removeItem("admin_token")
  },
}

// Base API client
async function apiRequest<T>(endpoint: string, options: RequestInit = {}, useAdminToken = false): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  // Get token from cookies for users, localStorage for admin
  const token = useAdminToken
    ? adminTokenStorage.get()
    : typeof window !== "undefined"
    ? Cookies.get("token")
    : null

  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  }

  try {
    const response = await fetch(url, config)
    const data: ApiResponse<T> = await response.json()

    if (!data.ok) {
      throw new ApiError(
        data.error?.code || "UNKNOWN_ERROR",
        data.error?.message || "Something went wrong",
        data.error?.details,
      )
    }

    return data.data as T
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw new ApiError("NETWORK_ERROR", "Failed to connect to server")
  }
}

// Auth API
export const authApi = {
  signup: (data: { phone: string; name: string; address: any }) =>
    apiRequest<{ token: string; user: any }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: { phone: string }) =>
    apiRequest<{ token: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
}

// Products API
export const productsApi = {
  list: (params?: { page?: number; limit?: number; q?: string; category?: string; sort?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())
    if (params?.q) searchParams.set("q", params.q)
    if (params?.category) searchParams.set("category", params.category)
    if (params?.sort) searchParams.set("sort", params.sort)

    return apiRequest<{
      items: any[]
      page: number
      totalPages: number
      totalItems: number
    }>(`/products?${searchParams}`)
  },

  getBySlug: (slug: string) => apiRequest<any>(`/products/${slug}`),
}

// Comments API
export const commentsApi = {
  list: (slug: string, params?: { page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())

    return apiRequest<{
      items: any[]
      page: number
      totalPages: number
      totalItems: number
    }>(`/products/${slug}/comments?${searchParams}`)
  },

  create: (slug: string, data: { text: string; rating?: number }) =>
    apiRequest<any>(`/products/${slug}/comments`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
}

// Cart API
export const cartApi = {
  get: () => apiRequest<{ items: any[]; totals: { subtotal: number; mrpTotal: number } }>("/cart"),

  add: (data: { productId: string; qty: number }) =>
    apiRequest<any[]>("/cart/add", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateItem: (productId: string, data: { qty: number }) =>
    apiRequest<any[]>(`/cart/item/${productId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  removeItem: (productId: string) =>
    apiRequest<any[]>(`/cart/item/${productId}`, {
      method: "DELETE",
    }),

  checkout: () =>
    apiRequest<{ link: string; preview: any }>("/cart/checkout", {
      method: "POST",
    }),
}

// Buy Now API
export const checkoutApi = {
  buyNow: (data: { productId: string; qty: number }) =>
    apiRequest<{ link: string; preview: any }>("/checkout/now", {
      method: "POST",
      body: JSON.stringify(data),
    }),
}

// Admin API
export const adminApi = {
  login: (data: { username: string; password: string }) =>
    apiRequest<{ token: string }>("/admin/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  products: {
    list: (params?: { page?: number; limit?: number; q?: string; category?: string; visible?: boolean }) => {
      const searchParams = new URLSearchParams()
      if (params?.page) searchParams.set("page", params.page.toString())
      if (params?.limit) searchParams.set("limit", params.limit.toString())
      if (params?.q) searchParams.set("q", params.q)
      if (params?.category) searchParams.set("category", params.category)
      if (params?.visible !== undefined) searchParams.set("visible", params.visible.toString())

      return apiRequest<{
        items: any[]
        page: number
        totalPages: number
        totalItems: number
      }>(`/admin/products?${searchParams}`, {}, true)
    },

    create: (data: any) =>
      apiRequest<any>(
        "/admin/products",
        {
          method: "POST",
          body: JSON.stringify(data),
        },
        true,
      ),

    update: (id: string, data: any) =>
      apiRequest<any>(
        `/admin/products/${id}`,
        {
          method: "PATCH",
          body: JSON.stringify(data),
        },
        true,
      ),

    delete: (id: string) =>
      apiRequest<{ deleted: boolean }>(
        `/admin/products/${id}`,
        {
          method: "DELETE",
        },
        true,
      ),
  },

  comments: {
    update: (id: string, data: { visible?: boolean; text?: string }) =>
      apiRequest<any>(
        `/admin/comments/${id}`,
        {
          method: "PATCH",
          body: JSON.stringify(data),
        },
        true,
      ),

    delete: (id: string) =>
      apiRequest<{ deleted: boolean }>(
        `/admin/comments/${id}`,
        {
          method: "DELETE",
        },
        true,
      ),
  },
}
