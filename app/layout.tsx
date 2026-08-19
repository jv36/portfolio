import { Geist, Geist_Mono, Inter, Merriweather } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SiteBackground } from "@/components/site-background"
import { cn } from "@/lib/utils";

const merriweatherHeading = Merriweather({subsets:['latin'],variable:'--font-heading'});

const inter = Inter({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", inter.variable, merriweatherHeading.variable)}
    >
      <body suppressHydrationWarning>
        <ThemeProvider>
          <SiteBackground />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
