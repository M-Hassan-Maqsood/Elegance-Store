"use client"

import { useState } from "react"
import { ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/cart-context"
import type { Product } from "@/types/product"

interface AddToCartButtonProps {
  product: Product
  selectedSize?: string
}

export function AddToCartButton({ product, selectedSize }: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false)
  const { addItem } = useCart()

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Please select a size")
      return
    }

    setIsAdding(true)

    // Add to cart
    addItem(product, 1, selectedSize)

    // Show feedback
    setTimeout(() => {
      setIsAdding(false)
    }, 500)
  }

  return (
    <Button onClick={handleAddToCart} disabled={isAdding || !selectedSize} className="w-full">
      <ShoppingBag className="mr-2 h-4 w-4" />
      {isAdding ? "Adding..." : "Add to Cart"}
    </Button>
  )
}
