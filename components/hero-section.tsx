import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HeroSection() {
  return (
    <div className="relative bg-[url('/hero-bg.jpg')] bg-cover bg-center h-[90vh]">
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-start">
        <div className="max-w-xl">
          <h1 className="text-5xl md:text-7xl font-playfair text-white font-bold mb-6 leading-tight">
            Elegance in Every Detail
          </h1>
          <p className="text-lg md:text-xl text-white mb-8 leading-relaxed">
            Discover our new collection of premium ladies clothing designed for the modern woman who appreciates
            timeless style
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="bg-white text-black hover:bg-white/90 px-8 py-6 text-base">
              <Link href="/products">Shop Collection</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white/10 px-8 py-6 text-base"
            >
              <Link href="/categories">View Categories</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
