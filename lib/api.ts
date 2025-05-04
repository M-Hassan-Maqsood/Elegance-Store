import type { Product, ProductCategory } from "@/types/product"
import { supabase } from "./supabase/client"

export async function getFeaturedProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from("products").select("*").eq("featured", true)

  if (error) {
    console.error("Error fetching featured products:", error)
    return []
  }

  return data || []
}

export async function getCategories(): Promise<ProductCategory[]> {
  const { data, error } = await supabase.from("products").select("Category").not("Category", "is", null)

  if (error) {
    console.error("Error fetching categories:", error)
    return []
  }

  // Count products in each category
  const categories: Record<string, number> = {}
  data.forEach((item) => {
    if (item.Category) {
      categories[item.Category] = (categories[item.Category] || 0) + 1
    }
  })

  return Object.entries(categories).map(([name, count]) => ({
    name,
    count,
  }))
}

export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from("products").select("*")

  if (error) {
    console.error("Error fetching all products:", error)
    return []
  }

  return data || []
}

export async function searchProducts(query: string): Promise<Product[]> {
  const { data, error } = await supabase.from("products").select("*").ilike("Product Name", `%${query}%`)

  if (error) {
    console.error(`Error searching products with query "${query}":`, error)
    return []
  }

  return data || []
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const { data, error } = await supabase.from("products").select("*").eq("Category", category)

  if (error) {
    console.error(`Error fetching products for category ${category}:`, error)
    return []
  }

  return data || []
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase.from("products").select("*").eq("ID", id).single()

  if (error) {
    console.error(`Error fetching product with id ${id}:`, error)
    return null
  }

  return data
}

export async function getRelatedProducts(productId: string, category: string, limit = 4): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("Category", category)
    .neq("ID", productId)
    .limit(limit)

  if (error) {
    console.error("Error fetching related products:", error)
    return []
  }

  return data || []
}

// Get products by specified codes
export async function getProductsByCode(codes: string[]): Promise<Product[]> {
  try {
    if (!codes || codes.length === 0) {
      return [];
    }
    
    // Using Supabase's 'in' operator to directly fetch the products with matching IDs
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .in("ID", codes);
      
    if (error) {
      console.error("Error fetching products by code:", error);
      return [];
    }
    
    // Log for debugging
    console.log(`Found ${data?.length || 0} products for codes: ${codes.join(', ')}`);
    
    return data || [];
  } catch (error) {
    console.error("Error fetching products by code:", error);
    return [];
  }
}

// Add the missing exports that are required for deployment
// These are aliases to our existing functions

export const fetchCategories = getCategories
export const fetchProductsByCategory = getProductsByCategory
export const fetchProductByCode = getProductById
export const fetchRelatedProducts = getRelatedProducts
