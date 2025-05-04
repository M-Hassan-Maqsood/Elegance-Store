export type Product = {
  Id: number
  ID: string // Product code (e.g., ACA231001)
  "Product Name": string
  "Product Description": string
  Price: number
  Availability: string
  Color: string
  Sizes: string
  "Img Path": string
  "Product Link": string
  featured: boolean
  created_at: string
  updated_at: string
  Category: string
}

export type ProductCategory = {
  name: string
  count: number
}

export type ProductEmbedding = {
  id: number
  product_id: string
  embedding: number[]
  created_at: string
}

export type SimilarityResult = {
  product: Product
  similarity: number
}
