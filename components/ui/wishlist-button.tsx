"use client"

import { useState } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWishlist } from "@/context/wishlist-context"
import type { Product } from "@/types/product"

interface WishlistButtonProps {
  product: Product
  variant?: "icon" | "button"
  className?: string
}

export function WishlistButton({ product, variant = "icon", className = "" }: WishlistButtonProps) {
  const { addItem, removeItem, isInWishlist } = useWishlist()
  const [isAdding, setIsAdding] = useState(false)
  const inWishlist = isInWishlist(product.ID)

  const handleToggleWishlist = () => {
    setIsAdding(true)

    if (inWishlist) {
      removeItem(product.ID)
    } else {
      addItem(product)
    }

    // Show feedback
    setTimeout(() => {
      setIsAdding(false)
    }, 500)
  }

  if (variant === "icon") {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={`rounded-full ${className}`}
        onClick={handleToggleWishlist}
        disabled={isAdding}
        aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart className={`h-5 w-5 ${inWishlist ? "fill-red-500 text-red-500" : ""}`} />
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      onClick={handleToggleWishlist}
      disabled={isAdding}
      className={className}
      aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart className={`mr-2 h-4 w-4 ${inWishlist ? "fill-red-500 text-red-500" : ""}`} />
      {inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
    </Button>
  )
}
