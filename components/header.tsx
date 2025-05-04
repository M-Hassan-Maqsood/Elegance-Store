"use client"

import Link from "next/link"
import { useCart } from "./cart-provider"
import { ShoppingBag, Search, Menu, X, User, Heart } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { usePathname } from "next/navigation"

export default function Header() {
  const { cart } = useCart()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? "bg-black text-white shadow-lg" : "bg-black/90 text-white backdrop-blur-md"}`}
    >
      {/* Top bar */}
      <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white text-xs py-2">
        <div className="container mx-auto px-4 text-center">
          Free shipping on all orders over Rs. 5000 | Use code WELCOME10 for 10% off your first order
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white hover:bg-white/10">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          {/* Logo */}
          <Link href="/" className="text-2xl font-playfair font-bold text-white">
            ELEGANCE
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:block">
            <ul className="flex space-x-10">
              <li>
                <Link
                  href="/"
                  className={`text-white hover:text-gray-300 font-medium text-sm uppercase tracking-wider pb-2 transition-all duration-300 ${pathname === "/" ? "border-b border-white/50" : ""}`}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className={`text-white hover:text-gray-300 font-medium text-sm uppercase tracking-wider pb-2 transition-all duration-300 ${pathname === "/products" ? "border-b border-white/50" : ""}`}
                >
                  Shop
                </Link>
              </li>
              <li>
                <Link
                  href="/lens"
                  className={`text-white hover:text-gray-300 font-medium text-sm uppercase tracking-wider pb-2 transition-all duration-300 ${pathname === "/lens" ? "border-b border-white/50" : ""}`}
                >
                  Lens
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className={`text-white hover:text-gray-300 font-medium text-sm uppercase tracking-wider pb-2 transition-all duration-300 ${pathname === "/categories" ? "border-b border-white/50" : ""}`}
                >
                  Categories
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className={`text-white hover:text-gray-300 font-medium text-sm uppercase tracking-wider pb-2 transition-all duration-300 ${pathname === "/about" ? "border-b border-white/50" : ""}`}
                >
                  About
                </Link>
              </li>
            </ul>
          </nav>

          {/* Icons - Only mirror icon (Search) and cart/account */}
          <div className="flex items-center space-x-5">
            <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(!isSearchOpen)} className="text-white hover:bg-white/10 relative overflow-hidden group">
              <Search className="h-5 w-5 transform transition-transform duration-300 group-hover:scale-110" />
              <span className="absolute inset-0 bg-white/10 scale-0 rounded-full group-hover:scale-100 transition-transform duration-300"></span>
            </Button>
            <Link href="/wishlist">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 relative overflow-hidden group">
                <Heart className="h-5 w-5 transform transition-transform duration-300 group-hover:scale-110" />
                <span className="absolute inset-0 bg-white/10 scale-0 rounded-full group-hover:scale-100 transition-transform duration-300"></span>
              </Button>
            </Link>
            <Link href="/account">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 relative overflow-hidden group">
                <User className="h-5 w-5 transform transition-transform duration-300 group-hover:scale-110" />
                <span className="absolute inset-0 bg-white/10 scale-0 rounded-full group-hover:scale-100 transition-transform duration-300"></span>
              </Button>
            </Link>
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 relative overflow-hidden group">
                <ShoppingBag className="h-5 w-5 transform transition-transform duration-300 group-hover:scale-110" />
                <span className="absolute inset-0 bg-white/10 scale-0 rounded-full group-hover:scale-100 transition-transform duration-300"></span>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-white text-black text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Search bar - Only shown when mirror icon is clicked */}
      {isSearchOpen && (
        <div className="border-t border-white/10 py-6 px-4 bg-black/95 backdrop-blur-md transition-all duration-300">
          <div className="container mx-auto max-w-2xl">
            <form className="flex gap-2">
              <Input 
                type="search" 
                placeholder="Search products..." 
                className="flex-grow bg-transparent border-white/20 text-white focus-visible:ring-white/30 placeholder:text-white/50" 
                autoFocus 
              />
              <Button type="submit" className="bg-white text-black hover:bg-white/80">
                Search
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-black/95">
          <nav className="container mx-auto px-4 py-4">
            <ul className="space-y-4">
              <li>
                <Link
                  href="/"
                  className={`block text-white hover:text-gray-300 font-medium ${pathname === "/" ? "text-white/70" : ""}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className={`block text-white hover:text-gray-300 font-medium ${pathname === "/products" ? "text-white/70" : ""}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Shop
                </Link>
              </li>
              <li>
                <Link
                  href="/lens"
                  className={`block text-white hover:text-gray-300 font-medium ${pathname === "/lens" ? "text-white/70" : ""}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Lens
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className={`block text-white hover:text-gray-300 font-medium ${pathname === "/categories" ? "text-white/70" : ""}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Categories
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className={`block text-white hover:text-gray-300 font-medium ${pathname === "/about" ? "text-white/70" : ""}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  )
}
