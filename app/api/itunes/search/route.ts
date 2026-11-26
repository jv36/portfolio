import type { NextRequest } from "next/server"

import { AOTY_YEAR, type AotyAlbum } from "@/lib/aoty-types"
import type { SongTrack } from "@/lib/songs-types"

type ITunesTrack = {
  trackId?: number
  trackName?: string
  artistName?: string
  collectionName?: string
  artworkUrl100?: string
  previewUrl?: string | null
  trackViewUrl?: string
}

type ITunesAlbum = {
  collectionId?: number
  collectionName?: string
  artistName?: string
  artworkUrl100?: string
  collectionViewUrl?: string
  releaseDate?: string
  trackCount?: number
}

const ITUNES_ERROR = "iTunes search is unavailable right now."
const ITUNES_UNREACHABLE = "Could not reach iTunes right now."

function httpsUrl(value: string | null | undefined): string | null {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === "https:" ? url.toString() : null
  } catch {
    return null
  }
}

function artworkUrl(value: string | undefined): string {
  if (!value) return ""
  return httpsUrl(value.replace("100x100bb", "600x600bb")) ?? ""
}

function toTrack(track: ITunesTrack): SongTrack | null {
  const trackViewUrl = httpsUrl(track.trackViewUrl)
  if (
    !track.trackId ||
    !track.trackName ||
    !track.artistName ||
    !trackViewUrl
  ) {
    return null
  }

  return {
    trackId: String(track.trackId),
    title: track.trackName,
    artist: track.artistName,
    album: track.collectionName ?? "",
    artworkUrl: artworkUrl(track.artworkUrl100),
    previewUrl: httpsUrl(track.previewUrl),
    trackViewUrl,
    spotifyUrl: "",
  }
}

function toAlbum(album: ITunesAlbum): AotyAlbum | null {
  if (
    !album.collectionId ||
    !album.collectionName ||
    !album.artistName ||
    !album.releaseDate
  ) {
    return null
  }

  if (album.trackCount === 1 || /\s-\sSingle$/i.test(album.collectionName)) {
    return null
  }

  const date = new Date(album.releaseDate)
  if (Number.isNaN(date.getTime()) || date.getUTCFullYear() !== AOTY_YEAR) {
    return null
  }

  return {
    id: String(album.collectionId),
    title: album.collectionName,
    artist: album.artistName,
    artworkUrl: artworkUrl(album.artworkUrl100),
    releaseDate: album.releaseDate.slice(0, 10),
    releaseYear: AOTY_YEAR,
    albumViewUrl: httpsUrl(album.collectionViewUrl) ?? "",
  }
}

function albumIdFromQuery(value: string): string | null {
  const input = value.trim()
  if (/^\d{7,}$/.test(input)) return input

  try {
    const url = new URL(input)
    const isAppleMusic =
      url.hostname === "music.apple.com" ||
      url.hostname.endsWith(".music.apple.com") ||
      url.hostname === "itunes.apple.com" ||
      url.hostname.endsWith(".itunes.apple.com")

    if (!isAppleMusic) return null

    const match = /\/album\/(?:[^/]+\/)?(\d+)/.exec(url.pathname)
    return match?.[1] ?? null
  } catch {
    return null
  }
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, { cache: "no-store" })
    if (!response.ok) return null
    return (await response.json()) as T
  } catch {
    return null
  }
}

function relevanceScore(album: AotyAlbum, term: string): number {
  const query = term.trim().toLowerCase()
  const tokens = query.split(/\s+/).filter((token) => token.length >= 3)
  const artist = album.artist.toLowerCase()
  const title = album.title.toLowerCase()

  if (artist === query) return 0
  if (
    artist.includes(query) ||
    tokens.some((token) => artist.includes(token))
  ) {
    return 1
  }
  if (title === query) return 2
  if (title.includes(query) || tokens.some((token) => title.includes(token))) {
    return 3
  }
  return 4
}

async function getAlbumResults(term: string, limit: number): Promise<Response> {
  const directId = albumIdFromQuery(term)

  if (directId) {
    const params = new URLSearchParams({ id: directId, entity: "album" })
    const data = await fetchJson<{ results?: ITunesAlbum[] }>(
      `https://itunes.apple.com/lookup?${params}`
    )

    if (!data) {
      return Response.json({ error: ITUNES_ERROR }, { status: 502 })
    }

    const results = (data.results ?? [])
      .map(toAlbum)
      .filter((album): album is AotyAlbum => Boolean(album))
      .slice(0, limit)

    if (results.length === 0) {
      return Response.json(
        {
          error: "That Apple Music link isn't an album released in 2026.",
        },
        { status: 404 }
      )
    }

    return Response.json({ results })
  }

  const albumParams = new URLSearchParams({
    term,
    media: "music",
    entity: "album",
    limit: "100",
  })
  const songParams = new URLSearchParams({
    term,
    media: "music",
    entity: "song",
    limit: "100",
  })

  const [albumData, songData] = await Promise.all([
    fetchJson<{ results?: ITunesAlbum[] }>(
      `https://itunes.apple.com/search?${albumParams}`
    ),
    fetchJson<{ results?: ITunesAlbum[] }>(
      `https://itunes.apple.com/search?${songParams}`
    ),
  ])

  if (!albumData && !songData) {
    return Response.json({ error: ITUNES_ERROR }, { status: 502 })
  }

  const seenIds = new Set<string>()
  const seenNames = new Set<string>()
  const results = [...(albumData?.results ?? []), ...(songData?.results ?? [])]
    .map(toAlbum)
    .filter((album): album is AotyAlbum => Boolean(album))
    .filter((album) => {
      const name = `${album.title.toLowerCase()}|${album.artist.toLowerCase()}`
      if (seenIds.has(album.id) || seenNames.has(name)) return false
      seenIds.add(album.id)
      seenNames.add(name)
      return true
    })
    .map((album, index) => ({
      album,
      index,
      score: relevanceScore(album, term),
    }))
    .sort((a, b) => a.score - b.score || a.index - b.index)
    .slice(0, limit)
    .map(({ album }) => album)

  return Response.json({ results })
}

export async function GET(request: NextRequest) {
  const term = request.nextUrl.searchParams.get("q")?.trim()
  if (!term) {
    return Response.json({ results: [] })
  }

  const isAlbum = request.nextUrl.searchParams.get("type") === "album"
  const defaultLimit = isAlbum ? 12 : 8
  const requestedLimit = Number(
    request.nextUrl.searchParams.get("limit") ?? defaultLimit
  )
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(Math.max(Math.trunc(requestedLimit), 1), 12)
    : defaultLimit

  if (isAlbum) {
    return getAlbumResults(term, limit)
  }

  const params = new URLSearchParams({
    term,
    media: "music",
    entity: "song",
    limit: String(limit),
  })

  try {
    const response = await fetch(`https://itunes.apple.com/search?${params}`, {
      cache: "no-store",
    })

    if (!response.ok) {
      return Response.json({ error: ITUNES_ERROR }, { status: 502 })
    }

    const data = (await response.json()) as { results?: ITunesTrack[] }
    const results = (data.results ?? [])
      .map(toTrack)
      .filter((track): track is SongTrack => Boolean(track))

    return Response.json({ results })
  } catch {
    return Response.json({ error: ITUNES_UNREACHABLE }, { status: 502 })
  }
}
