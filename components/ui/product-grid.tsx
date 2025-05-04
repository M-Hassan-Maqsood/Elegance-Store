"use client"

import type { Product } from "@/types/product"
import { ProductCard } from "./product-card"

interface ProductGridProps {
  products: Product[]
  title?: string
}

export function ProductGrid({ products, title }: ProductGridProps) {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        {title && <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-6">{title}</h2>}
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {products.map((product) => (
            <ProductCard key={product.ID} product={product} />
          ))}
        </div>
      </div>
    </div>
  )
}
