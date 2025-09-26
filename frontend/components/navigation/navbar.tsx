"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/hooks/use-cart";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { itemCount } = useCart();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAuthAction = () => {
    if (isAuthenticated) {
      logout(); // logout now clears cookies as well
    } else {
      router.push("/auth/login");
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 bg-white shadow-md h-[40px] transition-all duration-300 ${isScrolled ? "backdrop-blur-sm" : ""}`}>
      <div className="container mx-auto px-4 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo and Shop Name */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-[28px] w-[28px] rounded-full overflow-hidden flex items-center justify-center">
              <img
                src="/logo.jpg"
                alt="Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xl font-bold text-pink-600">AAVRA GENERAL</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/products" className="text-pink-600 font-medium hover:opacity-80 transition">Products</Link>
            <Link href="/about" className="text-pink-600 font-medium hover:opacity-80 transition">About</Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            {isAuthenticated && (
              <Link href="/cart" className="relative p-2 text-pink-600 hover:opacity-80 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9m-9 0V19a2 2 0 002 2h7a2 2 0 002-2v-4"/>
                </svg>
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {itemCount}
                  </span>
                )}
              </Link>
            )}

            {/* User Menu */}
            <div className="hidden md:flex items-center space-x-2">
              {isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-pink-600">Hi, {user?.name || "User"}</span>
                  <button
                    onClick={handleAuthAction}
                    className="px-4 py-2 text-sm text-pink-600 hover:opacity-80 transition"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAuthAction}
                  className="px-4 py-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 text-sm font-medium"
                >
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-pink-600 hover:opacity-80 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 px-6 py-4 space-y-4 animate-in slide-in-top-2 bg-white">
            <Link href="/products" className="block text-pink-600 font-medium hover:opacity-80 transition" onClick={() => setIsMobileMenuOpen(false)}>Products</Link>
            <Link href="/about" className="block text-pink-600 font-medium hover:opacity-80 transition" onClick={() => setIsMobileMenuOpen(false)}>About</Link>
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  handleAuthAction();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 text-sm font-medium"
              >
                {isAuthenticated ? "Logout" : "Sign In"}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
