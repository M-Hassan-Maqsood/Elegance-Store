"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Newsletter() {
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would send this to your API
    setSubscribed(true)
  }

  return (
    <section className="py-24 bg-[url('/newsletter-bg.jpg')] bg-cover bg-center relative">
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-4xl font-playfair font-bold mb-6">Join Our Community</h2>
          <p className="text-lg mb-8 leading-relaxed">
            Subscribe to receive updates on new arrivals, special offers and exclusive events. Be the first to know
            about our latest collections.
          </p>

          {subscribed ? (
            <div className="bg-white/10 text-white p-6 rounded-md backdrop-blur-sm">
              <h3 className="text-xl font-medium mb-2">Thank You for Subscribing!</h3>
              <p>We'll keep you updated with our latest collections and offers.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-grow bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:border-white"
              />
              <Button type="submit" className="bg-white hover:bg-white/90 text-black font-medium px-8">
                Subscribe
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
