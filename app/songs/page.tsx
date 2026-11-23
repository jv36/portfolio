import type { Metadata } from "next"
import Link from "next/link"
import { connection } from "next/server"
import { ArrowLeft } from "lucide-react"

import { SongsWeekView } from "@/components/songs/songs-week-view"
import { WeekArchive } from "@/components/songs/week-archive"
import { getPublicSongsData } from "@/lib/songs"

export const metadata: Metadata = {
  title: "SOTW / João Vicente",
  description: "Five song recommendations every week.",
}

export default async function SongsPage() {
  await connection()
  const { featured, weeks } = await getPublicSongsData()

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-2xl flex-col gap-8 px-5 py-12 sm:px-6">
      <header className="flex flex-col gap-2">
        <Link
          href="/"
          aria-label="Back to home"
          title="Back to home"
          className="inline-flex size-8 w-fit items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
        </Link>
        <h1 className="text-4xl font-semibold tracking-tight">
          Songs of the week
        </h1>
        <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
          I like music and recommending songs to people. So, here are five songs
          each week.
        </p>
      </header>

      <SongsWeekView week={featured} />

      <WeekArchive weeks={weeks} activeWeekStart={featured?.weekStart} />
    </main>
  )
}
