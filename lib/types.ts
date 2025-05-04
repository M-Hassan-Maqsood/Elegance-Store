export interface Product {
  id: number
  code: string
  name: string
  description: string
  price: number
  availability: string
  color: string
  category: string
  sizes: string
  image_url: string | null
  product_link: string | null
  featured: boolean
  created_at?: string
  updated_at?: string
}

// Database schema representation for reference
export interface DatabaseProduct {
  id?: number
  ID: string
  "Product Name": string
  "Product Description": string
  Price: number
  Availability: string
  Color: string
  Category: string
  Sizes: string
  "Img Path": string | null
  "Product Link": string | null
  featured?: boolean
  created_at?: string
  updated_at?: string
}
