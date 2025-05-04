"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Product } from "@/types/product"

export type CartItem = {
  product: Product
  quantity: number
  selectedSize?: string
}

type CartContextType = {
  items: CartItem[]
  addItem: (product: Product, quantity?: number, size?: string) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  itemCount: number
  total: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isClient, setIsClient] = useState(false)

  // Initialize from localStorage on client side only
  useEffect(() => {
    setIsClient(true)
    const storedCart = localStorage.getItem("cart")
    if (storedCart) {
      try {
        setItems(JSON.parse(storedCart))
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error)
        localStorage.removeItem("cart")
      }
    }
  }, [])

  // Save to localStorage whenever cart changes
  useEffect(() => {
    if (isClient && items.length > 0) {
      localStorage.setItem("cart", JSON.stringify(items))
    }
  }, [items, isClient])

  const addItem = (product: Product, quantity = 1, size?: string) => {
    setItems((prevItems) => {
      // Check if item already exists in cart
      const existingItemIndex = prevItems.findIndex(
        (item) => item.product.ID === product.ID && item.selectedSize === size,
      )

      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex].quantity += quantity
        return updatedItems
      } else {
        // Add new item
        return [...prevItems, { product, quantity, selectedSize: size }]
      }
    })
  }

  const removeItem = (productId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.product.ID !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    setItems((prevItems) =>
      prevItems.map((item) => (item.product.ID === productId ? { ...item, quantity: Math.max(1, quantity) } : item)),
    )
  }

  const clearCart = () => {
    setItems([])
    if (isClient) {
      localStorage.removeItem("cart")
    }
  }

  const itemCount = items.reduce((total, item) => total + item.quantity, 0)

  const total = items.reduce((total, item) => total + item.product.Price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
