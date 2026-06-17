"use client"

import Link from "next/link"
import { useSyncExternalStore } from "react"

import { cn } from "@/lib/utils"

type LiveHostProps = {
  className?: string
}

function subscribe() {
  return () => {}
}

function getHostSnapshot() {
  return window.location.hostname
}

function getServerHostSnapshot() {
  return ""
}

export function LiveHost({ className }: LiveHostProps) {
  const host = useSyncExternalStore(
    subscribe,
    getHostSnapshot,
    getServerHostSnapshot
  )

  return (
    <Link
      href="/"
      className={cn(
        "inline-flex min-h-9 max-w-full min-w-0 items-center font-mono text-xs font-medium tracking-[-0.04em] text-foreground underline-offset-4 transition-colors duration-150 hover:text-primary hover:underline focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
        className
      )}
      aria-label={host ? `Go to ${host}` : "Go to home"}
    >
      <span className="truncate">{host || "..."}</span>
    </Link>
  )
}
