import { randomUUID } from "node:crypto"
import { promises as fs } from "node:fs"
import path from "node:path"

import {
  currentWeekStart,
  MAX_SONGS,
  normalizeSpotifyUrl,
  normalizeWeekStart,
  type SongIssue,
  type SongPick,
  type SongTrack,
  type SongWeek,
} from "./songs-types"

const DATA_DIR =
  process.env.SONGS_DATA_DIR?.trim() || path.join(process.cwd(), "data")
const DATA_FILE = path.join(DATA_DIR, "songs-of-the-week.json")
const EMPTY_STORE: Store = { weeks: [] }

type Store = {
  weeks: SongWeek[]
}

let queue: Promise<unknown> = Promise.resolve()

function withLock<T>(work: () => Promise<T>): Promise<T> {
  const run = queue.then(work, work)
  queue = run.then(
    () => undefined,
    () => undefined
  )
  return run
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function text(value: unknown, maxLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : ""
}

function httpsUrl(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null
  try {
    const url = new URL(value)
    return url.protocol === "https:" ? url.toString() : null
  } catch {
    return null
  }
}

function parseTrack(value: unknown): SongTrack | null {
  if (!isRecord(value)) return null

  const trackId =
    typeof value.trackId === "number" || typeof value.trackId === "string"
      ? String(value.trackId)
      : ""
  const title = text(value.title, 300)
  const artist = text(value.artist, 300)
  const album = text(value.album, 300)
  const trackViewUrl = httpsUrl(value.trackViewUrl)
  const artworkUrl = httpsUrl(value.artworkUrl)
  const previewUrl =
    value.previewUrl === null || value.previewUrl === undefined
      ? null
      : httpsUrl(value.previewUrl)

  if (!trackId || !title || !artist || !trackViewUrl) return null

  return {
    trackId,
    title,
    artist,
    album,
    artworkUrl: artworkUrl ?? "",
    previewUrl,
    trackViewUrl,
    spotifyUrl: normalizeSpotifyUrl(value.spotifyUrl),
  }
}

function parsePick(value: unknown): SongPick | null {
  if (!isRecord(value)) return null
  const track = parseTrack(value.track)
  if (!track) return null

  return {
    id: text(value.id, 80) || randomUUID(),
    commentary: text(value.commentary, 2000),
    track,
  }
}

function parseWeek(value: unknown): SongWeek | null {
  if (!isRecord(value)) return null

  const weekStart = normalizeWeekStart(value.weekStart)
  if (!weekStart) return null

  const songs = Array.isArray(value.songs)
    ? value.songs
        .slice(0, MAX_SONGS)
        .map(parsePick)
        .filter((pick): pick is SongPick => Boolean(pick))
    : []

  return {
    weekStart,
    intro: text(value.intro, 2000),
    songs,
    updatedAt: text(value.updatedAt, 60) || new Date().toISOString(),
  }
}

async function readStore(): Promise<Store> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8")
    const value: unknown = JSON.parse(raw)
    if (!isRecord(value) || !Array.isArray(value.weeks)) return EMPTY_STORE
    const weeks = value.weeks
      .map(parseWeek)
      .filter((week): week is SongWeek => Boolean(week))
      .sort((a, b) => b.weekStart.localeCompare(a.weekStart))
    return { weeks }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return EMPTY_STORE
    }
    console.error("Could not read songs-of-the-week data", error)
    return EMPTY_STORE
  }
}

async function writeStore(store: Store): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true })
  const tempFile = `${DATA_FILE}.${process.pid}.${randomUUID()}.tmp`
  await fs.writeFile(tempFile, JSON.stringify(store, null, 2), "utf8")
  await fs.rename(tempFile, DATA_FILE)
}

/** Validates data coming from the admin editor before it is persisted. */
export function parseIssueInput(
  value: unknown
): { ok: true; issue: SongIssue } | { ok: false; error: string } {
  if (!isRecord(value)) {
    return { ok: false, error: "Invalid form data." }
  }

  const weekStart = normalizeWeekStart(value.weekStart)
  if (!weekStart) {
    return { ok: false, error: "Choose a valid week." }
  }

  if (!Array.isArray(value.songs)) {
    return { ok: false, error: "Invalid songs list." }
  }

  if (value.songs.length > MAX_SONGS) {
    return { ok: false, error: `You can pick at most ${MAX_SONGS} songs.` }
  }

  const songs: SongIssue["songs"] = []
  for (const [index, item] of value.songs.entries()) {
    const track = isRecord(item) ? parseTrack(item.track) : null
    if (!track) {
      return {
        ok: false,
        error: `Song ${index + 1} is missing a valid iTunes track.`,
      }
    }
    songs.push({
      track,
      commentary: isRecord(item) ? text(item.commentary, 2000) : "",
    })
  }

  return {
    ok: true,
    issue: {
      weekStart,
      intro: text(value.intro, 2000),
      songs,
    },
  }
}

export async function saveIssue(issue: SongIssue): Promise<SongWeek> {
  return withLock(async () => {
    const store = await readStore()
    const week: SongWeek = {
      weekStart: issue.weekStart,
      intro: issue.intro,
      songs: issue.songs.map((song) => ({
        id: randomUUID(),
        commentary: song.commentary,
        track: song.track,
      })),
      updatedAt: new Date().toISOString(),
    }

    const weeks = store.weeks.filter(
      (item) => item.weekStart !== week.weekStart
    )
    weeks.push(week)
    weeks.sort((a, b) => b.weekStart.localeCompare(a.weekStart))

    await writeStore({ weeks })
    return week
  })
}

export async function getAllWeeks(): Promise<SongWeek[]> {
  return (await readStore()).weeks
}

export async function getWeek(weekStart: string): Promise<SongWeek | null> {
  const normalized = normalizeWeekStart(weekStart)
  if (!normalized) return null
  const weeks = await getAllWeeks()
  return weeks.find((week) => week.weekStart === normalized) ?? null
}

/**
 * Shows this week's picks when they exist. Otherwise the latest published
 * week stays up, so the page never goes blank just because it is a new week.
 */
export async function getFeaturedWeek(): Promise<SongWeek | null> {
  const weeks = await getAllWeeks()
  const thisWeek = currentWeekStart()
  return weeks.find((week) => week.weekStart === thisWeek) ?? weeks[0] ?? null
}

export async function getPublicSongsData(): Promise<{
  featured: SongWeek | null
  weeks: SongWeek[]
}> {
  const weeks = await getAllWeeks()
  const thisWeek = currentWeekStart()
  return {
    featured:
      weeks.find((week) => week.weekStart === thisWeek) ?? weeks[0] ?? null,
    weeks,
  }
}
