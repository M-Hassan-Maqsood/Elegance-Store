"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@supabase/supabase-js"

// Create a Supabase client for the browser
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface ProductGalleryProps {
  productCode: string
  mainImage: string | null
}

export default function ProductGallery({ productCode, mainImage }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // Function to get the correct image URL
  const getImageUrl = (url: string | null) => {
    if (!url) return null

    // If it's already a full URL, return it
    if (url.startsWith("http")) {
      return url
    }

    // Otherwise, prepend the API URL
    return `${process.env.NEXT_PUBLIC_API_URL}${url}`
  }

  useEffect(() => {
    async function fetchProductImages() {
      setLoading(true)

      // Start with the main image if available
      const imagesList = mainImage ? [getImageUrl(mainImage) || ""] : []

      try {
        // Try to fetch additional images from Supabase Storage
        const { data, error } = await supabase.storage.from("product-images").list(productCode)

        if (!error && data && data.length > 0) {
          // Add all images from storage
          const storageImages = data
            .filter((file) => !file.id.includes(".DS_Store")) // Filter out system files
            .map((file) => {
              return supabase.storage.from("product-images").getPublicUrl(`${productCode}/${file.name}`).data.publicUrl
            })

          // Add unique images only (avoid duplicates with main image)
          storageImages.forEach((url) => {
            if (!imagesList.includes(url)) {
              imagesList.push(url)
            }
          })
        }
      } catch (error) {
        console.error("Error fetching product images:", error)
      }

      // Add placeholder images if we don't have enough
      while (imagesList.length < 4) {
        imagesList.push(`/placeholder.svg?height=600&width=500&text=Product+Image+${imagesList.length + 1}`)
      }

      setImages(imagesList)
      setLoading(false)
    }

    fetchProductImages()
  }, [productCode, mainImage])

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length)
  }

  if (loading) {
    return (
      <div className="relative h-[600px] bg-gray-100 mb-4 flex items-center justify-center">
        <p className="text-gray-500">Loading images...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="relative h-[600px] bg-gray-100 mb-4">
        <Image
          src={images[selectedImage] || "/placeholder.svg"}
          alt={`Product image ${selectedImage + 1}`}
          fill
          className="object-contain"
        />
        <Button
          variant="secondary"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full h-10 w-10"
          onClick={prevImage}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full h-10 w-10"
          onClick={nextImage}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {images.map((image, index) => (
          <div
            key={index}
            className={`relative h-24 cursor-pointer border-2 ${
              selectedImage === index ? "border-black" : "border-transparent"
            }`}
            onClick={() => setSelectedImage(index)}
          >
            <Image src={image || "/placeholder.svg"} alt={`Thumbnail ${index + 1}`} fill className="object-cover" />
          </div>
        ))}
      </div>
    </div>
  )
}
