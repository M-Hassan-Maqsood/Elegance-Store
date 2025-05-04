"use client"
import Image from "next/image"
import Link from "next/link"
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { formatPrice, getImageUrl } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, itemCount } = useCart()

  if (items.length === 0) {
    return (
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Your Cart</h1>
            <div className="mt-16 flex flex-col items-center">
              <ShoppingBag className="h-16 w-16 text-gray-400" />
              <h2 className="mt-4 text-lg font-medium text-gray-900">Your cart is empty</h2>
              <p className="mt-2 text-gray-500">Looks like you haven't added any products to your cart yet.</p>
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
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Your Cart</h1>
        <div className="mt-12 lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start xl:gap-x-16">
          <div className="lg:col-span-7">
            <ul role="list" className="divide-y divide-gray-200 border-t border-b border-gray-200">
              {items.map((item) => (
                <li key={`${item.product.ID}-${item.selectedSize}`} className="flex py-6 sm:py-8">
                  <div className="flex-shrink-0">
                    <Image
                      src={getImageUrl(item.product["Img Path"] || item.product.ID)}
                      alt={item.product["Product Name"]}
                      width={120}
                      height={120}
                      className="h-24 w-24 rounded-md object-cover object-center sm:h-32 sm:w-32"
                    />
                  </div>

                  <div className="ml-4 flex flex-1 flex-col sm:ml-6">
                    <div>
                      <div className="flex justify-between">
                        <h3 className="text-sm">
                          <Link
                            href={`/products/${item.product.ID}`}
                            className="font-medium text-gray-700 hover:text-gray-800"
                          >
                            {item.product["Product Name"]}
                          </Link>
                        </h3>
                        <p className="ml-4 text-sm font-medium text-gray-900">{formatPrice(item.product.Price)}</p>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        {item.product.Color && `${item.product.Color} · `}
                        {item.selectedSize}
                      </p>
                    </div>

                    <div className="mt-4 flex flex-1 items-end justify-between">
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <button
                          type="button"
                          className="p-2 text-gray-600 hover:text-gray-500"
                          onClick={() => updateQuantity(item.product.ID, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <span className="sr-only">Decrease quantity</span>
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-4 text-gray-900">{item.quantity}</span>
                        <button
                          type="button"
                          className="p-2 text-gray-600 hover:text-gray-500"
                          onClick={() => updateQuantity(item.product.ID, item.quantity + 1)}
                        >
                          <span className="sr-only">Increase quantity</span>
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        type="button"
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                        onClick={() => removeItem(item.product.ID)}
                      >
                        <span className="sr-only">Remove</span>
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Order summary */}
          <div className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8">
            <h2 className="text-lg font-medium text-gray-900">Order summary</h2>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Subtotal</p>
                <p className="text-sm font-medium text-gray-900">{formatPrice(total)}</p>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-600">Shipping estimate</p>
                <p className="text-sm font-medium text-gray-900">Calculated at checkout</p>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <p className="text-base font-medium text-gray-900">Order total</p>
                <p className="text-base font-medium text-gray-900">{formatPrice(total)}</p>
              </div>
            </div>

            <div className="mt-6">
              <Button className="w-full">
                Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
