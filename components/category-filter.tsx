"use client"

import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"

interface CategoryFilterProps {
  categories: string[]
  activeCategory?: string
}

export default function CategoryFilter({ categories, activeCategory }: CategoryFilterProps) {
  const router = useRouter()
  const pathname = usePathname()

  const isHomePage = pathname === "/"

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold mb-4">Categories</h2>
      <ul className="space-y-2">
        <li>
          <Link
            href="/"
            className={`block px-3 py-2 rounded-md ${isHomePage ? "bg-pink-100 text-pink-800" : "hover:bg-gray-100"}`}
          >
            All Products
          </Link>
        </li>
        {categories.map((category) => (
          <li key={category}>
            <Link
              href={`/category/${encodeURIComponent(category)}`}
              className={`block px-3 py-2 rounded-md ${category === activeCategory ? "bg-pink-100 text-pink-800" : "hover:bg-gray-100"}`}
            >
              {category}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
