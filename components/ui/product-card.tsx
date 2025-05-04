"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"

import type { Product } from "@/types/product"
import { formatPrice, getImageUrl } from "@/lib/utils"
import { WishlistButton } from "./wishlist-button"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [imageError, setImageError] = useState(false)
  const imageUrl = product["Img Path"] || getImageUrl(product.ID, 0)

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition-all hover:shadow-md">
      <div className="aspect-h-4 aspect-w-3 bg-gray-100 sm:aspect-none sm:h-80">
        <Image
          src={imageError ? "/placeholder.svg" : imageUrl}
          alt={product["Product Name"]}
          width={300}
          height={400}
          className="h-full w-full object-cover object-center sm:h-full sm:w-full transition-transform duration-300 group-hover:scale-105"
          priority
          onError={() => setImageError(true)}
        />
      </div>
      <div className="flex flex-1 flex-col space-y-2 p-4">
        <h3 className="text-sm font-medium text-gray-900">
          <Link href={`/products/${product.ID}`}>
            <span aria-hidden="true" className="absolute inset-0" />
            {product["Product Name"]}
          </Link>
        </h3>
        <p className="text-base font-medium text-gray-900">{formatPrice(product.Price)}</p>
        <div className="flex items-center justify-between mt-auto">
          <p className="text-sm text-gray-500">{product.Category}</p>
          <WishlistButton product={product} />
        </div>
      </div>
    </div>
  )
}
