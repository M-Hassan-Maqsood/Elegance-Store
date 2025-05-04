"use client"

import { useState } from "react"
import { useCart } from "./cart-provider"
import type { Product } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Heart, ShoppingBag, Check } from "lucide-react"

interface AddToCartButtonProps {
  product: Product
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [isInWishlist, setIsInWishlist] = useState(() => {
    if (typeof window !== "undefined") {
      const savedWishlist = localStorage.getItem("wishlist")
      if (savedWishlist) {
        try {
          const wishlist = JSON.parse(savedWishlist)
          return wishlist.some((item: Product) => item.code === product.code)
        } catch (error) {
          return false
        }
      }
    }
    return false
  })

  const handleAddToCart = () => {
    addToCart(product, quantity)
    setAdded(true)

    // Reset the added state after 2 seconds
    setTimeout(() => {
      setAdded(false)
    }, 2000)
  }

  const handleToggleWishlist = () => {
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

  return (
    <div>
      <div className="flex items-center mb-6">
        <span className="mr-4 font-medium">Quantity:</span>
        <div className="flex items-center border border-gray-300 rounded-md">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-4 py-2 border-r border-gray-300 hover:bg-gray-50"
            aria-label="Decrease quantity"
          >
            -
          </button>
          <span className="px-6 py-2 min-w-[40px] text-center">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="px-4 py-2 border-l border-gray-300 hover:bg-gray-50"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        <Button onClick={handleAddToCart} className="flex-1 bg-black hover:bg-black/80 h-12 text-base" disabled={added}>
          {added ? (
            <>
              <Check className="mr-2 h-5 w-5" />
              Added to Cart
            </>
          ) : (
            <>
              <ShoppingBag className="mr-2 h-5 w-5" />
              Add to Cart
            </>
          )}
        </Button>
        <Button
          onClick={handleToggleWishlist}
          variant="outline"
          className={`border-gray-300 h-12 w-12 p-0 flex items-center justify-center ${
            isInWishlist ? "bg-pink-50 border-pink-200 text-pink-600" : ""
          }`}
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className="h-5 w-5" fill={isInWishlist ? "currentColor" : "none"} />
        </Button>
      </div>
    </div>
  )
}
