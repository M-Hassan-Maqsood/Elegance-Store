import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
  }).format(price)
}

export function getImageUrl(productId: string, imageIndex = 0): string {
  if (!productId) return "/placeholder.svg"

  // If it's already a full URL, return it
  if (typeof productId === "string" && productId.startsWith("http")) {
    return productId
  }

  // Check if we have a stored URL in localStorage (for development testing)
  const storedUrl =
    typeof window !== "undefined" ? localStorage.getItem(`product_image_${productId}_${imageIndex}`) : null

  if (storedUrl) {
    return storedUrl
  }

  // Format: /api/images/[productId]/image_[index].jpg
  return `/api/images/${productId}/image_${imageIndex}.jpg`
}

export function getProductImages(productId: string, count = 3): string[] {
  if (!productId) return Array(count).fill("/placeholder.svg")

  return Array.from({ length: count }, (_, i) => getImageUrl(productId, i))
}

export function getSizesArray(sizes: string): string[] {
  if (!sizes) return ["S", "M", "L"]
  return sizes.split(",").map((size) => size.trim())
}
