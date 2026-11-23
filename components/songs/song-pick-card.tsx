import Image from "next/image"
import { Music2 } from "lucide-react"
import { siSpotify } from "simple-icons"

import { SongPreviewPlayer } from "@/components/songs/song-preview-player"
import { spotifyUrlForTrack, type SongPick } from "@/lib/songs-types"
import { cn } from "@/lib/utils"

export function SongPickCard({
  pick,
  compact = false,
}: {
  pick: SongPick
  compact?: boolean
}) {
  return (
    <li
      className={cn(
        "rounded-xl bg-card p-3 ring-1 ring-foreground/10",
        compact && "p-2.5"
      )}
    >
      <div className="flex gap-3">
        <div
          className={cn(
            "relative shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-foreground/5",
            compact ? "size-12" : "size-16"
          )}
        >
          {pick.track.artworkUrl ? (
            <Image
              src={pick.track.artworkUrl}
              alt={`${pick.track.title} cover`}
              fill
              sizes={compact ? "96px" : "128px"}
              className="object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              <Music2 className="size-5" aria-hidden />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <a
                href={spotifyUrlForTrack(pick.track)}
                target="_blank"
                rel="noopener noreferrer"
                title="Open in Spotify"
                className="group inline-flex max-w-full items-center gap-1 leading-snug font-medium hover:underline"
              >
                <span className="truncate">{pick.track.title}</span>
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden
                  className="size-3 shrink-0 fill-current text-muted-foreground transition-colors group-hover:text-foreground"
                >
                  <path d={siSpotify.path} />
                </svg>
              </a>
              <p className="truncate text-xs text-muted-foreground">
                {pick.track.artist}
                {pick.track.album ? ` · ${pick.track.album}` : ""}
              </p>
            </div>

            <SongPreviewPlayer previewUrl={pick.track.previewUrl} />
          </div>

          {pick.commentary ? (
            <p
              className={cn(
                "mt-2 text-sm leading-relaxed whitespace-pre-line text-muted-foreground",
                compact && "line-clamp-3 text-[13px] leading-snug"
              )}
            >
              {pick.commentary}
            </p>
          ) : null}
        </div>
      </div>
    </li>
  )
}
