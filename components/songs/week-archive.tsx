import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { formatWeekStart, type SongWeek } from "@/lib/songs-types"

function formatMonth(weekStart: string) {
  const [year, month] = weekStart.split("-").map(Number)
  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)))
}

function groupWeeks(weeks: SongWeek[]) {
  const years = new Map<string, Map<string, SongWeek[]>>()

  for (const week of weeks) {
    const year = week.weekStart.slice(0, 4)
    const month = week.weekStart.slice(0, 7)
    const months = years.get(year) ?? new Map<string, SongWeek[]>()
    const entries = months.get(month) ?? []
    entries.push(week)
    months.set(month, entries)
    years.set(year, months)
  }

  return [...years.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([year, months]) => {
      const groupedMonths = [...months.entries()]
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([key, entries]) => ({
          key,
          label: formatMonth(entries[0].weekStart),
          weeks: [...entries].sort((a, b) =>
            a.weekStart.localeCompare(b.weekStart)
          ),
        }))

      return {
        year,
        weekCount: groupedMonths.reduce(
          (total, month) => total + month.weeks.length,
          0
        ),
        months: groupedMonths,
      }
    })
}

export function WeekArchive({
  weeks,
  activeWeekStart
}: {
  weeks: SongWeek[]
  activeWeekStart?: string
}) {
  const entries = weeks.filter((week) => week.weekStart !== activeWeekStart)
  if (entries.length === 0) return null

  const years = groupWeeks(entries)
  const latestYear = years[0].year

  return (
    <section className="flex flex-col gap-2">
      <div className="flex flex-col gap-2">
        {years.map((year) => (
          <details
            key={year.year}
            open={year.year === latestYear}
            className="group overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2.5 text-sm font-medium transition-colors select-none hover:bg-muted [&::-webkit-details-marker]:hidden">
              <span className="flex items-center gap-2">
                <ChevronRight
                  className="size-3.5 text-muted-foreground transition-transform group-open:rotate-90"
                  aria-hidden
                />
                {year.year}
              </span>
              <span className="text-xs font-normal text-muted-foreground">
                {year.weekCount} week{year.weekCount === 1 ? "" : "s"}
              </span>
            </summary>

            <div className="flex flex-col divide-y divide-border border-t border-border">
              {year.months.map((month) => (
                <div
                  key={month.key}
                  className="flex items-center gap-3 px-3 py-2"
                >
                  <span className="w-8 shrink-0 text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                    {month.label}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {month.weeks.map((week) => {
                      const day = Number(week.weekStart.slice(8, 10))
                      const count = week.songs.length

                      return (
                        <Link
                          key={week.weekStart}
                          href={`/songs/${week.weekStart}`}
                          aria-label={`Week of ${formatWeekStart(week.weekStart)}, ${count} song${count === 1 ? "" : "s"}`}
                          title={`Week of ${formatWeekStart(week.weekStart)}`}
                          className="flex h-7 min-w-7 items-center justify-center rounded-md bg-muted px-1.5 text-xs font-medium tabular-nums transition-colors hover:bg-accent"
                        >
                          {day}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </details>
        ))}
      </div>
    </section>
  )
}
