import type { NextRequest } from "next/server"

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

export async function GET(request: NextRequest) {
  const term = request.nextUrl.searchParams.get("q")?.trim()
  if (!term) {
    return Response.json({ results: [] })
  }

  const requestedLimit = Number(request.nextUrl.searchParams.get("limit") ?? 8)
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(Math.max(Math.trunc(requestedLimit), 1), 12)
    : 8

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
      return Response.json(
        { error: "iTunes search is unavailable right now." },
        { status: 502 }
      )
    }

    const data = (await response.json()) as { results?: ITunesTrack[] }
    const results = (data.results ?? [])
      .map(toTrack)
      .filter((track): track is SongTrack => Boolean(track))

    return Response.json({ results })
  } catch {
    return Response.json(
      { error: "Could not reach iTunes right now." },
      { status: 502 }
    )
  }
}
