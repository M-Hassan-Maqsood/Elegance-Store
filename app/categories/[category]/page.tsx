import { Suspense } from "react"
import { getProductsByCategory, getCategories } from "@/lib/api"
import { ProductGrid } from "@/components/ui/product-grid"
import { CategoryFilter } from "@/components/ui/category-filter"

interface CategoryPageProps {
  params: {
    category: string
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = decodeURIComponent(params.category)
  const products = await getProductsByCategory(category)
  const categories = await getCategories()

  return (
    <div>
      <CategoryFilter categories={categories} />
      <Suspense fallback={<div>Loading products...</div>}>
        <ProductGrid products={products} title={`${category} Collection`} />
      </Suspense>
    </div>
  )
}

export async function generateStaticParams() {
  const categories = await getCategories()

  return categories.map((category) => ({
    category: encodeURIComponent(category.name),
  }))
}
