import Image from "next/image"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface ImageCarouselProps {
  images: string[]
  alt: string
  className?: string
}

export function ImageCarousel({ images, alt, className }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (images.length === 0) {
    return (
      <div
        className={cn(
          "aspect-square bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl flex items-center justify-center",
          className,
        )}
      >
        <span className="text-gray-500">No Image Available</span>
      </div>
    )
  }

  return (
    <div className={cn("relative", className)}>
      {/* Main Image */}
      <div className="relative aspect-square rounded-2xl overflow-hidden glass">
        <Image
          src={images[currentIndex] || "/placeholder.svg"}
          alt={alt}
          fill
          unoptimized
          className="object-contain w-full h-full" // ✅ fully fit, no zoom
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex space-x-2 mt-4 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300",
                index === currentIndex ? "border-pink-500" : "border-transparent hover:border-pink-300",
              )}
            >
              <Image
                src={image || "/placeholder.svg"}
                alt={`${alt} ${index + 1}`}
                width={64}
                height={64}
                unoptimized
                className="object-contain w-full h-full" // ✅ fully fit
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
