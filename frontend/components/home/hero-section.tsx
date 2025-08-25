"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { GradientButton } from "@/components/ui/gradient-button";
import { useAuth } from "@/contexts/auth-context";

export function HeroSection() {
  const { isAuthenticated } = useAuth();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 brightness-50 contrast-110"
      >
        <source src="/video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-purple-900/40 to-pink-900/40 z-0" />

      {/* Parallax Blobs */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute w-40 h-40 bg-gradient-to-br from-pink-400/25 to-purple-400/25 rounded-full blur-3xl"
          style={{
            transform: `translate(${mousePosition.x * 0.02}px, ${
              mousePosition.y * 0.02
            }px)`,
          }}
        />
        <div
          className="absolute w-56 h-56 bg-gradient-to-br from-purple-400/20 to-indigo-400/20 rounded-full blur-3xl"
          style={{
            transform: `translate(${mousePosition.x * -0.015}px, ${
              mousePosition.y * -0.015
            }px)`,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 leading-tight drop-shadow-md">
          <span className="block bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-400 bg-clip-text text-transparent animate-fade-in">
            AAVRA GENERAL
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl md:text-2xl text-gray-200 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in delay-100">
          Premium beauty products and cosmetics designed for the modern woman
          who values elegance and quality
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-14">
          <Link href="/products">
            <GradientButton
              size="lg"
              className="px-8 py-4 text-lg hover:scale-105 transition-transform"
            >
              Shop Collection
            </GradientButton>
          </Link>
          {!isAuthenticated && (
            <Link href="/auth/signup">
              <GradientButton
                variant="secondary"
                size="lg"
                className="px-8 py-4 text-lg hover:scale-105 transition-transform"
              >
                Join Now
              </GradientButton>
            </Link>
          )}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-8 sm:mt-16">
          {[
            {
              title: "Premium Quality",
              desc: "Carefully curated products from top beauty brands worldwide",
              gradient: "from-pink-500 to-purple-600",
              icon: (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              ),
            },
            {
              title: "Fast Delivery",
              desc: "Quick and secure delivery right to your doorstep",
              gradient: "from-purple-500 to-indigo-600",
              icon: (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              ),
            },
            {
              title: "Discounts on Bulk Orders",
              desc: "Save more when you buy in larger quantities",
              gradient: "from-indigo-500 to-pink-600",
              icon: (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 4h12m0 0a1 1 0 100 2 1 1 0 000-2zm-8 0a1 1 0 100 2 1 1 0 000-2z"
                />
              ),
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="glass rounded-2xl p-6 hover-lift transition-transform hover:scale-[1.03] backdrop-blur-md"
            >
              <div
                className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}
              >
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {feature.icon}
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-100 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-300 text-sm sm:text-base">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
