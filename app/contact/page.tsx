"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { MailIcon, MapPinIcon, PhoneIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import dynamic from "next/dynamic"

// Dynamically import the Map component with no SSR to avoid hydration issues
const ContactMap = dynamic(() => import("@/components/contact/contact-map"), { 
  ssr: false,
  loading: () => (
    <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
      <p className="text-gray-500">Loading map...</p>
    </div>
  )
})

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Here you would typically handle form submission to backend API
    // For now we'll simulate a successful submission with a timeout
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast({
        title: "Message Sent",
        description: "Thank you for contacting us. We'll get back to you shortly.",
        variant: "default"
      })
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem sending your message. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Contact Us</h1>
        <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
          Have questions, feedback, or need assistance? Get in touch with our team and we'll be happy to help.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Store Information</h2>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <MapPinIcon className="h-6 w-6 text-indigo-600 mt-1 mr-4" />
              <div>
                <h3 className="font-medium text-gray-900">Visit Our Store</h3>
                <p className="text-gray-500 mt-1">
                  123 Fashion Avenue<br />
                  Stylish City, SC 12345
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <PhoneIcon className="h-6 w-6 text-indigo-600 mt-1 mr-4" />
              <div>
                <h3 className="font-medium text-gray-900">Call Us</h3>
                <p className="text-gray-500 mt-1">
                  (555) 123-4567<br />
                  Mon-Fri: 9am - 6pm
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <MailIcon className="h-6 w-6 text-indigo-600 mt-1 mr-4" />
              <div>
                <h3 className="font-medium text-gray-900">Email Us</h3>
                <p className="text-gray-500 mt-1">
                  info@eleganceclothing.com<br />
                  support@eleganceclothing.com
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="font-medium text-gray-900 mb-3">Business Hours</h3>
            <div className="grid grid-cols-2 gap-2 text-gray-500">
              <span>Monday - Friday</span>
              <span>9:00 AM - 8:00 PM</span>
              <span>Saturday</span>
              <span>10:00 AM - 6:00 PM</span>
              <span>Sunday</span>
              <span>12:00 PM - 5:00 PM</span>
            </div>
          </div>
        </div>
        
        {/* Contact Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Your Name
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter your name"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <Input
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                placeholder="What is this regarding?"
              />
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                placeholder="How can we help you?"
                rows={5}
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </div>
      </div>
      
      {/* Map Component */}
      <div className="mt-16 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Find Us</h2>
        <div className="h-[400px] rounded-lg overflow-hidden shadow-md">
          <ContactMap />
        </div>
      </div>
      
      <div className="text-center mt-12">
        <p className="text-gray-500">
          Thank you for your interest in ELEGANCE. We look forward to hearing from you!
        </p>
        <div className="mt-4">
          <Link href="/products">
            <Button variant="outline">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}