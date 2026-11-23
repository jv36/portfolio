import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { formatWeekStart, type SongWeek } from "@/lib/songs-types"

export function WeekArchive({
  weeks,
  activeWeekStart,
  heading = "Previous weeks",
}: {
  weeks: SongWeek[]
  activeWeekStart?: string
  heading?: string
}) {
  const entries = weeks.filter((week) => week.weekStart !== activeWeekStart)
  if (entries.length === 0) return null

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-[10px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
        {heading}
      </h2>
      <ul className="divide-y divide-border overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        {entries.map((week) => (
          <li key={week.weekStart}>
            <Link
              href={`/songs/${week.weekStart}`}
              className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-muted"
            >
              <span className="flex min-w-0 items-baseline gap-2">
                <span className="truncate">
                  Week of {formatWeekStart(week.weekStart)}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {week.songs.length} song{week.songs.length === 1 ? "" : "s"}
                </span>
              </span>
              <ChevronRight
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
