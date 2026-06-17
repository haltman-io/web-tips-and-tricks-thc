"use client"

import type { ComponentPropsWithoutRef, ReactNode } from "react"
import { useEffect, useRef, useState } from "react"
import { CheckIcon, PaperclipIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type HeadingAnchorProps = {
  as: "h1" | "h2" | "h3"
  id: string
  label: string
  className?: string
  children: ReactNode
} & Omit<ComponentPropsWithoutRef<"h1">, "children" | "className" | "id">

function getAnchorUrl(id: string) {
  return `${window.location.origin}${window.location.pathname}${window.location.search}#${id}`
}

function fallbackCopy(text: string) {
  const input = document.createElement("textarea")

  input.value = text
  input.setAttribute("readonly", "")
  input.style.position = "fixed"
  input.style.left = "-9999px"
  input.style.top = "0"

  document.body.append(input)
  input.select()
  document.execCommand("copy")
  input.remove()
}

export function HeadingAnchor({
  as: HeadingTag,
  id,
  label,
  className,
  children,
  ...props
}: HeadingAnchorProps) {
  const [copied, setCopied] = useState(false)
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (resetTimer.current) {
        clearTimeout(resetTimer.current)
      }
    }
  }, [])

  async function copyLink() {
    const anchorUrl = getAnchorUrl(id)

    try {
      await navigator.clipboard.writeText(anchorUrl)
    } catch {
      fallbackCopy(anchorUrl)
    }

    setCopied(true)

    if (resetTimer.current) {
      clearTimeout(resetTimer.current)
    }

    resetTimer.current = setTimeout(() => {
      setCopied(false)
    }, 1200)
  }

  return (
    <HeadingTag
      id={id}
      data-toc-label={label}
      className={cn("group/heading scroll-mt-28", className)}
      {...props}
    >
      <a
        href={`#${id}`}
        title={`Copy link to ${label}`}
        aria-describedby={`${id}-anchor-help ${id}-anchor-status`}
        className="relative -ml-7 inline-flex max-w-full items-start pl-7 text-current transition-colors duration-150 group-hover/heading:text-primary focus-visible:text-primary focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
        onClick={(event) => {
          if (
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey
          ) {
            return
          }

          event.preventDefault()
          void copyLink()
        }}
      >
        <span
          className={cn(
            "absolute top-[0.18em] left-0 inline-flex size-5 items-center justify-center border opacity-0 transition-[background-color,border-color,color,opacity] duration-150 [&_svg]:size-3.5",
            copied
              ? "border-primary bg-primary text-primary-foreground opacity-100"
              : "border-transparent text-muted-foreground group-focus-within/heading:opacity-100 group-hover/heading:text-primary group-hover/heading:opacity-100"
          )}
          aria-hidden="true"
        >
          {copied ? <CheckIcon /> : <PaperclipIcon />}
        </span>
        <span data-heading-text>{children}</span>
        <span id={`${id}-anchor-help`} className="sr-only">
          Click to copy this anchor link.
        </span>
        <span id={`${id}-anchor-status`} className="sr-only" aria-live="polite">
          {copied ? "Anchor link copied." : ""}
        </span>
      </a>
    </HeadingTag>
  )
}
