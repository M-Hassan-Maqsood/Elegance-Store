import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

export default function AboutPage() {
  return (
    <main className="bg-[#f8f7f6]">
      {/* Hero Section - Full-screen height with parallax effect */}
      <section className="relative h-[100vh] overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <Image 
            src="/imgrt/7.jpg" 
            alt="Elegance Brand" 
            fill 
            priority
            className="object-cover object-center opacity-90"
            style={{ transform: "scale(1.05)" }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent">
          <div className="container mx-auto h-full flex flex-col justify-end pb-32 px-6">
            <div className="max-w-3xl">
              <h2 className="font-light text-sm uppercase tracking-[0.4em] text-white/80 mb-6 font-serif">About Elegance</h2>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-light text-white mb-10 font-serif leading-[1.1]">
                The Art of <span className="italic">Refined</span> Sophistication
              </h1>
              <div className="w-32 h-[0.5px] bg-white/50 mb-10"></div>
              <p className="text-lg md:text-xl text-white/80 font-light max-w-xl">
                A legacy of timeless designs, crafted with extraordinary attention to detail
                and an unwavering commitment to elegance.
              </p>
            </div>
          </div>
        </div>

        {/* Elegant scroll indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-white/70 text-xs uppercase tracking-[0.2em]">Discover</span>
          <div className="h-16 w-[1px] bg-white/30"></div>
        </div>
      </section>

      {/* Philosophy section with asymmetric design */}
      <section className="relative py-32">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
            <div className="lg:col-span-2 lg:pt-24">
              <h2 className="text-sm uppercase tracking-[0.3em] text-neutral-500 mb-8 font-serif">Our Philosophy</h2>
              <h3 className="text-3xl md:text-4xl font-light mb-12 font-serif leading-tight">
                Where artistry meets <span className="italic">timeless</span> elegance
              </h3>
              <p className="text-neutral-600 mb-8 leading-relaxed">
                Founded on the principles of exceptional craftsmanship and refined aesthetics, 
                Elegance transcends conventional fashion paradigms to create pieces that exist 
                beyond the constraints of seasonal trends.
              </p>
              <p className="text-neutral-600 leading-relaxed">
                Our vision embraces the duality of modern sophistication and enduring style, 
                carefully balancing innovation with timeless design sensibilities.
              </p>
            </div>
            <div className="lg:col-span-3 relative">
              <div className="relative h-[70vh] w-full">
                <Image 
                  src="/imgrt/10.jpg" 
                  alt="Our Philosophy" 
                  fill 
                  className="object-cover" 
                />
              </div>
              <div className="absolute top-12 -left-6 md:-left-12 w-24 h-24 border border-neutral-300 bg-[#f8f7f6]/70 backdrop-blur-sm flex items-center justify-center">
                <span className="font-serif text-5xl font-light text-neutral-800">E</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Heritage section with side-by-side image and text */}
      <section className="py-32 bg-[#0a0a0a] text-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <div className="relative aspect-[3/4] w-full">
                <Image 
                  src="/imgrt/11.jpg" 
                  alt="Our Heritage" 
                  fill 
                  className="object-cover"
                />
              </div>
              
              {/* Decorative elements */}
              <div className="hidden lg:block absolute -bottom-12 -right-12 w-64 h-64 border border-neutral-800 z-0"></div>
              <div className="hidden lg:block absolute -top-8 -left-8 w-32 h-32 border border-neutral-700 z-0"></div>
            </div>
            
            <div className="relative z-10">
              <h2 className="text-sm uppercase tracking-[0.3em] text-neutral-400 mb-8 font-serif">Our Heritage</h2>
              <h3 className="text-3xl md:text-4xl font-light mb-12 font-serif leading-tight">
                A legacy of <span className="italic">extraordinary</span> craft
              </h3>
              <p className="text-neutral-300 mb-8 leading-relaxed">
                Since our founding in 2020, Elegance has cultivated a distinctive approach to luxury fashion, 
                guided by an unwavering pursuit of excellence in every aspect of our creations.
              </p>
              <p className="text-neutral-300 mb-12 leading-relaxed">
                Our journey began with a profound belief in creating garments that transcend mere clothing 
                to become expressions of individual grace and refined taste. This heritage of meticulous 
                craftsmanship and thoughtful design continues to define the Elegance aesthetic today.
              </p>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-[0.5px] bg-white/30"></div>
                <span className="text-neutral-400 uppercase tracking-wider text-sm">Est. 2020</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Craftsmanship section with unique layout */}
      <section className="py-36">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-24">
            <h2 className="text-sm uppercase tracking-[0.3em] text-neutral-500 mb-6 font-serif">Our Approach</h2>
            <h3 className="text-3xl md:text-5xl font-light font-serif max-w-3xl mx-auto leading-tight">
              The Pinnacle of <span className="italic">Artisanal</span> Excellence
            </h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-1">
            <div className="relative col-span-2 row-span-2">
              <div className="relative h-[90vh] w-full">
                <Image 
                  src="/imgrt/5.jpg" 
                  alt="Exquisite Materials" 
                  fill 
                  className="object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end">
                  <div className="p-12">
                    <h3 className="text-2xl text-white mb-4 font-serif">Exquisite Materials</h3>
                    <p className="text-white/90 max-w-lg">
                      We source only the most exceptional fabrics from select artisanal mills, 
                      prioritizing sustainable production methods and uncompromising quality.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative h-[45vh] w-full">
                <Image 
                  src="/imgrt/6.jpg" 
                  alt="Meticulous Tailoring" 
                  fill 
                  className="object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end">
                  <div className="p-6 lg:p-8">
                    <h3 className="text-xl text-white mb-2 font-serif">Meticulous Tailoring</h3>
                    <p className="text-white/90 text-sm">
                      Every garment is shaped by highly skilled artisans with decades of expertise.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative h-[45vh] w-full">
                <Image 
                  src="/imgrt/7.jpg" 
                  alt="Timeless Design" 
                  fill 
                  className="object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end">
                  <div className="p-6 lg:p-8">
                    <h3 className="text-xl text-white mb-2 font-serif">Timeless Design</h3>
                    <p className="text-white/90 text-sm">
                      Our designs transcend momentary trends to create enduring pieces of elegance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values section with sophisticated design */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-32">
              <h2 className="text-sm uppercase tracking-[0.3em] text-neutral-500 mb-6 font-serif">Our Values</h2>
              <h3 className="text-3xl md:text-5xl font-light font-serif leading-tight">
                The <span className="italic">Guiding</span> Principles
              </h3>
            </div>
            
            <div className="space-y-32">
              <div className="grid grid-cols-1 lg:grid-cols-3 items-center gap-16">
                <div className="lg:col-span-1">
                  <span className="font-serif text-8xl lg:text-9xl font-extralight text-neutral-200">01</span>
                </div>
                <div className="lg:col-span-2">
                  <h3 className="font-serif text-2xl md:text-3xl mb-8">Uncompromising Quality</h3>
                  <p className="text-neutral-600 leading-relaxed">
                    We pursue perfection in every aspect of our creations, from the selection of materials 
                    to the final stitch. Each garment undergoes rigorous quality control to ensure it 
                    meets our exacting standards before bearing the Elegance name.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 items-center gap-16">
                <div className="lg:col-span-1">
                  <span className="font-serif text-8xl lg:text-9xl font-extralight text-neutral-200">02</span>
                </div>
                <div className="lg:col-span-2">
                  <h3 className="font-serif text-2xl md:text-3xl mb-8">Conscious Creation</h3>
                  <p className="text-neutral-600 leading-relaxed">
                    Our commitment to ethical and sustainable practices guides every decision we make. 
                    We prioritize responsible sourcing, fair labor practices, and environmentally 
                    conscious production methods to create luxury fashion with integrity.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 items-center gap-16">
                <div className="lg:col-span-1">
                  <span className="font-serif text-8xl lg:text-9xl font-extralight text-neutral-200">03</span>
                </div>
                <div className="lg:col-span-2">
                  <h3 className="font-serif text-2xl md:text-3xl mb-8">Timeless Innovation</h3>
                  <p className="text-neutral-600 leading-relaxed">
                    We embrace the tension between heritage and innovation, finding inspiration in 
                    classical elegance while pushing boundaries to create distinctive pieces that 
                    transcend momentary trends and maintain their allure for years to come.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team section with artistic layout */}
      <section className="py-36 bg-[#f2f0ec]">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-sm uppercase tracking-[0.3em] text-neutral-500 mb-6 font-serif">The Visionaries</h2>
            <h3 className="text-3xl md:text-5xl font-light font-serif leading-tight mb-10">
              The Artisans Behind <span className="italic">Elegance</span>
            </h3>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Our team of dedicated visionaries brings decades of combined expertise in luxury
              fashion to create pieces that embody the perfect balance of artistry and wearability.
            </p>
          </div>
          
          <div className="grid grid-cols-12 gap-2 md:gap-4">
            <div className="col-span-7">
              <div className="relative h-[70vh] overflow-hidden">
                <Image src="/imgrt/14.jpg" alt="Creative Director" fill className="object-cover" />
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/70 to-transparent">
                  <h4 className="text-white text-xl font-serif mb-1">Sophia Laurent</h4>
                  <p className="text-white/70 text-sm">Creative Director</p>
                </div>
              </div>
            </div>
            
            <div className="col-span-5">
              <div className="relative h-[40vh] mb-2 md:mb-4 overflow-hidden">
                <Image src="/imgrt/13.jpg" alt="Design Lead" fill className="object-cover object-top" />
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
                  <h4 className="text-white text-lg font-serif mb-1">Isabella Chen</h4>
                  <p className="text-white/70 text-sm">Head of Design</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 md:gap-4 h-[30vh]">
                <div className="relative overflow-hidden">
                  <Image src="/imgrt/image_1.jpg" alt="Atelier Director" fill className="object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                    <h4 className="text-white text-sm font-serif">Emma Dubois</h4>
                    <p className="text-white/70 text-xs">Atelier Director</p>
                  </div>
                </div>
                
                <div className="relative overflow-hidden">
                  <Image src="/imgrt/image_2.jpg" alt="Sustainability Lead" fill className="object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                    <h4 className="text-white text-sm font-serif">Olivia Rey</h4>
                    <p className="text-white/70 text-xs">Sustainability Lead</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Experience section with parallax element */}
      <section className="relative py-32 overflow-hidden bg-[#0a0a0a]">
        <div className="relative z-10 container mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block text-white opacity-20 font-serif italic text-9xl lg:text-[15rem] leading-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">E</span>
            
            <h2 className="text-sm uppercase tracking-[0.3em] text-neutral-400 mb-6 font-serif">The Experience</h2>
            <h3 className="text-3xl md:text-5xl font-light font-serif text-white leading-tight mb-12">
              Discover the World of <span className="italic">Elegance</span>
            </h3>
            <p className="text-neutral-300 mb-16 leading-relaxed">
              Explore our meticulously curated collection—each piece an embodiment of refined luxury, 
              impeccable craftsmanship, and timeless sophistication.
            </p>
            
            <Link href="/products">
              <Button variant="outline" size="lg" className="rounded-none px-12 py-7 border-white text-white bg-transparent hover:bg-white hover:text-black transition-all duration-500">
                <span className="mr-4">View Collection</span>
                <ArrowUpRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
