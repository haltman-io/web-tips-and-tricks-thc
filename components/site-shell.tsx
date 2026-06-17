"use client"

import type { ReactNode } from "react"
import { useEffect, useState, useSyncExternalStore } from "react"
import { ActivityIcon, MoonIcon, SunIcon, TerminalIcon } from "lucide-react"

import { LiveHost } from "@/components/live-host"
import { Button } from "@/components/ui/button"

type SiteShellProps = {
  children: ReactNode
}

type ColorTheme = "light" | "dark"

const themeStorageKey = "theme"
const themeChangeEvent = "themechange"

function getSystemTheme(): ColorTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

function getCurrentTheme(): ColorTheme {
  const storedTheme = window.localStorage.getItem(themeStorageKey)

  if (storedTheme === "dark" || storedTheme === "light") {
    return storedTheme
  }

  return document.documentElement.classList.contains("dark")
    ? "dark"
    : getSystemTheme()
}

function getServerThemeSnapshot(): ColorTheme {
  return "light"
}

function applyTheme(theme: ColorTheme) {
  const root = document.documentElement

  root.classList.toggle("dark", theme === "dark")
  root.classList.toggle("light", theme === "light")
  root.style.colorScheme = theme
  window.localStorage.setItem(themeStorageKey, theme)
  window.dispatchEvent(new Event(themeChangeEvent))
}

function subscribeToThemeChange(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

  function handleStorageChange(event: StorageEvent) {
    if (event.key === themeStorageKey) {
      onStoreChange()
    }
  }

  window.addEventListener(themeChangeEvent, onStoreChange)
  window.addEventListener("storage", handleStorageChange)
  mediaQuery.addEventListener("change", onStoreChange)

  return () => {
    window.removeEventListener(themeChangeEvent, onStoreChange)
    window.removeEventListener("storage", handleStorageChange)
    mediaQuery.removeEventListener("change", onStoreChange)
  }
}

function useColorTheme() {
  return useSyncExternalStore(
    subscribeToThemeChange,
    getCurrentTheme,
    getServerThemeSnapshot
  )
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  )
}

export function SiteShell({ children }: SiteShellProps) {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    function handleScroll() {
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight
      if (totalHeight <= 0) {
        setScrollProgress(0)
        return
      }
      const progress = (window.scrollY / totalHeight) * 100
      setScrollProgress(progress)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div
      id="top"
      className="min-h-svh bg-background/95 transition-colors duration-200"
    >
      <div
        className="fixed top-0 left-0 z-50 h-[2px] bg-primary/70 transition-[width] duration-150"
        style={{ width: `${scrollProgress}%` }}
      />
      <a
        href="#content"
        className="sr-only fixed top-3 left-3 z-30 bg-primary px-3 py-2 text-xs font-medium tracking-[-0.04em] text-primary-foreground focus:not-sr-only focus:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Skip to content
      </a>
      <SiteHeader />
      <div className="relative pb-[calc(8rem+env(safe-area-inset-bottom))] sm:pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
        {children}
      </div>
      <SiteFooter />
    </div>
  )
}

function SiteHeader() {
  const theme = useColorTheme()
  const isDark = theme === "dark"

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat) {
        return
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      if (event.key.toLowerCase() !== "d") {
        return
      }

      if (isTypingTarget(event.target)) {
        return
      }

      applyTheme(getCurrentTheme() === "dark" ? "light" : "dark")
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  return (
    <header className="sticky top-0 z-20 border-b border-border/50 bg-background/90 pt-[env(safe-area-inset-top)] backdrop-blur-sm transition-all">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center justify-start">
          <div className="flex min-w-0 items-center gap-2">
            <TerminalIcon className="size-4 shrink-0 text-primary/75" />
            <LiveHost className="font-mono font-bold tracking-tight" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() => applyTheme(isDark ? "light" : "dark")}
            className="h-8 gap-1.5 border-border/60 bg-background/35 px-2.5 font-mono text-[10px] tracking-wide transition-colors duration-150 hover:border-primary/45 hover:text-primary"
            title="Toggle color theme"
            suppressHydrationWarning
          >
            {isDark ? (
              <>
                <MoonIcon className="size-3 text-primary/80" />
                <span className="hidden tracking-wide sm:inline">Dark</span>
              </>
            ) : (
              <>
                <SunIcon className="size-3 text-primary/75" />
                <span className="hidden tracking-wide sm:inline">Light</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </header>
  )
}

function SiteFooter() {
  return (
    <footer className="fixed inset-x-0 bottom-0 z-20 border-t border-border/45 bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm transition-all">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-1 px-4 py-2.5 font-mono text-[10px] tracking-wider text-muted-foreground sm:min-h-11 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <ActivityIcon className="size-3.5 text-primary/75" />
          <p className="min-w-0 truncate font-semibold text-foreground/75">
            THC.ORG Tips, Trips & Hacks!
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <a
            href="#top"
            className="text-muted-foreground underline-offset-4 transition-colors duration-150 hover:text-primary hover:underline focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
          >
            Back to top
          </a>
        </div>
      </div>
    </footer>
  )
}
