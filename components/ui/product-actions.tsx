"use client"

import { useState } from "react"
import { SizeSelector } from "@/components/ui/size-selector"
import { AddToCartButton } from "@/components/ui/add-to-cart-button"
import { WishlistButton } from "@/components/ui/wishlist-button"
import type { Product } from "@/types/product"

interface ProductActionsProps {
  product: Product
}

export function ProductActions({ product }: ProductActionsProps) {
  const [selectedSize, setSelectedSize] = useState<string>("")

  return (
    <>
      <div className="mt-6">
        <SizeSelector sizes={product.Sizes} onSelectSize={(size) => setSelectedSize(size)} />
      </div>

      {/* Add to cart */}
      <div className="mt-8">
        <AddToCartButton product={product} selectedSize={selectedSize} />
      </div>

      {/* Add to wishlist */}
      <div className="mt-4">
        <WishlistButton product={product} variant="button" className="w-full" />
      </div>
    </>
  )
}
