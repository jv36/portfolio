import type { Metadata } from "next"
import Link from "next/link"
import { Host_Grotesk } from "next/font/google"
import { ArrowLeft } from "lucide-react"

import { AotyBuilder } from "@/components/aoty/aoty-builder"
import { cn } from "@/lib/utils"

const hostGrotesk = Host_Grotesk({
  subsets: ["latin"],
  weight: "variable",
  variable: "--font-host-grotesk",
  display: "swap",
})

export const metadata: Metadata = {
  title: "AOTY / João Vicente",
  description: "Pick your five albums of the year and export a story image.",
}

export default function AotyPage() {
  return (
    <main
      className={cn(
        "mx-auto flex min-h-svh w-full max-w-5xl flex-col gap-6 px-4 py-10 sm:gap-8 sm:px-6 sm:py-12",
        hostGrotesk.variable
      )}
    >
      <header className="flex flex-col gap-2">
        <Link
          href="/"
          aria-label="Back to home"
          title="Back to home"
          className="inline-flex size-8 w-fit items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Albums of the year
        </h1>
        <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
          Pick the five albums released in 2026 that made your year, rank them,
          and export a story-ready image.
        </p>
      </header>

      <AotyBuilder fontFamily={hostGrotesk.style.fontFamily} />
    </main>
  )
}
