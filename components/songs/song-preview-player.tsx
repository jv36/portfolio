"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Loader2, Pause, Play } from "lucide-react"

import { cn } from "@/lib/utils"

type PlayerState = "idle" | "loading" | "playing" | "paused"

let activeStop: (() => void) | null = null

export function SongPreviewPlayer({
  previewUrl,
  className,
}: {
  previewUrl: string | null
  className?: string
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [state, setState] = useState<PlayerState>("idle")

  const stop = useCallback(() => {
    audioRef.current?.pause()
    setState((current) => (current === "idle" ? current : "paused"))
  }, [])

  useEffect(() => {
    const current = audioRef.current
    if (current) {
      current.pause()
      audioRef.current = null
    }

    return () => {
      if (activeStop === stop) activeStop = null
      const audio = audioRef.current
      if (audio) {
        audio.pause()
        audio.src = ""
      }
      audioRef.current = null
    }
  }, [previewUrl, stop])

  const toggle = useCallback(() => {
    if (!previewUrl) return

    if (!audioRef.current) {
      const audio = new Audio(previewUrl)
      audio.preload = "auto"
      audio.onended = () => {
        setState("idle")
        if (activeStop === stop) activeStop = null
      }
      audio.onerror = () => {
        setState("idle")
        if (activeStop === stop) activeStop = null
      }
      audio.oncanplay = () => {
        activeStop?.()
        activeStop = stop
        void audio
          .play()
          .then(() => setState("playing"))
          .catch(() => {
            setState("idle")
            if (activeStop === stop) activeStop = null
          })
      }
      audioRef.current = audio
      setState("loading")
      audio.load()
      return
    }

    if (state === "playing") {
      audioRef.current.pause()
      setState("paused")
      if (activeStop === stop) activeStop = null
      return
    }

    activeStop?.()
    activeStop = stop
    void audioRef.current
      .play()
      .then(() => setState("playing"))
      .catch(() => {
        setState("idle")
        if (activeStop === stop) activeStop = null
      })
  }, [previewUrl, state, stop])

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={!previewUrl}
      aria-label={
        state === "playing" ? "Pause preview" : "Play 30 second preview"
      }
      title={state === "playing" ? "Pause preview" : "Play 30 second preview"}
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors",
        "hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40",
        state === "playing" &&
          "bg-primary text-primary-foreground hover:bg-primary/85",
        className
      )}
    >
      {state === "loading" ? (
        <Loader2 className="size-4 animate-spin" aria-hidden />
      ) : state === "playing" ? (
        <Pause className="size-4" aria-hidden />
      ) : (
        <Play className="size-4" aria-hidden />
      )}
    </button>
  )
}
