"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import type { ProductCategory } from "@/types/product"

interface CategoryFilterProps {
  categories: ProductCategory[]
}

export function CategoryFilter({ categories }: CategoryFilterProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="bg-white">
      <div className="border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="hidden md:flex md:space-x-8">
              <Link
                href="/products"
                className={cn(
                  "inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium",
                  pathname === "/products"
                    ? "border-indigo-500 text-gray-900"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                )}
              >
                All Products
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.name}
                  href={`/categories/${encodeURIComponent(category.name)}`}
                  className={cn(
                    "inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium",
                    pathname === `/categories/${encodeURIComponent(category.name)}`
                      ? "border-indigo-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                  )}
                >
                  {category.name} ({category.count})
                </Link>
              ))}
            </div>

            {/* Mobile menu */}
            <div className="flex items-center md:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                onClick={() => setIsOpen(!isOpen)}
              >
                <span className="sr-only">Open main menu</span>
                {isOpen ? (
                  <svg
                    className="block h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg
                    className="block h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isOpen && (
        <div className="md:hidden">
          <div className="space-y-1 pb-3 pt-2">
            <Link
              href="/products"
              className={cn(
                "block border-l-4 py-2 pl-3 pr-4 text-base font-medium",
                pathname === "/products"
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700",
              )}
              onClick={() => setIsOpen(false)}
            >
              All Products
            </Link>
            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/categories/${encodeURIComponent(category.name)}`}
                className={cn(
                  "block border-l-4 py-2 pl-3 pr-4 text-base font-medium",
                  pathname === `/categories/${encodeURIComponent(category.name)}`
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700",
                )}
                onClick={() => setIsOpen(false)}
              >
                {category.name} ({category.count})
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
