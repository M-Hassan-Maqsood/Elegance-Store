"use client"

import Link from "next/link"
import Image from "next/image"
import { Heart, ShoppingBag, Trash2 } from "lucide-react"
import { useWishlist } from "@/context/wishlist-context"
import { useCart } from "@/context/cart-context"
import { formatPrice, getImageUrl } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export default function WishlistPage() {
  const { items, removeItem } = useWishlist()
  const { addItem } = useCart()

  const addToCart = (productId: string) => {
    const wishlistItem = items.find((item) => item.product.ID === productId)
    if (wishlistItem) {
      addItem(wishlistItem.product, 1)
      // Optionally remove from wishlist after adding to cart
      // removeItem(productId);
    }
  }

  if (items.length === 0) {
    return (
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Your Wishlist</h1>
            <div className="mt-16 flex flex-col items-center">
              <Heart className="h-16 w-16 text-gray-400" />
              <h2 className="mt-4 text-lg font-medium text-gray-900">Your wishlist is empty</h2>
              <p className="mt-2 text-gray-500">Save items you love to your wishlist and revisit them anytime.</p>
              <div className="mt-6">
                <Link href="/products">
                  <Button>Continue Shopping</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Your Wishlist</h1>
        <div className="mt-12">
          <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <li
                key={item.product.ID}
                className="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-white shadow"
              >
                <div className="relative flex flex-1 flex-col p-4">
                  <div className="aspect-h-4 aspect-w-3 bg-gray-100 sm:aspect-none sm:h-60">
                    <Image
                      src={getImageUrl(item.product["Img Path"] || item.product.ID)}
                      alt={item.product["Product Name"]}
                      width={300}
                      height={400}
                      className="h-full w-full object-cover object-center sm:h-full sm:w-full"
                    />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-900">
                      <Link href={`/products/${item.product.ID}`}>{item.product["Product Name"]}</Link>
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">{item.product.Category}</p>
                    <p className="mt-1 text-base font-medium text-gray-900">{formatPrice(item.product.Price)}</p>
                  </div>
                </div>
                <div className="flex divide-x divide-gray-200">
                  <div className="flex w-0 flex-1">
                    <button
                      type="button"
                      className="relative inline-flex w-0 flex-1 items-center justify-center gap-x-2 rounded-bl-lg border border-transparent py-4 text-sm font-medium text-gray-900 hover:text-indigo-600"
                      onClick={() => addToCart(item.product.ID)}
                    >
                      <ShoppingBag className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      Add to Cart
                    </button>
                  </div>
                  <div className="-ml-px flex w-0 flex-1">
                    <button
                      type="button"
                      className="relative inline-flex w-0 flex-1 items-center justify-center gap-x-2 rounded-br-lg border border-transparent py-4 text-sm font-medium text-gray-900 hover:text-red-600"
                      onClick={() => removeItem(item.product.ID)}
                    >
                      <Trash2 className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
