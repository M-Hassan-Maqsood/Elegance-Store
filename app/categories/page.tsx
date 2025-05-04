import Link from "next/link"
import Image from "next/image"
import { fetchCategories } from "@/lib/api"

export default async function CategoriesPage() {
  const categories = await fetchCategories()

  // Map categories to images and descriptions
  const categoryDetails = [
    {
      name: "3 Piece",
      image: "/category-3piece.jpg",
      description: "Complete ensembles for a coordinated look",
    },
    {
      name: "2 Piece",
      image: "/category-2piece.jpg",
      description: "Versatile separates for mix and match styling",
    },
    {
      name: "Printed",
      image: "/category-printed.jpg",
      description: "Bold patterns and vibrant designs",
    },
  ]

  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-playfair font-bold text-center mb-12">Shop By Category</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {categoryDetails.map((category) => (
          <Link
            href={`/category/${encodeURIComponent(category.name)}`}
            key={category.name}
            className="group block relative h-[400px] overflow-hidden"
          >
            <Image
              src={category.image || "/placeholder.svg?height=400&width=300"}
              alt={category.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
              <h3 className="text-2xl font-playfair font-bold mb-2">{category.name}</h3>
              <p className="text-center mb-4">{category.description}</p>
              <span className="border-b border-white pb-1 group-hover:border-b-2 transition-all">Shop Now</span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
