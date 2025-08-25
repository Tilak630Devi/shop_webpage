"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { adminApi, ApiError } from "@/lib/api"

interface AdminContextType {
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  error: string | null
  clearError: () => void
  getToken: () => string | null
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const clearError = () => setError(null)

  useEffect(() => {
    const token = localStorage.getItem("admin_token")
    if (token) setIsAuthenticated(true)
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await adminApi.login({ username, password })
      localStorage.setItem("admin_token", response.token)
      setIsAuthenticated(true)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError("Login failed. Please try again.")
      }
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("admin_token")
    setIsAuthenticated(false)
    setError(null)
  }

  const value: AdminContextType = {
    isAuthenticated,
    isLoading,
    login,
    logout,
    error,
    clearError,
    getToken: () => localStorage.getItem("admin_token"),
  }

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider")
  }
  return context
}
