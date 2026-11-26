"use client"

import Image from "next/image"
import { useRef, useState } from "react"
import type { FormEvent } from "react"
import {
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  Music2,
  Plus,
  RotateCcw,
  Search,
  X,
} from "lucide-react"

import { AotyPreview } from "@/components/aoty/aoty-preview"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MAX_ALBUMS, type AotyAlbum } from "@/lib/aoty-types"
import { cn } from "@/lib/utils"

type SearchResponse = {
  results?: AotyAlbum[]
  error?: string
}

export function AotyBuilder({ fontFamily }: { fontFamily: string }) {
  const [albums, setAlbums] = useState<AotyAlbum[]>([])
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<AotyAlbum[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState("")
  const [numbered, setNumbered] = useState(true)
  const requestId = useRef(0)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const complete = albums.length === MAX_ALBUMS

  function focusSearch() {
    searchInputRef.current?.focus()
  }

  function updateQuery(value: string) {
    setQuery(value)
    setError("")
    if (searched) {
      setSearched(false)
      setResults([])
    }
  }

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
        `/api/itunes/search?type=album&q=${encodeURIComponent(trimmed)}&limit=12`
      )
      const data = (await response.json()) as SearchResponse

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

  function addAlbum(album: AotyAlbum) {
    setAlbums((current) => {
      if (current.length >= MAX_ALBUMS) return current
      if (current.some((item) => item.id === album.id)) return current
      return [...current, album]
    })
  }

  function removeAlbum(id: string) {
    setAlbums((current) => current.filter((album) => album.id !== id))
  }

  function moveAlbum(index: number, direction: -1 | 1) {
    setAlbums((current) => {
      const target = index + direction
      if (target < 0 || target >= current.length) return current

      const next = [...current]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  function reset() {
    setAlbums([])
    setQuery("")
    setResults([])
    setSearched(false)
    setError("")
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
      <div className="flex min-w-0 flex-col gap-8">
        <section className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold">Add an album</h2>
          </div>

          <form onSubmit={search} className="flex gap-2">
            <Input
              ref={searchInputRef}
              value={query}
              onChange={(event) => updateQuery(event.target.value)}
              placeholder="Search an album or artist, or paste an Apple Music link…"
              aria-label="Search albums released in 2026"
              minLength={1}
              required
            />
            <Button
              type="submit"
              variant="outline"
              disabled={loading}
              className="shrink-0"
            >
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
            <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
              <ul className="max-h-80 divide-y divide-border overflow-y-auto">
                {results.map((album) => {
                  const added = albums.some((item) => item.id === album.id)
                  const disabled = added || complete

                  return (
                    <li key={album.id}>
                      <button
                        type="button"
                        onClick={() => addAlbum(album)}
                        disabled={disabled}
                        title={
                          added
                            ? "Already in your list"
                            : complete
                              ? "Your list is full"
                              : `Add ${album.title}`
                        }
                        className="flex w-full items-center gap-3 p-2.5 text-left transition-colors enabled:hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <div className="relative size-10 shrink-0 overflow-hidden rounded-md bg-muted ring-1 ring-foreground/5">
                          {album.artworkUrl ? (
                            <Image
                              src={album.artworkUrl}
                              alt=""
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex size-full items-center justify-center text-muted-foreground">
                              <Music2 className="size-4" aria-hidden />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {album.title}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {album.artist} · {album.releaseYear}
                          </p>
                        </div>

                        <span
                          aria-hidden
                          className={cn(
                            "flex size-7 shrink-0 items-center justify-center rounded-full border border-border",
                            added ? "text-foreground" : "text-muted-foreground"
                          )}
                        >
                          {added ? (
                            <Check className="size-3.5" />
                          ) : (
                            <Plus className="size-3.5" />
                          )}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ) : null}

          {complete && results.length > 0 ? (
            <p className="text-xs text-muted-foreground">
              Your list is full. Remove an album to swap one in.
            </p>
          ) : null}

          {searched && !loading && !error && results.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No 2026 albums found. Try a different album or artist.
            </p>
          ) : null}
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <h2 className="text-lg font-semibold">Your top five</h2>
              <span className="text-xs text-muted-foreground tabular-nums">
                {albums.length}/{MAX_ALBUMS}
              </span>
            </div>

            <div
              role="group"
              aria-label="List ordering"
              className="inline-flex items-center rounded-lg border border-border bg-card p-0.5"
            >
              <button
                type="button"
                onClick={() => setNumbered(true)}
                aria-pressed={numbered}
                className={cn(
                  "rounded-md px-2 py-1 text-xs font-medium transition-colors",
                  numbered
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Ranked
              </button>
              <button
                type="button"
                onClick={() => setNumbered(false)}
                aria-pressed={!numbered}
                title="No particular order"
                className={cn(
                  "rounded-md px-2 py-1 text-xs font-medium transition-colors",
                  !numbered
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                No order
              </button>
            </div>
          </div>

          <ol className="flex flex-col gap-2">
            {Array.from({ length: MAX_ALBUMS }, (_, index) => {
              const album = albums[index]

              if (!album) {
                return (
                  <EmptyAlbumSlot
                    key={index}
                    index={index}
                    numbered={numbered}
                    onPick={focusSearch}
                  />
                )
              }

              return (
                <SelectedAlbum
                  key={album.id}
                  album={album}
                  index={index}
                  total={albums.length}
                  numbered={numbered}
                  onMove={(direction) => moveAlbum(index, direction)}
                  onRemove={() => removeAlbum(album.id)}
                />
              )
            })}
          </ol>

          {albums.length > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={reset}
              className="self-start"
            >
              <RotateCcw className="size-3.5" aria-hidden />
              Start over
            </Button>
          ) : null}
        </section>
      </div>

      <aside className="mx-auto w-full max-w-sm lg:sticky lg:top-8 lg:mx-0 lg:max-w-none">
        <AotyPreview
          albums={albums}
          fontFamily={fontFamily}
          numbered={numbered}
        />
      </aside>
    </div>
  )
}

function SelectedAlbum({
  album,
  index,
  total,
  numbered,
  onMove,
  onRemove,
}: {
  album: AotyAlbum
  index: number
  total: number
  numbered: boolean
  onMove: (direction: -1 | 1) => void
  onRemove: () => void
}) {
  return (
    <li className="flex items-center gap-3 rounded-xl bg-card p-2.5 ring-1 ring-foreground/10">
      {numbered ? (
        <span className="w-6 shrink-0 text-center font-mono text-[11px] font-medium text-muted-foreground tabular-nums">
          #{index + 1}
        </span>
      ) : null}

      <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-foreground/5">
        {album.artworkUrl ? (
          <Image
            src={album.artworkUrl}
            alt={`${album.title} cover`}
            fill
            sizes="96px"
            className="object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <Music2 className="size-4" aria-hidden />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{album.title}</p>
        <p className="truncate text-xs text-muted-foreground">
          {album.artist} · {album.releaseYear}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-0.5">
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={() => onMove(-1)}
          disabled={index === 0}
          aria-label={`Move ${album.title} up`}
        >
          <ChevronUp className="size-3.5" aria-hidden />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={() => onMove(1)}
          disabled={index === total - 1}
          aria-label={`Move ${album.title} down`}
        >
          <ChevronDown className="size-3.5" aria-hidden />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={onRemove}
          aria-label={`Remove ${album.title}`}
        >
          <X className="size-3.5" aria-hidden />
        </Button>
      </div>
    </li>
  )
}

function EmptyAlbumSlot({
  index,
  numbered,
  onPick,
}: {
  index: number
  numbered: boolean
  onPick: () => void
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onPick}
        className="flex w-full items-center gap-3 rounded-xl border border-dashed border-border p-2.5 text-left transition-colors hover:bg-muted/50"
      >
        {numbered ? (
          <span className="w-6 shrink-0 text-center font-mono text-[11px] font-medium text-muted-foreground/60 tabular-nums">
            #{index + 1}
          </span>
        ) : null}
        <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted/40 text-muted-foreground">
          <Music2 className="size-4" aria-hidden />
        </span>
        <span className="text-sm text-muted-foreground">Pick an album</span>
      </button>
    </li>
  )
}
