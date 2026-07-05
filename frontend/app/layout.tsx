import { AuthProvider } from "@/components/auth-provider"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import ScrollToTop from "@/components/scroll-to-top"
import VapiAssistant from "@/components/vapi-assistant"
import App from "@/App"
import type { ReactNode } from "react"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata = {
  title: "EcoRecycle - E-Waste Collection & Rewards",
  description: "Recycle your e-waste, earn reward points, and shop eco-friendly products.",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>
            <div className="relative flex min-h-screen flex-col">
              <SiteHeader />
              <main className="flex-1">{children}</main>
              <SiteFooter />
              <ScrollToTop />
              <Toaster />
              <App />
              <VapiAssistant />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}