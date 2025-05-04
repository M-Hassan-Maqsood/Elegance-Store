import { Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ArrowUpRight, ChevronRight } from "lucide-react"

import { getFeaturedProducts, getCategories } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Badge } from "@/components/ui/badge"
import HeroCarousel from "@/components/hero-carousel"

export default async function Home() {
  const featuredProducts = await getFeaturedProducts()
  const categories = await getCategories()
  const newArrivals = featuredProducts.slice(0, 6) // Use first 6 featured products as new arrivals

  // Hero carousel slides data
  const heroSlides = [
    {
      id: 1,
      image: "/imgrt/FESTIVE_FORMAL_25_Desktop 3.webp",
      link: "/products?collection=summer"
     
    },
    {
      id: 2,
      image: "/imgrt/Signature_Desktop_Banner 1.webp",
      link: "/products?collection=summer"
      
    },
    {
      id: 3,
      image: "/imgrt/Chikankar_25_-_Desktop 2.webp",
      link: "/products?tag=premium"
      
    },
    {
      id: 4,
      image: "/imgrt/9.jpg",
      link: "/products?tag=timeless",
      title: "in the spotlight:",
      subtitle: "Signature collection 2025"
    }
  ]

  return (
    <main className="bg-[#0a0a0a] overflow-hidden text-white">
      {/* Hero Carousel Section */}
      <section className="relative">
        <HeroCarousel slides={heroSlides} />
        
        {/* Brand Name - Bold Text at Top Left */}
        <div className="absolute top-12 left-12 z-20">
          <div className="font-serif text-2xl md:text-4xl font-bold tracking-tighter">
            <span className="text-white drop-shadow-lg">ELEGANCE</span>
          </div>
        </div>
        
        {/* Explore Now Button - Bottom Left */}
        <div className="absolute bottom-24 left-12 z-20">
          <Link href="/products" className="group">
            <div className="flex flex-col items-start">
              <span className="text-white text-xs uppercase tracking-widest mb-3">DISCOVER MORE</span>
              <div className="flex items-center">
                <Button variant="outline" className="text-white bg-transparent border-white hover:bg-white hover:text-black transition-all duration-300 text-lg px-8 py-6">
                  Explore Now
                </Button>
              </div>
            </div>
          </Link>
        </div>
      </section>
      
      {/* Brand Statement - Bold, Luxury Typography */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <span className="text-[20rem] md:text-[30rem] font-serif italic text-white/5 select-none pointer-events-none">E</span>
          </div>
        </div>
        
        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-sm uppercase tracking-[0.4em] text-white/60 mb-8 font-serif text-center">Elegance Defined</h2>
            <h1 className="text-4xl md:text-7xl lg:text-8xl font-light text-white mb-16 font-serif leading-tight text-center">
              <span className="block">The Art of</span>
              <span className="block italic">Extraordinary</span>
              <span className="block">Style</span>
            </h1>
            <div className="flex justify-center">
              <div className="h-px w-32 bg-white/20"></div>
            </div>
            <p className="text-xl md:text-2xl text-white/70 mt-16 mb-12 font-light text-center max-w-3xl mx-auto leading-relaxed">
              Fashion is not merely about clothing—it is an expression of identity, a statement of intent,
              and a celebration of artisanal excellence. Welcome to Elegance.
            </p>
            <div className="flex justify-center">
              <Link href="/about" className="group flex items-center border-b border-white/30 pb-2 hover:border-white transition-colors">
                <span className="text-white/80 group-hover:text-white transition-colors text-lg">Discover Our Philosophy</span>
                <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Bold Category Grid with Dramatic Overlays */}
      <section className="relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {categories.slice(0, 3).map((category, index) => (
            <Link href={`/categories/${encodeURIComponent(category.name)}`} key={category.name} className="group relative">
              <div className="relative h-[95vh]">
                <Image
                  src={`/imgrt/${2 + index}.jpg`}
                  alt={category.name}
                  fill
                  className="object-cover transition-all duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-opacity group-hover:opacity-90 duration-700"></div>
                
                <div className="absolute inset-0 flex flex-col justify-end p-12 md:p-16">
                  <span className="text-white/60 text-xs uppercase tracking-[0.3em] mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-700 transform translate-y-4 group-hover:translate-y-0">Collection</span>
                  <h3 className="text-3xl md:text-5xl font-light text-white mb-10 font-serif transform translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
                    {category.name}
                  </h3>
                  <div className="h-[1px] w-16 bg-white/40 mb-10 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-700"></div>
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-1000 delay-100 transform translate-y-8 group-hover:translate-y-0">
                    <span className="text-white uppercase tracking-wider text-sm mr-4">Explore</span>
                    <ArrowRight className="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Statement Collection Feature with Split Design */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 bottom-0 w-1/2 bg-white hidden lg:block"></div>
        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="relative order-2 lg:order-1">
              <div className="h-[80vh] md:h-[90vh] relative">
                <Image
                  src="/imgrt/10.jpg"
                  alt="Featured Collection"
                  fill
                  className="object-cover"
                />
                <div className="absolute -bottom-12 -left-12 hidden lg:block">
                  <div className="bg-[#0a0a0a] h-48 w-48 flex items-center justify-center">
                    <span className="font-serif italic text-5xl">01</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:pl-16 flex flex-col justify-center order-1 lg:order-2 text-white lg:text-black">
              <h2 className="text-sm uppercase tracking-[0.4em] text-white/60 lg:text-black/60 mb-8 font-serif">The Statement Collection</h2>
              <h3 className="text-3xl md:text-5xl font-light mb-12 font-serif leading-tight">
                <span className="block">Defying</span>
                <span className="block italic">Conventions</span>
              </h3>
              <p className="text-white/70 lg:text-black/70 leading-relaxed mb-12 text-lg">
                Our latest collection challenges the boundaries of traditional fashion, juxtaposing 
                architectural silhouettes with fluid draping. Each piece is a dialogue between 
                structure and movement, strength and vulnerability.
              </p>
              <p className="text-white/70 lg:text-black/70 leading-relaxed mb-16 text-lg">
                Crafted from the rarest of fabrics by master artisans, this collection embodies 
                our uncompromising commitment to innovation and excellence.
              </p>
              <Link href="/products?collection=featured">
                <Button variant="outline" size="lg" className="rounded-none px-14 py-8 w-fit text-lg border-white/60 lg:border-black/60 text-white lg:text-black hover:bg-white lg:hover:bg-black hover:text-black lg:hover:text-white transition-all duration-500">
                  View The Collection
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Dramatic New Arrivals Showcase */}
      <section className="py-32 bg-[#0a0a0a]">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-24">
            <div>
              <h2 className="text-sm uppercase tracking-[0.4em] text-white/60 mb-6 font-serif">The Latest</h2>
              <h3 className="text-4xl md:text-6xl font-light font-serif text-white">New Arrivals</h3>
            </div>
            <Link href="/products?sort=newest" className="mt-8 md:mt-0 group flex items-center text-white/60 hover:text-white">
              <span className="text-lg">View All</span>
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
            <Suspense fallback={<div className="col-span-3 text-center py-12 text-white/60">Curating new arrivals...</div>}>
              {newArrivals.slice(0, 3).map((product) => (
                <Link href={`/products/${product.code}`} key={product.id} className="group relative block overflow-hidden">
                  <div className="aspect-[3/4] relative overflow-hidden">
                    <Image
                      src={product.imagePath || `/imgrt/image_${product.id % 5}.jpg`}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="absolute inset-0 p-8 flex flex-col justify-end">
                      <h3 className="font-serif text-2xl text-white transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                        {product.name}
                      </h3>
                      <div className="flex items-center mt-4 transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                        <span className="text-white text-lg font-light">${product.price.toFixed(2)}</span>
                        {product.originalPrice > product.price && (
                          <span className="ml-3 text-white/50 line-through font-light">
                            ${product.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {product.isNew && (
                      <div className="absolute top-6 left-6 rotate-90 origin-left">
                        <div className="flex items-center">
                          <div className="h-px w-8 bg-white/70 mr-3"></div>
                          <span className="text-white text-xs uppercase tracking-widest">New</span>
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </Suspense>
          </div>
        </div>
      </section>

      {/* Editorial Showcase - Full Bleed Split Design */}
      <section className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        <div className="relative h-[60vh] lg:h-auto order-2 lg:order-1">
          <Image
            src="/imgrt/11.jpg"
            alt="Editorial"
            fill
            className="object-cover"
          />
        </div>
        
        <div className="bg-white text-black p-16 lg:p-24 flex flex-col justify-center order-1 lg:order-2">
          <div className="max-w-xl">
            <h2 className="text-sm uppercase tracking-[0.4em] text-black/60 mb-8 font-serif">The Editorial</h2>
            <h3 className="text-4xl md:text-6xl font-light mb-12 font-serif leading-tight">
              <span className="block">Beyond</span>
              <span className="block italic">Fashion</span>
            </h3>
            <p className="text-black/70 leading-relaxed mb-12 text-lg">
              Our editorial collection transcends conventional fashion, exploring the intersection 
              of art, architecture, and personal expression. Each piece is a statement—bold yet 
              refined, provocative yet elegant.
            </p>
            <p className="text-black/70 leading-relaxed mb-16 text-lg">
              Discover these signature pieces that define the Elegance aesthetic and 
              embody our commitment to timeless sophistication.
            </p>
            <Link href="/products?collection=editorial">
              <Button className="rounded-none px-14 py-8 bg-transparent border border-black hover:bg-black hover:text-white transition-all duration-500 text-lg">
                View Editorial Collection
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Artistic Testimonial Display - Avant-Garde Design */}
      <section className="relative py-32 bg-black">
        {/* Abstract shapes in background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-64 top-0 w-[500px] h-[500px] rounded-full border border-white/5"></div>
          <div className="absolute left-20 bottom-40 w-[300px] h-[300px] rounded-full border border-white/5"></div>
          <div className="absolute left-1/2 top-1/4 w-[200px] h-[1px] bg-white/10 rotate-45"></div>
        </div>
        
        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          {/* Diagonal header */}
          <div className="relative mb-40">
            <div className="absolute -left-8 top-0 w-24 h-[1px] bg-white/30 -rotate-45"></div>
            <h2 className="text-xs uppercase tracking-[0.5em] text-white/70 ml-16">Voices</h2>
          </div>
          
          {/* Vertical testimonial layout with staggered design */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-y-40">
            {[
              {
                quote: "ELEGANCE pieces have become the foundation of my wardrobe. The quality and timeless design transcend seasonal trends.",
                author: "Sophia R.",
                location: "New York",
                number: "01",
                image: "/imgrt/g1.jpeg", // Person image
                clothingImage: "/imgrt/13.jpg", // Featured clothing image
              },
              {
                quote: "I appreciate the exceptional attention to detail in every garment. Each piece feels specially crafted as if it were made exclusively for me.",
                author: "Emma L.",
                location: "Paris",
                number: "02",
                image: "/imgrt/g2.jpg", // Person image
                clothingImage: "/imgrt/4.jpg", // Featured clothing image
              },
              {
                quote: "The perfect balance of classic and avant-garde. These pieces make me feel powerful, confident, and unapologetically sophisticated.",
                author: "Isabella M.",
                location: "Milan",
                number: "03",
                image: "/imgrt/g3.jpg", // Person image
                clothingImage: "/imgrt/9.jpg", // Featured clothing image
              }
            ].map((testimonial, i) => (
              <div key={i} className={`relative ${
                i % 2 === 0 ? 'md:col-span-8 md:col-start-1' : 'md:col-span-8 md:col-start-5'
              }`}>
                {/* Vertical line */}
                <div className="absolute top-0 left-0 w-[1px] h-full bg-gradient-to-b from-white/5 to-transparent"></div>
                
                {/* Large transparent number */}
                <div className="absolute -top-20 -left-4 pointer-events-none select-none">
                  <span className="font-serif text-[10rem] font-bold text-white opacity-[0.03]">{testimonial.number}</span>
                </div>
                
                {/* Feature clothing image with overlay effect */}
                <div className="mb-10 ml-8">
                  <div className="relative h-[220px] overflow-hidden">
                    <Image
                      src={testimonial.clothingImage}
                      alt="Featured clothing"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/0 to-black/60"></div>
                    <div className="absolute bottom-4 right-4">
                      <div className="px-3 py-1 bg-white/10 backdrop-blur-sm text-xs text-white uppercase tracking-wider">
                        Featured piece
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="ml-8 pl-12 border-l border-white/10">
                  <div className="relative mb-12">
                    <span className="absolute -top-3 -left-16 text-3xl text-white">"</span>
                    <p className="text-xl md:text-2xl lg:text-3xl text-white font-light leading-relaxed">
                      {testimonial.quote}
                    </p>
                    <span className="absolute bottom-0 right-0 text-3xl text-white">"</span>
                  </div>
                  
                  {/* Distinctive author display with image */}
                  <div className="flex items-center">
                    <div className="h-16 w-16 relative overflow-hidden rounded-full border border-white/10">
                      <Image
                        src={testimonial.image}
                        alt={testimonial.author}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-full"></div>
                    </div>
                    <div className="ml-6">
                      <p className="text-white font-serif tracking-wider">{testimonial.author}</p>
                      <div className="flex items-center mt-1">
                        <div className="h-px w-4 bg-white/40 mr-2"></div>
                        <p className="text-white/40 text-xs">{testimonial.location}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Decorative element unique to each testimonial */}
                <div className={`absolute ${i % 2 === 0 ? 'right-0' : 'left-0'} top-1/2 w-12 h-12`}>
                  <div className={`w-full h-full ${
                    i === 0 ? 'border border-white/10' : 
                    i === 1 ? 'rounded-full border border-white/10' : 
                    'rotate-45 border border-white/10'
                  }`}></div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Abstract decorative elements at bottom */}
          <div className="mt-32 flex justify-between">
            <div className="w-1/3 h-px bg-gradient-to-r from-transparent to-white/10"></div>
            <div className="w-1/5 h-px bg-white/10"></div>
            <div className="w-1/4 h-px bg-gradient-to-l from-transparent to-white/10"></div>
          </div>
        </div>
      </section>

      {/* Visual Gallery Grid - Dramatic Layout */}
      <section className="bg-white py-32">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16">
            <div>
              <h2 className="text-sm uppercase tracking-[0.4em] text-black/60 mb-6 font-serif">Visual Journal</h2>
              <h3 className="text-3xl md:text-5xl font-light font-serif text-black">Our Aesthetic</h3>
            </div>
            <span className="mt-4 md:mt-0 text-black/50 font-light">@elegance</span>
          </div>
          
          <div className="grid grid-cols-4 md:grid-cols-6 gap-px">
            <div className="col-span-2 md:col-span-3 row-span-2 relative overflow-hidden group">
              <div className="aspect-square relative">
                <Image
                  src="/imgrt/12.jpg"
                  alt="Gallery image 1"
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-opacity duration-500 flex items-center justify-center">
                  <ArrowUpRight className="text-white h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            </div>
            
            <div className="col-span-2 md:col-span-1 relative overflow-hidden group">
              <div className="aspect-square relative">
                <Image
                  src="/imgrt/13.jpg"
                  alt="Gallery image 2"
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-opacity duration-500 flex items-center justify-center">
                  <ArrowUpRight className="text-white h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            </div>
            
            <div className="col-span-2 md:col-span-2 relative overflow-hidden group">
              <div className="aspect-square relative">
                <Image
                  src="/imgrt/14.jpg"
                  alt="Gallery image 3"
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-opacity duration-500 flex items-center justify-center">
                  <ArrowUpRight className="text-white h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            </div>
            
            <div className="col-span-2 md:col-span-1 relative overflow-hidden group">
              <div className="aspect-square relative">
                <Image
                  src="/imgrt/15.jpg"
                  alt="Gallery image 4"
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-opacity duration-500 flex items-center justify-center">
                  <ArrowUpRight className="text-white h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            </div>
            
            <div className="col-span-2 md:col-span-2 relative overflow-hidden group">
              <div className="aspect-square relative">
                <Image
                  src="/imgrt/5.jpg"
                  alt="Gallery image 5"
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-opacity duration-500 flex items-center justify-center">
                  <ArrowUpRight className="text-white h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bold Newsletter Signup */}
      <section className="py-32 bg-[#0a0a0a] relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="h-full w-full flex items-center justify-center">
            <span className="font-serif italic text-[40rem] text-white select-none pointer-events-none">E</span>
          </div>
        </div>
        
        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-sm uppercase tracking-[0.4em] text-white/60 mb-8 font-serif">Join Our World</h2>
            <h3 className="text-3xl md:text-5xl font-light mb-12 font-serif text-white">
              Experience Elegance
            </h3>
            <p className="text-white/70 leading-relaxed mb-16 text-lg">
              Subscribe to receive exclusive previews of new collections, private event invitations,
              and insights into the artistry behind our creations.
            </p>
            
            <form className="mt-8 relative max-w-xl mx-auto">
              <input
                type="email"
                placeholder="Your Email"
                className="w-full px-8 py-6 bg-transparent border-b border-white/20 focus:border-white/70 transition-colors outline-none text-white text-lg"
                required
              />
              <button type="submit" className="absolute right-0 top-1/2 -translate-y-1/2 text-white/60 hover:text-white">
                <ArrowRight className="h-6 w-6" />
              </button>
            </form>
            <p className="mt-8 text-xs text-white/40">
              By subscribing, you agree to our Privacy Policy and consent to receive updates from Elegance.
            </p>
          </div>
        </div>
      </section>

      {/* Minimalist Services Section */}
      <section className="py-16 bg-white text-black">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-neutral-200">
            <div className="bg-white p-12">
              <h4 className="text-sm uppercase tracking-[0.3em] mb-6 font-medium">Complimentary Delivery</h4>
              <p className="text-black/60 text-sm leading-relaxed">Enjoy free worldwide shipping on all orders over $200</p>
            </div>
            <div className="bg-white p-12">
              <h4 className="text-sm uppercase tracking-[0.3em] mb-6 font-medium">Personal Styling</h4>
              <p className="text-black/60 text-sm leading-relaxed">Our dedicated consultants are available for personalized advice</p>
            </div>
            <div className="bg-white p-12">
              <h4 className="text-sm uppercase tracking-[0.3em] mb-6 font-medium">Secure Transactions</h4>
              <p className="text-black/60 text-sm leading-relaxed">Multiple secure payment methods for your peace of mind</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
