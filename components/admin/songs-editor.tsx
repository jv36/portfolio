"use client"

import Image from "next/image"
import { useRef, useState, useTransition } from "react"
import type { FormEvent } from "react"
import { Loader2, Music2, RefreshCw, Save, Search, Trash2 } from "lucide-react"

import { SongPreviewPlayer } from "@/components/songs/song-preview-player"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { saveSongsOfTheWeekAction } from "@/lib/actions"
import {
  currentWeekStart,
  formatWeekStart,
  MAX_SONGS,
  normalizeWeekStart,
  type SongTrack,
  type SongWeek,
} from "@/lib/songs-types"
import { cn } from "@/lib/utils"

type DraftSlot = {
  track: SongTrack | null
  commentary: string
}

function slotsFromWeek(week: SongWeek | null): DraftSlot[] {
  const picks =
    week?.songs.map((song) => ({
      track: song.track,
      commentary: song.commentary,
    })) ?? []

  return Array.from({ length: MAX_SONGS }, (_, index) => {
    return picks[index] ?? { track: null, commentary: "" }
  })
}

export function SongsEditor({ initialWeeks }: { initialWeeks: SongWeek[] }) {
  const [initial] = useState(() => {
    const start = currentWeekStart()
    return {
      start,
      week: initialWeeks.find((week) => week.weekStart === start) ?? null,
    }
  })
  const [weeks, setWeeks] = useState(initialWeeks)
  const [weekStart, setWeekStart] = useState(initial.start)
  const [intro, setIntro] = useState(initial.week?.intro ?? "")
  const [slots, setSlots] = useState<DraftSlot[]>(() =>
    slotsFromWeek(initial.week)
  )
  const [dirty, setDirty] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [pending, startTransition] = useTransition()

  function loadWeek(start: string) {
    const week = weeks.find((item) => item.weekStart === start) ?? null
    setWeekStart(start)
    setIntro(week?.intro ?? "")
    setSlots(slotsFromWeek(week))
    setDirty(false)
    setError("")
    setMessage("")
  }

  function requestWeek(start: string) {
    if (dirty) {
      const confirmed = window.confirm(
        "Discard the unsaved changes for this week?"
      )
      if (!confirmed) return
    }
    loadWeek(start)
  }

  function updateIntro(value: string) {
    setIntro(value)
    setDirty(true)
    setMessage("")
  }

  function updateSlot(index: number, update: Partial<DraftSlot>) {
    setSlots((current) =>
      current.map((slot, slotIndex) =>
        slotIndex === index ? { ...slot, ...update } : slot
      )
    )
    setDirty(true)
    setMessage("")
  }

  function save() {
    setError("")
    setMessage("")

    const songs = slots.flatMap((slot) =>
      slot.track ? [{ track: slot.track, commentary: slot.commentary }] : []
    )

    if (songs.length === 0) {
      setError("Add at least one song before saving.")
      return
    }

    startTransition(async () => {
      const result = await saveSongsOfTheWeekAction({
        weekStart,
        intro,
        songs,
      })

      if (!result.ok) {
        setError(result.error)
        return
      }

      setWeeks((current) =>
        [
          result.week,
          ...current.filter((w) => w.weekStart !== result.week.weekStart),
        ].sort((a, b) => b.weekStart.localeCompare(a.weekStart))
      )
      setDirty(false)
      setMessage("Saved. The public page is up to date.")
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Week
          <Input
            type="date"
            value={weekStart}
            onChange={(event) => {
              const normalized = normalizeWeekStart(event.target.value)
              if (normalized) requestWeek(normalized)
            }}
          />
          <span className="text-xs font-normal text-muted-foreground">
            Any day you pick becomes the Monday of that week.
          </span>
        </label>

        <Button
          type="button"
          variant="outline"
          className="self-start sm:mt-6"
          onClick={() => requestWeek(currentWeekStart())}
        >
          <RefreshCw className="size-4" aria-hidden />
          This week
        </Button>
      </div>

      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Intro{" "}
        <span className="font-normal text-muted-foreground">(optional)</span>
        <Textarea
          value={intro}
          onChange={(event) => updateIntro(event.target.value)}
          maxLength={2000}
          placeholder="A sentence or two about this week's picks…"
        />
      </label>

      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">The five picks</h2>
          <span className="text-xs text-muted-foreground">
            {slots.filter((slot) => slot.track).length}/{MAX_SONGS} filled
          </span>
        </div>

        {slots.map((slot, index) => (
          <EditorSlot
            key={index}
            index={index}
            slot={slot}
            onChange={(update) => updateSlot(index, update)}
            onRemove={() => updateSlot(index, { track: null, commentary: "" })}
          />
        ))}
      </div>

      <div className="sticky bottom-3 z-10 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-background/90 p-3 shadow-sm backdrop-blur">
        <Button type="button" onClick={save} disabled={pending || !dirty}>
          {pending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Save className="size-4" aria-hidden />
          )}
          {pending ? "Saving…" : "Save week"}
        </Button>

        {dirty && !pending ? (
          <span className="text-xs text-muted-foreground">Unsaved changes</span>
        ) : null}
        {message ? (
          <span className="text-sm text-foreground" role="status">
            {message}
          </span>
        ) : null}
        {error ? (
          <span className="text-sm text-destructive" role="alert">
            {error}
          </span>
        ) : null}
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Published weeks</h2>
        {weeks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nothing published yet. Add songs above and save your first week.
          </p>
        ) : (
          <ul className="flex flex-col gap-1">
            {weeks.map((week) => (
              <li key={week.weekStart}>
                <button
                  type="button"
                  onClick={() => requestWeek(week.weekStart)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg border border-transparent px-2.5 py-2 text-left text-sm transition-colors hover:bg-muted",
                    week.weekStart === weekStart &&
                      "border-border bg-muted font-medium"
                  )}
                >
                  <span>Week of {formatWeekStart(week.weekStart)}</span>
                  <span className="text-xs text-muted-foreground">
                    {week.songs.length} song{week.songs.length === 1 ? "" : "s"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function EditorSlot({
  index,
  slot,
  onChange,
  onRemove,
}: {
  index: number
  slot: DraftSlot
  onChange: (update: Partial<DraftSlot>) => void
  onRemove: () => void
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
          Song {index + 1}
        </p>
        {slot.track ? (
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => onChange({ track: null })}
            >
              Replace
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={onRemove}
              aria-label={`Remove song ${index + 1}`}
            >
              <Trash2 className="size-3.5" aria-hidden />
            </Button>
          </div>
        ) : null}
      </div>

      {slot.track ? (
        <div className="flex flex-col gap-2">
          <div className="flex gap-3">
            <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-foreground/5">
              {slot.track.artworkUrl ? (
                <Image
                  src={slot.track.artworkUrl}
                  alt={`${slot.track.title} cover`}
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-muted-foreground">
                  <Music2 className="size-5" aria-hidden />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{slot.track.title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {slot.track.artist}
                {slot.track.album ? ` · ${slot.track.album}` : ""}
              </p>
            </div>
            <SongPreviewPlayer previewUrl={slot.track.previewUrl} />
          </div>
          <label className="flex flex-col gap-1 text-xs font-medium">
            Spotify link{" "}
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
            <Input
              value={slot.track.spotifyUrl}
              onChange={(event) =>
                onChange({
                  track: slot.track
                    ? { ...slot.track, spotifyUrl: event.target.value }
                    : null,
                })
              }
              placeholder="https://open.spotify.com/track/…"
              className="h-8 text-xs"
            />
            <span className="text-[10px] font-normal text-muted-foreground">
              Leave blank to link to a Spotify search.
            </span>
          </label>
        </div>
      ) : (
        <TrackSearch onSelect={(track) => onChange({ track })} />
      )}

      {slot.track || slot.commentary ? (
        <Textarea
          value={slot.commentary}
          onChange={(event) => onChange({ commentary: event.target.value })}
          maxLength={2000}
          placeholder="Why this song? Add a short note…"
          className="mt-3 min-h-16"
        />
      ) : null}
    </div>
  )
}

function TrackSearch({ onSelect }: { onSelect: (track: SongTrack) => void }) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SongTrack[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [searched, setSearched] = useState(false)
  const requestId = useRef(0)

  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return

    const id = ++requestId.current
    setLoading(true)
    setError("")
    setResults([])
    setSearched(false)

    try {
      const response = await fetch(
        `/api/itunes/search?q=${encodeURIComponent(trimmed)}`
      )
      const data = (await response.json()) as {
        results?: SongTrack[]
        error?: string
      }
      if (id !== requestId.current) return
      if (!response.ok) {
        setError(data.error ?? "Could not search iTunes.")
        return
      }
      setResults(data.results ?? [])
      setSearched(true)
    } catch {
      if (id === requestId.current) {
        setError("Could not search iTunes.")
      }
    } finally {
      if (id === requestId.current) setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <form onSubmit={search} className="flex gap-2">
        <Input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setSearched(false)
          }}
          placeholder="Search a song or artist on iTunes…"
          aria-label="Search iTunes"
          minLength={2}
          required
        />
        <Button type="submit" variant="outline" disabled={loading}>
          {loading ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Search className="size-4" aria-hidden />
          )}
          Search
        </Button>
      </form>

      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {results.length > 0 ? (
        <ul className="max-h-64 overflow-y-auto rounded-lg border border-border">
          {results.map((track) => (
            <li
              key={track.trackId}
              className="border-b border-border last:border-b-0"
            >
              <button
                type="button"
                onClick={() => onSelect(track)}
                className="flex w-full items-center gap-3 p-2 text-left transition-colors hover:bg-muted"
              >
                <div className="relative size-9 shrink-0 overflow-hidden rounded bg-muted">
                  {track.artworkUrl ? (
                    <Image
                      src={track.artworkUrl}
                      alt=""
                      fill
                      sizes="72px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-muted-foreground">
                      <Music2 className="size-4" aria-hidden />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{track.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {track.artist}
                    {track.album ? ` · ${track.album}` : ""}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {searched && !loading && !error && results.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No results. Try a different search.
        </p>
      ) : null}
    </div>
  )
}
