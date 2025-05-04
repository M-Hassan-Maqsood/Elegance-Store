import type React from "react"
import { Inter, Playfair_Display } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { CartProvider } from "@/context/cart-context"
import { WishlistProvider } from "@/context/wishlist-context"
import { ChatbotButton } from "@/components/chatbot"

const inter = Inter({ subsets: ["latin"] })
const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: "--font-playfair"
})

export const metadata = {
  title: "Elegance - Women Clothing Store",
  description: "Premium clothing for modern women",
  generator: 'Hassan',
  icons: {
    icon: '/favicon.ico', // or your custom icon path
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${playfair.variable}`}>
        <CartProvider>
          <WishlistProvider>
            <Header />
            {children}
            <Footer />
            <ChatbotButton />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  )
}
