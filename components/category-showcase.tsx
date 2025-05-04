import Link from "next/link"
import Image from "next/image"

interface CategoryShowcaseProps {
  categories: string[]
}

export default function CategoryShowcase({ categories }: CategoryShowcaseProps) {
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
    <section className="py-20 bg-gray-50 -mx-4 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-playfair font-bold mb-6">Shop By Category</h2>
          <div className="w-24 h-1 bg-black mx-auto mb-6"></div>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Browse our collections by category to find your perfect style
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categoryDetails.map((category) => (
            <Link
              href={`/category/${encodeURIComponent(category.name)}`}
              key={category.name}
              className="group block relative h-[500px] overflow-hidden"
            >
              <Image
                src={category.image || "/placeholder.svg"}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
                <h3 className="text-3xl font-playfair font-bold mb-3">{category.name}</h3>
                <p className="text-center mb-6 text-lg">{category.description}</p>
                <span className="border-b-2 border-white pb-1 group-hover:border-b-2 transition-all text-lg">
                  Shop Now
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
