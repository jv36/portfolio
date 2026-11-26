"use client"

import { useEffect, useRef, useState } from "react"
import { Download, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { MAX_ALBUMS, type AotyAlbum } from "@/lib/aoty-types"

const CANVAS_WIDTH = 1080
const CANVAS_HEIGHT = 1920

const COVER_SIZE = 252
const COVER_X = 108
const ROW_TOP = 332
const ROW_PITCH = 268

const BOX_LEFT = COVER_X + COVER_SIZE - 8
const BOX_RIGHT = 960
const BOX_TOP_OFFSET = 25
const BOX_HEIGHT = 204
const BOX_RADIUS = 18
const BOX_BORDER_WIDTH = 4

const BADGE_RADIUS = 45
const BADGE_OFFSET_X = 4
const BADGE_OFFSET_Y = 3
const BADGE_FONT_SIZE = 48

const TEXT_X = 404
const TEXT_MAX_WIDTH = BOX_RIGHT - TEXT_X - 36
const TITLE_SIZE = 84
const TITLE_MIN_SIZE = 44
const ARTIST_SIZE = 56
const ARTIST_MIN_SIZE = 30
const TEXT_LINE_GAP = 16

const HEADER_SIZE = 58
const HEADER_BASELINE = 258
const FOOTER_SIZE = 30
const FOOTER_BASELINE = 1754

const artworkCache = new Map<string, Promise<HTMLImageElement | null>>()

function loadArtwork(url: string): Promise<HTMLImageElement | null> {
  if (!url) return Promise.resolve(null)

  const cached = artworkCache.get(url)
  if (cached) return cached

  const promise = new Promise<HTMLImageElement | null>((resolve) => {
    const image = new Image()
    image.crossOrigin = "anonymous"
    image.onload = () => resolve(image)
    image.onerror = () => resolve(null)
    image.src = url
  })

  artworkCache.set(url, promise)
  return promise
}

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + width, y, x + width, y + height, r)
  ctx.arcTo(x + width, y + height, x, y + height, r)
  ctx.arcTo(x, y + height, x, y, r)
  ctx.arcTo(x, y, x + width, y, r)
  ctx.closePath()
}

function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  startSize: number,
  minSize: number,
  weight: number,
  fontFamily: string
): { text: string; size: number } {
  let size = startSize
  ctx.font = `${weight} ${size}px ${fontFamily}`

  while (size > minSize && ctx.measureText(text).width > maxWidth) {
    size -= 2
    ctx.font = `${weight} ${size}px ${fontFamily}`
  }

  if (ctx.measureText(text).width <= maxWidth) return { text, size }

  let fitted = text
  while (fitted.length > 1 && ctx.measureText(`${fitted}…`).width > maxWidth) {
    fitted = fitted.slice(0, -1)
  }

  return { text: `${fitted.trimEnd()}…`, size }
}

type TextLine = {
  text: string
  size: number
  weight: number
  color: string
}

function drawTextLines(
  ctx: CanvasRenderingContext2D,
  lines: TextLine[],
  boxTop: number,
  fontFamily: string
) {
  const measured = lines.map((line) => {
    ctx.font = `${line.weight} ${line.size}px ${fontFamily}`
    const metrics = ctx.measureText(line.text)
    return {
      ...line,
      ascent: metrics.actualBoundingBoxAscent || Math.round(line.size * 0.72),
      descent: metrics.actualBoundingBoxDescent || 0,
    }
  })

  const height = measured.reduce(
    (total, line, index) =>
      total + line.ascent + line.descent + (index > 0 ? TEXT_LINE_GAP : 0),
    0
  )

  let y = boxTop + (BOX_HEIGHT - height) / 2
  ctx.textAlign = "left"
  ctx.textBaseline = "alphabetic"

  for (const line of measured) {
    y += line.ascent
    ctx.font = `${line.weight} ${line.size}px ${fontFamily}`
    ctx.fillStyle = line.color
    ctx.fillText(line.text, TEXT_X, y)
    y += line.descent + TEXT_LINE_GAP
  }
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement | null,
  x: number,
  y: number,
  size: number,
  fontFamily: string,
  hasAlbum: boolean
) {
  ctx.save()
  roundedRectPath(ctx, x, y, size, size, 6)
  ctx.clip()

  if (image) {
    ctx.drawImage(image, x, y, size, size)
  } else {
    ctx.fillStyle = hasAlbum ? "#151515" : "#0d0d0d"
    ctx.fillRect(x, y, size, size)
    ctx.fillStyle = hasAlbum ? "#3d3d3d" : "#2a2a2a"
    ctx.font = `500 ${Math.round(size * 0.26)}px ${fontFamily}`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(hasAlbum ? "♪" : "+", x + size / 2, y + size / 2 + size * 0.02)
  }

  ctx.restore()

  if (!hasAlbum) {
    ctx.save()
    ctx.setLineDash([10, 10])
    ctx.lineWidth = 2
    ctx.strokeStyle = "#2a2a2a"
    roundedRectPath(ctx, x, y, size, size, 6)
    ctx.stroke()
    ctx.restore()
  }
}

function drawBadge(
  ctx: CanvasRenderingContext2D,
  rank: number,
  x: number,
  y: number,
  fontFamily: string,
  hasAlbum: boolean
) {
  ctx.save()
  ctx.beginPath()
  ctx.arc(x, y, BADGE_RADIUS, 0, Math.PI * 2)
  ctx.fillStyle = hasAlbum ? "#d9d9d9" : "#161616"
  ctx.fill()

  ctx.fillStyle = hasAlbum ? "#0b0b0b" : "#4a4a4a"
  ctx.font = `600 ${BADGE_FONT_SIZE}px ${fontFamily}`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText(`#${rank}`, x, y + 3)
  ctx.restore()
}

function drawAoty(
  ctx: CanvasRenderingContext2D,
  albums: AotyAlbum[],
  images: Array<HTMLImageElement | null>,
  fontFamily: string,
  numbered: boolean
) {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  ctx.fillStyle = "#000000"
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  ctx.fillStyle = "#ffffff"
  ctx.font = `600 ${HEADER_SIZE}px ${fontFamily}`
  ctx.textAlign = "center"
  ctx.textBaseline = "alphabetic"
  ctx.fillText("My albums of the year", CANVAS_WIDTH / 2, HEADER_BASELINE)

  for (let index = 0; index < MAX_ALBUMS; index += 1) {
    const album = albums[index] ?? null
    const hasAlbum = Boolean(album)
    const rowTop = ROW_TOP + index * ROW_PITCH
    const boxTop = rowTop + BOX_TOP_OFFSET
    const badgeX = BOX_RIGHT - BADGE_OFFSET_X
    const badgeY = boxTop - BADGE_OFFSET_Y

    ctx.save()
    ctx.strokeStyle = hasAlbum ? "#ffffff" : "#242424"
    ctx.lineWidth = BOX_BORDER_WIDTH
    if (!hasAlbum) ctx.setLineDash([12, 10])
    roundedRectPath(
      ctx,
      BOX_LEFT,
      boxTop,
      BOX_RIGHT - BOX_LEFT,
      BOX_HEIGHT,
      BOX_RADIUS
    )
    ctx.stroke()
    ctx.restore()

    drawCover(
      ctx,
      images[index] ?? null,
      COVER_X,
      rowTop,
      COVER_SIZE,
      fontFamily,
      hasAlbum
    )

    if (album) {
      const title = fitText(
        ctx,
        album.title,
        TEXT_MAX_WIDTH,
        TITLE_SIZE,
        TITLE_MIN_SIZE,
        600,
        fontFamily
      )
      const artist = fitText(
        ctx,
        album.artist,
        TEXT_MAX_WIDTH,
        ARTIST_SIZE,
        ARTIST_MIN_SIZE,
        500,
        fontFamily
      )

      drawTextLines(
        ctx,
        [
          {
            text: title.text,
            size: title.size,
            weight: 600,
            color: "#ffffff",
          },
          {
            text: artist.text,
            size: artist.size,
            weight: 500,
            color: "#e8e8e8",
          },
        ],
        boxTop,
        fontFamily
      )
    } else {
      drawTextLines(
        ctx,
        [
          {
            text: "Pick an album",
            size: 44,
            weight: 500,
            color: "#3b3b3b",
          },
          {
            text: "Search above to add",
            size: 30,
            weight: 500,
            color: "#262626",
          },
        ],
        boxTop,
        fontFamily
      )
    }

    if (numbered) {
      drawBadge(ctx, index + 1, badgeX, badgeY, fontFamily, hasAlbum)
    }
  }

  ctx.fillStyle = "#f2f2f2"
  ctx.font = `500 ${FOOTER_SIZE}px ${fontFamily}`
  ctx.textAlign = "center"
  ctx.textBaseline = "alphabetic"
  ctx.fillText(
    "make your list at https://joaovicente.dev/aoty",
    CANVAS_WIDTH / 2,
    FOOTER_BASELINE
  )
}

export function AotyPreview({
  albums,
  fontFamily,
  numbered,
}: {
  albums: AotyAlbum[]
  fontFamily: string
  numbered: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")

    if (!canvas || !ctx) return

    const context = ctx

    setReady(false)
    setError("")

    async function render() {
      try {
        await Promise.all([
          document.fonts.load(`600 ${TITLE_SIZE}px ${fontFamily}`),
          document.fonts.load(`500 ${ARTIST_SIZE}px ${fontFamily}`),
          document.fonts.load(`600 ${HEADER_SIZE}px ${fontFamily}`),
          document.fonts.load(`600 ${BADGE_FONT_SIZE}px ${fontFamily}`),
          document.fonts.load(`500 ${FOOTER_SIZE}px ${fontFamily}`),
        ])
        await document.fonts.ready
      } catch {
        // Canvas can still render with the fallback font.
      }

      if (cancelled) return

      const images = await Promise.all(
        Array.from({ length: MAX_ALBUMS }, (_, index) =>
          loadArtwork(albums[index]?.artworkUrl ?? "")
        )
      )

      if (cancelled) return

      drawAoty(context, albums, images, fontFamily, numbered)
      setReady(true)
    }

    void render()

    return () => {
      cancelled = true
    }
  }, [albums, fontFamily, numbered])

  const complete = albums.length === MAX_ALBUMS

  function download() {
    const canvas = canvasRef.current
    if (!canvas) return

    setError("")

    try {
      canvas.toBlob((blob) => {
        if (!blob) {
          setError("Could not export the image. Please try again.")
          return
        }

        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = "albums-of-the-year-2026.png"
        link.click()
        setTimeout(() => URL.revokeObjectURL(url), 1000)
      }, "image/png")
    } catch {
      setError("Could not export the image. Please try again.")
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-xl bg-black shadow-sm ring-1 ring-foreground/10">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          role="img"
          aria-label="Preview of your albums of the year image"
          className="block h-auto w-full"
        >
          Your browser does not support the canvas element.
        </canvas>
      </div>

      <Button
        type="button"
        onClick={download}
        disabled={!complete || !ready}
        className="w-full"
      >
        {!complete ? (
          `Add ${MAX_ALBUMS - albums.length} more album${MAX_ALBUMS - albums.length === 1 ? "" : "s"}`
        ) : !ready ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Preparing image…
          </>
        ) : (
          <>
            <Download className="size-4" aria-hidden />
            Download image
          </>
        )}
      </Button>

      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
