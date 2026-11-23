import { Music2 } from "lucide-react"

import { SongPickCard } from "@/components/songs/song-pick-card"
import {
  currentWeekStart,
  formatWeekStart,
  type SongWeek,
} from "@/lib/songs-types"
import { cn } from "@/lib/utils"

export function SongsWeekView({
  week,
  compact = false,
  showHeader = true,
  className,
}: {
  week: SongWeek | null
  compact?: boolean
  showHeader?: boolean
  className?: string
}) {
  if (!week || week.songs.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center gap-2 rounded-xl border border-dashed border-border p-6 text-center",
          className
        )}
      >
        <Music2 className="size-5 text-muted-foreground" aria-hidden />
        <p className="text-sm font-medium">No picks yet</p>
        <p className="text-xs text-muted-foreground">
          New songs are on the way. Check back soon.
        </p>
      </div>
    )
  }

  const isThisWeek = week.weekStart === currentWeekStart()

  return (
    <section className={cn("flex flex-col gap-4", className)}>
      {showHeader ? (
        <header className="flex flex-col gap-1">
          <p className="text-[10px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
            Songs of the week
          </p>
          <h2
            className={cn(
              "font-heading font-semibold tracking-tight",
              compact ? "text-xl" : "text-3xl"
            )}
          >
            {isThisWeek
              ? "This week"
              : `Week of ${formatWeekStart(week.weekStart)}`}
          </h2>
          {isThisWeek ? (
            <p className="text-xs text-muted-foreground">
              {formatWeekStart(week.weekStart)}
            </p>
          ) : null}
          {week.intro ? (
            <p
              className={cn(
                "mt-1 whitespace-pre-line text-muted-foreground",
                compact ? "text-[13px] leading-snug" : "text-sm leading-relaxed"
              )}
            >
              {week.intro}
            </p>
          ) : null}
        </header>
      ) : (
        <div className="flex flex-col gap-1">
          <p className="text-xs text-muted-foreground">
            {isThisWeek
              ? "This week"
              : `Week of ${formatWeekStart(week.weekStart)}`}
          </p>
          {week.intro ? (
            <p
              className={cn(
                "whitespace-pre-line text-muted-foreground",
                compact ? "text-[13px] leading-snug" : "text-sm leading-relaxed"
              )}
            >
              {week.intro}
            </p>
          ) : null}
        </div>
      )}

      <ol className={cn("flex flex-col", compact ? "gap-2" : "gap-3")}>
        {week.songs.map((pick, index) => (
          <SongPickCard
            key={pick.id}
            pick={pick}
            index={index}
            compact={compact}
          />
        ))}
      </ol>
    </section>
  )
}
