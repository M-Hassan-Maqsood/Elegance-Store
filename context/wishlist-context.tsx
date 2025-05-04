"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Product } from "@/types/product"

export type WishlistItem = {
  product: Product
}

type WishlistContextType = {
  items: WishlistItem[]
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  itemCount: number
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [isClient, setIsClient] = useState(false)

  // Initialize from localStorage on client side only
  useEffect(() => {
    setIsClient(true)
    const storedWishlist = localStorage.getItem("wishlist")
    if (storedWishlist) {
      try {
        setItems(JSON.parse(storedWishlist))
      } catch (error) {
        console.error("Failed to parse wishlist from localStorage:", error)
        localStorage.removeItem("wishlist")
      }
    }
  }, [])

  // Save to localStorage whenever wishlist changes
  useEffect(() => {
    if (isClient) {
      if (items.length > 0) {
        localStorage.setItem("wishlist", JSON.stringify(items))
      } else {
        localStorage.removeItem("wishlist")
      }
    }
  }, [items, isClient])

  const addItem = (product: Product) => {
    setItems((prevItems) => {
      // Check if item already exists in wishlist
      const existingItemIndex = prevItems.findIndex((item) => item.product.ID === product.ID)

      if (existingItemIndex >= 0) {
        // Item already in wishlist, don't add it again
        return prevItems
      } else {
        // Add new item
        return [...prevItems, { product }]
      }
    })
  }

  const removeItem = (productId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.product.ID !== productId))
  }

  const isInWishlist = (productId: string) => {
    return items.some((item) => item.product.ID === productId)
  }

  const itemCount = items.length

  return (
    <WishlistContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        isInWishlist,
        itemCount,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}
