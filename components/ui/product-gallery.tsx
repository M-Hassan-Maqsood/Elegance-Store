"use client"

import { useState } from "react"
import Image from "next/image"
import { cn, getImageUrl } from "@/lib/utils"

interface ProductGalleryProps {
  productId: string
  productName: string
  imageUrl?: string
}

export function ProductGallery({ productId, productName, imageUrl }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({})

  // Generate images for the gallery - we'll show up to 4 images
  const images = [0, 1, 2, 3].map((index) => ({
    id: index,
    src: index === 0 && imageUrl ? imageUrl : getImageUrl(productId, index),
    alt: `${productName} - Image ${index + 1}`,
  }))

  const handleImageError = (index: number) => {
    setImageErrors((prev) => ({
      ...prev,
      [index]: true,
    }))
  }

  return (
    <div className="flex flex-col-reverse md:grid md:grid-cols-4 md:gap-4">
      {/* Thumbnails */}
      <div className="mt-4 md:mt-0 flex md:flex-col gap-4 overflow-x-auto md:overflow-visible">
        {images.map((image, index) => (
          <div
            key={image.id}
            className={cn(
              "relative aspect-square h-20 w-20 cursor-pointer rounded-md border",
              selectedImage === index ? "border-gray-900" : "border-gray-200",
            )}
            onClick={() => setSelectedImage(index)}
          >
            <Image
              src={imageErrors[index] ? "/placeholder.svg?height=80&width=80" : image.src}
              alt={image.alt}
              fill
              className="object-cover object-center"
              onError={() => handleImageError(index)}
            />
          </div>
        ))}
      </div>

      {/* Main image */}
      <div className="md:col-span-3 aspect-h-4 aspect-w-3 sm:aspect-h-3 sm:aspect-w-2 md:aspect-h-2 md:aspect-w-3 overflow-hidden rounded-lg">
        <Image
          src={imageErrors[selectedImage] ? "/placeholder.svg?height=800&width=600" : images[selectedImage].src}
          alt={images[selectedImage].alt}
          width={800}
          height={1000}
          className="h-full w-full object-cover object-center"
          priority
          onError={() => handleImageError(selectedImage)}
        />
      </div>
    </div>
  )
}
