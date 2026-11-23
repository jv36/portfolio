import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { connection } from "next/server"
import { ArrowLeft } from "lucide-react"

import { SongsWeekView } from "@/components/songs/songs-week-view"
import { WeekArchive } from "@/components/songs/week-archive"
import { getAllWeeks, getWeek } from "@/lib/songs"
import { formatWeekStart } from "@/lib/songs-types"

type WeekPageProps = {
  params: Promise<{ week: string }>
}

export async function generateMetadata({
  params,
}: WeekPageProps): Promise<Metadata> {
  const { week: weekParam } = await params
  const week = await getWeek(weekParam)

  return {
    title: week
      ? `Songs of the week — ${formatWeekStart(week.weekStart)}`
      : "Songs of the week",
  }
}

export default async function WeekPage({ params }: WeekPageProps) {
  await connection()
  const { week: weekParam } = await params
  const [week, weeks] = await Promise.all([getWeek(weekParam), getAllWeeks()])

  if (!week) notFound()

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-2xl flex-col gap-8 px-5 py-12 sm:px-6">
      <header className="flex flex-col gap-2">
        <Link
          href="/songs"
          className="inline-flex w-fit items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Songs of the week
        </Link>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Week of {formatWeekStart(week.weekStart)}
        </h1>
      </header>

      <SongsWeekView week={week} />

      <WeekArchive
        weeks={weeks}
        activeWeekStart={week.weekStart}
        heading="Other weeks"
      />
    </main>
  )
}
