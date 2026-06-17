"use client"

import type { ComponentPropsWithoutRef } from "react"
import { useEffect, useRef, useState } from "react"
import { CheckIcon, CopyIcon, TerminalIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type CodeBlockProps = ComponentPropsWithoutRef<"pre"> & {
  "data-code"?: string
  "data-language"?: string
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

function normalizeLanguage(language?: string) {
  if (!language || language === "text" || language === "txt") {
    return "plain text"
  }

  return language.replace(/-/g, " ")
}

export function CodeBlock({
  className,
  children,
  "data-code": code = "",
  "data-language": language,
  ...props
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const resetTimer = useRef<number | null>(null)
  const languageLabel = normalizeLanguage(language)

  useEffect(() => {
    return () => {
      if (resetTimer.current) {
        window.clearTimeout(resetTimer.current)
      }
    }
  }, [])

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code)
    } catch {
      fallbackCopy(code)
    }

    setCopied(true)

    if (resetTimer.current) {
      window.clearTimeout(resetTimer.current)
    }

    resetTimer.current = window.setTimeout(() => {
      setCopied(false)
    }, 1200)
  }

  return (
    <figure className="group/code my-6 overflow-hidden border border-border/55 bg-card/50 shadow-sm transition-colors duration-150 hover:border-border/80">
      <figcaption className="flex min-h-10 items-center justify-between gap-3 border-b border-border/45 bg-muted/25 px-4 py-2 font-mono select-none">
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="size-2 rounded-full bg-primary/60" />
          <span className="size-2 rounded-full bg-muted-foreground/35" />
          <span className="size-2 rounded-full bg-muted-foreground/25" />
        </div>

        <div className="flex items-center gap-1.5 truncate text-[10px] font-semibold text-muted-foreground/80">
          <TerminalIcon className="size-3 shrink-0 text-muted-foreground/75" />
          <span>
            sh: user@thc:~/tips {languageLabel ? `(${languageLabel})` : ""}
          </span>
        </div>

        <Button
          type="button"
          variant="outline"
          size="xs"
          className="h-6 shrink-0 border-border/55 bg-background/45 px-2.5 font-mono text-[9px] tracking-wide uppercase transition-colors duration-150 hover:border-primary/45 hover:text-primary"
          onClick={() => void copyCode()}
          aria-label={copied ? "Code copied" : "Copy code"}
        >
          {copied ? (
            <>
              <CheckIcon
                className="mr-1 size-2.5 shrink-0 text-primary/85"
                aria-hidden="true"
              />
              <span>Copied</span>
            </>
          ) : (
            <>
              <CopyIcon
                className="mr-1 size-2.5 shrink-0 text-muted-foreground/80"
                aria-hidden="true"
              />
              <span>Copy</span>
            </>
          )}
        </Button>
      </figcaption>

      <pre
        className={cn(
          "m-0 scrollbar-thin scrollbar-thumb-border/40 scrollbar-track-transparent overflow-x-auto bg-background/35 p-4 font-mono text-xs leading-6 tracking-tight outline-none",
          className
        )}
        {...props}
      >
        {children}
      </pre>
    </figure>
  )
}
