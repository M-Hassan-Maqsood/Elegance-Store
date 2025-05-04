"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Search, ShoppingBag, User, Menu, X, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/cart-context"
import { useWishlist } from "@/context/wishlist-context"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { itemCount: cartItemCount } = useCart()
  const { itemCount: wishlistItemCount } = useWishlist()
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
      setIsSearchOpen(false)
    }
  }

  // Filter out the Contact navigation item
  const navigation = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: "Lens", href: "/lens" },
    { name: "About", href: "/about" },
  ]

  return (
    <header className="bg-black text-white shadow-lg">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex">
              <span className="sr-only">Elegance</span>
              <div className="h-8 w-auto text-xl font-bold text-white">ELEGANCE</div>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:space-x-10">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm uppercase tracking-wider font-medium transition-all duration-300 ${
                  pathname === item.href 
                  ? "text-white border-b border-white/50" 
                  : "text-white/80 hover:text-white"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            {/* Search - Mirror Icon Only */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSearchOpen(!isSearchOpen)} 
              className="text-white hover:bg-white/10 relative overflow-hidden group"
            >
              <Search className="h-5 w-5 transform transition-transform duration-300 group-hover:scale-110" />
              <span className="absolute inset-0 bg-white/10 scale-0 rounded-full group-hover:scale-100 transition-transform duration-300"></span>
            </Button>

            {/* Wishlist */}
            <div className="flow-root">
              <Link href="/wishlist" className="group flex items-center p-2 relative overflow-hidden">
                <Heart className="h-6 w-6 flex-shrink-0 text-white/80 group-hover:text-white transition-colors duration-300" aria-hidden="true" />
                <span className="ml-1 text-sm font-medium text-white/80 group-hover:text-white transition-colors duration-300">
                  {wishlistItemCount}
                </span>
                <span className="sr-only">items in wishlist, view wishlist</span>
              </Link>
            </div>

            {/* Cart */}
            <div className="flow-root">
              <Link href="/cart" className="group flex items-center p-2 relative overflow-hidden">
                <ShoppingBag
                  className="h-6 w-6 flex-shrink-0 text-white/80 group-hover:text-white transition-colors duration-300"
                  aria-hidden="true"
                />
                <span className="ml-1 text-sm font-medium text-white/80 group-hover:text-white transition-colors duration-300">
                  {cartItemCount}
                </span>
                <span className="sr-only">items in cart, view cart</span>
              </Link>
            </div>

            {/* Account */}
            <div className="flow-root">
              <Link href="/account" className="group flex items-center p-2 relative overflow-hidden">
                <User className="h-6 w-6 flex-shrink-0 text-white/80 group-hover:text-white transition-colors duration-300" aria-hidden="true" />
                <span className="sr-only">Account</span>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md p-2 text-white/80 hover:bg-white/10 hover:text-white"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search bar - Only shown when mirror icon is clicked */}
        {isSearchOpen && (
          <div className="border-t border-white/10 py-4 px-4 transition-all duration-300">
            <div className="mx-auto max-w-2xl">
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full rounded-l-md bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-white/30 focus:ring-white/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                <Button type="submit" className="rounded-l-none bg-white text-black hover:bg-white/80">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="space-y-1 pb-3 pt-2 border-t border-white/10">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 text-base font-medium ${
                    pathname === item.href
                      ? "bg-white/10 text-white"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
