"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Product } from "@/lib/types"

interface CartItem {
  product: Product
  quantity: number
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (product: Product, quantity: number) => void
  removeFromCart: (productCode: string) => void
  updateQuantity: (productCode: string, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart))
  }, [cart])

  const addToCart = (product: Product, quantity: number) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex((item) => item.product.code === product.code)

      if (existingItemIndex >= 0) {
        // Update quantity if product already in cart
        const updatedCart = [...prevCart]
        updatedCart[existingItemIndex].quantity += quantity
        return updatedCart
      } else {
        // Add new item to cart
        return [...prevCart, { product, quantity }]
      }
    })
  }

  const removeFromCart = (productCode: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.code !== productCode))
  }

  const updateQuantity = (productCode: string, quantity: number) => {
    setCart((prevCart) => prevCart.map((item) => (item.product.code === productCode ? { ...item, quantity } : item)))
  }

  const clearCart = () => {
    setCart([])
  }

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}>
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
