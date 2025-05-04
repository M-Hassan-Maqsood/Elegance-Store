"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import useEmblaCarousel from "embla-carousel-react"

type HeroSlide = {
  id: number
  title?: string
  subtitle?: string
  image: string
  link: string
}

export default function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const [currentSlide, setCurrentSlide] = useState(0)
  
  // Set up autoplay effect
  useEffect(() => {
    if (!emblaApi) return
    
    const autoplayInterval = setInterval(() => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext()
      } else {
        emblaApi.scrollTo(0)
      }
    }, 6000) // 6 seconds between slides
    
    // Update current slide index when scrolling
    const onSelect = () => {
      setCurrentSlide(emblaApi.selectedScrollSnap())
    }
    
    emblaApi.on('select', onSelect)
    onSelect() // Initialize with current slide
    
    return () => {
      clearInterval(autoplayInterval)
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi])
  
  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide) => (
            <div key={slide.id} className="relative flex-[0_0_100%]">
              <div className="relative h-screen w-full">
                <Image
                  src={slide.image}
                  alt={slide.title || "Slide image"}
                  fill
                  sizes="100vw"
                  priority={slide.id === 1}
                  className="object-cover"
                />
                
                {/* Adding a light black mask overlay */}
                <div className="absolute inset-0 bg-black/20"></div>
                
                <div className="absolute inset-0 flex items-center justify-start">
                  <div className="container mx-auto px-8 lg:px-16">
                    {/* Collection Name - Large Elegant Typography */}
                    <div className="ml-12 max-w-xl">
                      {slide.title && (
                        <h1 className="text-4xl font-medium text-white mb-1 leading-tight">
                          {slide.title}
                        </h1>
                      )}
                      {slide.subtitle && (
                        <div className="flex items-center">
                          <h2 className="font-playfair text-4xl md:text-6xl font-light text-white italic">
                            {slide.subtitle}
                          </h2>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Navigation buttons - More subtle */}
      <button 
        className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/30 text-black flex items-center justify-center z-10 hover:bg-white/50 transition-colors"
        onClick={() => emblaApi?.scrollPrev()}
      >
        <span className="sr-only">Previous slide</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
      </button>
      
      <button 
        className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/30 text-black flex items-center justify-center z-10 hover:bg-white/50 transition-colors"
        onClick={() => emblaApi?.scrollNext()}
      >
        <span className="sr-only">Next slide</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 18 6-6-6-6"/>
        </svg>
      </button>
      
      {/* Slide indicators */}
      <div className="absolute bottom-8 left-0 right-0">
        <div className="flex justify-center space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index)}
              className={`h-1 transition-all duration-300 ${
                currentSlide === index ? "w-8 bg-black" : "w-5 bg-black/40"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}