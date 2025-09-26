"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
  // @ts-ignore
import Cookies from "js-cookie"
import { authApi, ApiError } from "@/lib/api"

interface User {
  phone: string
  name?: string
  addresses?: any[]
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (phone: string) => Promise<void>
  signup: (data: { phone: string; name: string; address: any }) => Promise<void>
  logout: () => void
  error: string | null
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const clearError = () => setError(null)

  // Rehydrate auth state from cookies on mount
  useEffect(() => {
    const token = Cookies.get("token")
    const userData = Cookies.get("user")
    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
      } catch {
        setUser(null)
        Cookies.remove("token")
        Cookies.remove("user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (phone: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await authApi.login({ phone })

      // Set cookies for persistence (7 days)
      Cookies.set("token", response.token, { expires: 30 })
      Cookies.set("user", JSON.stringify(response.user), { expires: 30 })

      setUser(response.user)
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

  const signup = async (data: { phone: string; name: string; address: any }) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await authApi.signup(data)

      // Set cookies for persistence (7 days)
      Cookies.set("token", response.token, { expires: 7 })
      Cookies.set("user", JSON.stringify(response.user), { expires: 7 })

      setUser(response.user)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError("Signup failed. Please try again.")
      }
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    Cookies.remove("token")
    Cookies.remove("user")
    setUser(null)
    setError(null)
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    error,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
