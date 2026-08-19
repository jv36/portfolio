"use client"

import { useSyncExternalStore } from "react"

type Point = { x: number; y: number }
type ViewportSize = { width: number; height: number }

const MOUSE_GRID = 4

let mousePosition: Point = { x: 0, y: 0 }
const SERVER_MOUSE_POSITION: Point = { x: 0, y: 0 }

function subscribeMouse(callback: () => void) {
    function handleMouseMove(event: MouseEvent) {
        const x = Math.round(event.clientX / MOUSE_GRID) * MOUSE_GRID
        const y = Math.round(event.clientY / MOUSE_GRID) * MOUSE_GRID
        if (mousePosition.x !== x || mousePosition.y !== y) {
            mousePosition = { x, y }
            callback()
        }
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
}

function useMousePosition(): Point {
    return useSyncExternalStore(
        subscribeMouse,
        () => mousePosition,
        () => SERVER_MOUSE_POSITION
    )
}

let viewportSize: ViewportSize = { width: 0, height: 0 }
const SERVER_VIEWPORT_SIZE: ViewportSize = { width: 0, height: 0 }

function subscribeViewport(callback: () => void) {
    function handleResize() {
        viewportSize = { width: window.innerWidth, height: window.innerHeight }
        callback()
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
}

function useViewportSize(): ViewportSize {
    return useSyncExternalStore(
        subscribeViewport,
        () => viewportSize,
        () => SERVER_VIEWPORT_SIZE
    )
}

function subscribeClock(callback: () => void) {
    const id = setInterval(callback, 1000)
    return () => clearInterval(id)
}

function useClock(): number {
    return useSyncExternalStore(
        subscribeClock,
        () => Date.now(),
        () => 0
    )
}

function subscribeUserAgent() {
    return () => {}
}

function useUserAgent(): string {
    return useSyncExternalStore(
        subscribeUserAgent,
        () => navigator.userAgent,
        () => ""
    )
}

export function SiteBackground() {
    const userAgent = useUserAgent()
    const viewport = useViewportSize()
    const mouse = useMousePosition()
    const timestamp = useClock()

    const now = new Date(timestamp)
    const time = now.toLocaleTimeString("en-GB", { hour12: false })
    const date = now.toISOString().slice(0, 10)
    const chunk = `${userAgent} ${viewport.width}px ${viewport.height}px mouse:${mouse.x}px,${mouse.y}px ${date} ${time}   `

    // Estimate how many repeats are needed to tile the whole viewport at the rendered font size.
    const charsPerLine = Math.max(40, Math.ceil(viewport.width / 6.5))
    const lineCount = Math.max(20, Math.ceil(viewport.height / 14))
    const repeatCount = Math.max(
        4,
        Math.ceil((charsPerLine * lineCount) / chunk.length)
    )

    return (
        <div
            aria-hidden
            className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background p-2 font-mono text-[10px] leading-snug break-all whitespace-pre-wrap text-foreground/[0.07] select-none"
        >
            {chunk.repeat(repeatCount)}
        </div>
    )
}
