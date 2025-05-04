"use client"

import type React from "react"

import { useState } from "react"
import type { Product } from "@/lib/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@supabase/supabase-js"
import { Pencil, Trash2, Check, X, ImageIcon } from "lucide-react"
import NextImage from "next/image"
import Link from "next/link"

// Create a Supabase client for the browser
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface ProductListProps {
  products: Product[]
  loading: boolean
  onRefresh: () => Promise<void>
}

export default function ProductList({ products, loading, onRefresh }: ProductListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editForm, setEditForm] = useState<Partial<Product>>({})

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setEditForm({ ...product })
  }

  const handleCancelEdit = () => {
    setEditingProduct(null)
    setEditForm({})
  }

  const handleSaveEdit = async () => {
    if (!editingProduct || !editForm) return

    try {
      const { error } = await supabase
        .from("products")
        .update({
          name: editForm.name,
          description: editForm.description,
          price: editForm.price,
          category: editForm.category,
          availability: editForm.availability,
          color: editForm.color,
          sizes: editForm.sizes,
          featured: editForm.featured,
        })
        .eq("code", editingProduct.code)

      if (error) {
        console.error("Error updating product:", error)
        alert("Failed to update product")
      } else {
        await onRefresh()
        setEditingProduct(null)
        setEditForm({})
      }
    } catch (error) {
      console.error("Error updating product:", error)
      alert("Failed to update product")
    }
  }

  const handleDelete = async (code: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      const { error } = await supabase.from("products").delete().eq("code", code)

      if (error) {
        console.error("Error deleting product:", error)
        alert("Failed to delete product")
      } else {
        await onRefresh()
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      alert("Failed to delete product")
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked
      setEditForm({ ...editForm, [name]: checked })
    } else if (name === "price") {
      setEditForm({ ...editForm, [name]: Number.parseFloat(value) })
    } else {
      setEditForm({ ...editForm, [name]: value })
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading products...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Input
          type="search"
          placeholder="Search products..."
          className="max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button onClick={onRefresh}>Refresh</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Availability</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.code}>
                  {editingProduct?.code === product.code ? (
                    // Edit mode
                    <>
                      <TableCell>
                        {product.image_url ? (
                          <div className="relative h-16 w-16">
                            <NextImage
                              src={product.image_url || "/placeholder.svg"}
                              alt={product.name}
                              fill
                              className="object-cover rounded"
                            />
                          </div>
                        ) : (
                          <div className="h-16 w-16 bg-gray-200 rounded flex items-center justify-center">
                            <ImageIcon className="text-gray-500" size={24} />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{product.code}</TableCell>
                      <TableCell>
                        <Input
                          name="name"
                          value={editForm.name || ""}
                          onChange={handleInputChange}
                          className="w-full"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          name="price"
                          type="number"
                          value={editForm.price || 0}
                          onChange={handleInputChange}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <select
                          name="category"
                          value={editForm.category || ""}
                          onChange={handleInputChange}
                          className="w-full p-2 border rounded"
                        >
                          <option value="3 Piece">3 Piece</option>
                          <option value="2 Piece">2 Piece</option>
                          <option value="Printed">Printed</option>
                          <option value="Other">Other</option>
                        </select>
                      </TableCell>
                      <TableCell>
                        <select
                          name="availability"
                          value={editForm.availability || ""}
                          onChange={handleInputChange}
                          className="w-full p-2 border rounded"
                        >
                          <option value="In Stock">In Stock</option>
                          <option value="Out of Stock">Out of Stock</option>
                        </select>
                      </TableCell>
                      <TableCell>
                        <input
                          type="checkbox"
                          name="featured"
                          checked={editForm.featured || false}
                          onChange={handleInputChange}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={handleSaveEdit}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </>
                  ) : (
                    // View mode
                    <>
                      <TableCell>
                        {product.image_url ? (
                          <div className="relative h-16 w-16">
                            <NextImage
                              src={product.image_url || "/placeholder.svg"}
                              alt={product.name}
                              fill
                              className="object-cover rounded"
                            />
                          </div>
                        ) : (
                          <div className="h-16 w-16 bg-gray-200 rounded flex items-center justify-center">
                            <ImageIcon className="text-gray-500" size={24} />
                          </div>
                        )}
                      </TableCell>

                      <TableCell>{product.code}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>Rs. {product.price.toLocaleString()}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            product.availability === "In Stock"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.availability}
                        </span>
                      </TableCell>
                      <TableCell>{product.featured ? "Yes" : "No"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/products/${product.code}/images`}>
                            <Button size="sm" variant="outline">
                              <ImageIcon className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDelete(product.code)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
