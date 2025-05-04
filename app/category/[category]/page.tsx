import ProductGrid from "@/components/product-grid"
import CategoryFilter from "@/components/category-filter"
import { fetchProductsByCategory, fetchCategories } from "@/lib/api"

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const decodedCategory = decodeURIComponent(params.category)
  const products = await fetchProductsByCategory(decodedCategory)
  const categories = await fetchCategories()

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">{decodedCategory}</h1>
      <div className="flex flex-col md:flex-row gap-6">
        <aside className="w-full md:w-64">
          <CategoryFilter categories={categories} activeCategory={decodedCategory} />
        </aside>
        <div className="flex-1">
          <ProductGrid products={products} />
        </div>
      </div>
    </main>
  )
}
