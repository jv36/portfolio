export const MAX_SONGS = 5

export type SongTrack = {
  trackId: string
  title: string
  artist: string
  album: string
  artworkUrl: string
  previewUrl: string | null
  trackViewUrl: string
  spotifyUrl: string
}

export type SongPick = {
  id: string
  commentary: string
  track: SongTrack
}

export type SongWeek = {
  /** Monday of the week, in YYYY-MM-DD format. */
  weekStart: string
  intro: string
  songs: SongPick[]
  updatedAt: string
}

export type SongIssue = {
  weekStart: string
  intro: string
  songs: Array<{
    commentary: string
    track: SongTrack
  }>
}

export type SaveSongsResult =
  { ok: true; week: SongWeek } | { ok: false; error: string }

/** Returns the Monday of the week containing `date`, in UTC, as YYYY-MM-DD. */
export function currentWeekStart(date = new Date()): string {
  const day = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  )
  const daysSinceMonday = (day.getUTCDay() + 6) % 7
  day.setUTCDate(day.getUTCDate() - daysSinceMonday)
  return day.toISOString().slice(0, 10)
}

/** Parses a YYYY-MM-DD string and snaps it to that week's Monday. */
export function normalizeWeekStart(value: unknown): string | null {
  if (typeof value !== "string") return null
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim())
  if (!match) return null

  const [, year, month, day] = match
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
  if (
    date.getUTCFullYear() !== Number(year) ||
    date.getUTCMonth() !== Number(month) - 1 ||
    date.getUTCDate() !== Number(day)
  ) {
    return null
  }

  return currentWeekStart(date)
}

export function formatWeekStart(weekStart: string): string {
  const [year, month, day] = weekStart.split("-").map(Number)
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)))
}

/** Normalizes a Spotify track URL, URI, or bare track ID. Returns "" if invalid. */
export function normalizeSpotifyUrl(value: unknown): string {
  if (typeof value !== "string") return ""
  const input = value.trim()
  if (!input) return ""

  const uriMatch = /^spotify:track:([a-zA-Z0-9]+)$/.exec(input)
  if (uriMatch) return `https://open.spotify.com/track/${uriMatch[1]}`

  if (/^[a-zA-Z0-9]{22}$/.test(input)) {
    return `https://open.spotify.com/track/${input}`
  }

  try {
    const url = new URL(input)
    if (url.protocol !== "https:") return ""
    if (url.hostname !== "open.spotify.com") return ""
    const match = /\/track\/([a-zA-Z0-9]+)/.exec(url.pathname)
    return match ? `https://open.spotify.com/track/${match[1]}` : ""
  } catch {
    return ""
  }
}

/** Falls back to a Spotify search when no direct track link is stored. */
export function spotifyUrlForTrack(
  track: Pick<SongTrack, "spotifyUrl" | "title" | "artist">
): string {
  if (track.spotifyUrl) return track.spotifyUrl
  const query = [track.title, track.artist].filter(Boolean).join(" ")
  return `https://open.spotify.com/search/${encodeURIComponent(query)}`
}
