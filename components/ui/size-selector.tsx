"use client"

import { useState } from "react"
import { cn, getSizesArray } from "@/lib/utils"

interface SizeSelectorProps {
  sizes: string
  onSelectSize: (size: string) => void
}

export function SizeSelector({ sizes, onSelectSize }: SizeSelectorProps) {
  const [selectedSize, setSelectedSize] = useState<string>("")
  const sizeOptions = getSizesArray(sizes)

  const handleSelectSize = (size: string) => {
    setSelectedSize(size)
    onSelectSize(size)
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">Size</h3>
        <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
          Size guide
        </a>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        {sizeOptions.map((size) => (
          <button
            key={size}
            type="button"
            className={cn(
              "flex items-center justify-center rounded-md border py-2 px-3 text-sm font-medium uppercase",
              selectedSize === size
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-200 bg-white text-gray-900 hover:bg-gray-50",
            )}
            onClick={() => handleSelectSize(size)}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  )
}
