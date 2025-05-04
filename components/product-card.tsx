"use client"

import type React from "react"

import type { Product } from "@/lib/types"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, ShoppingBag, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "./cart-provider"
import { useState, useEffect } from "react"

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const { addToCart } = useCart()

  // Check if product is in wishlist
  useEffect(() => {
    const savedWishlist = localStorage.getItem("wishlist")
    if (savedWishlist) {
      try {
        const wishlist = JSON.parse(savedWishlist)
        setIsInWishlist(wishlist.some((item: Product) => item.code === product.code))
      } catch (error) {
        console.error("Failed to parse wishlist from localStorage:", error)
      }
    }
  }, [product.code])

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product, 1)
  }

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const savedWishlist = localStorage.getItem("wishlist")
    let wishlist: Product[] = []

    if (savedWishlist) {
      try {
        wishlist = JSON.parse(savedWishlist)
      } catch (error) {
        console.error("Failed to parse wishlist from localStorage:", error)
      }
    }

    if (isInWishlist) {
      wishlist = wishlist.filter((item) => item.code !== product.code)
    } else {
      wishlist.push(product)
    }

    localStorage.setItem("wishlist", JSON.stringify(wishlist))
    setIsInWishlist(!isInWishlist)
  }

  // Function to get the correct image URL
  const getImageUrl = () => {
    if (!product.image_url) return null

    // If it's already a full URL, return it
    if (product.image_url.startsWith("http")) {
      return product.image_url
    }

    // Otherwise, prepend the API URL
    return `${process.env.NEXT_PUBLIC_API_URL}${product.image_url}`
  }

  return (
    <Card
      className="group overflow-hidden border-none shadow-none transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${product.code}`}>
        <div className="relative h-[400px] overflow-hidden bg-gray-100">
          {getImageUrl() ? (
            <>
              <Image
                src={getImageUrl() || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div
                className={`absolute inset-0 bg-black/10 transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}
              />
              <div
                className={`absolute bottom-0 left-0 right-0 flex justify-center gap-2 p-4 transition-transform duration-300 ${isHovered ? "translate-y-0" : "translate-y-full"}`}
              >
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white hover:bg-white/90 text-black rounded-full w-10 h-10 p-0"
                  onClick={handleAddToCart}
                >
                  <ShoppingBag size={16} />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white hover:bg-white/90 text-black rounded-full w-10 h-10 p-0"
                  onClick={handleToggleWishlist}
                >
                  <Heart size={16} fill={isInWishlist ? "currentColor" : "none"} />
                </Button>
                <Link href={`/products/${product.code}`}>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-white hover:bg-white/90 text-black rounded-full w-10 h-10 p-0"
                  >
                    <Eye size={16} />
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">No image available</p>
            </div>
          )}
          {product.availability === "In Stock" && (
            <div className="absolute top-4 left-4 bg-black text-white text-xs px-3 py-1">NEW</div>
          )}
        </div>
        <CardContent className="p-4 text-center">
          <p className="text-gray-500 text-sm mb-1">{product.category}</p>
          <h3 className="font-medium text-lg mb-2">{product.name}</h3>
          <p className="text-black font-semibold">Rs. {product.price.toLocaleString()}</p>
        </CardContent>
      </Link>
    </Card>
  )
}
