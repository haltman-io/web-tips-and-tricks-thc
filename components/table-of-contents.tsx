"use client"

import { useEffect, useRef, useState } from "react"
import {
  ChevronDownIcon,
  ChevronRightIcon,
  CircleDotIcon,
  FileTextIcon,
  FilterIcon,
  FolderIcon,
  FolderOpenIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

type TocHeading = {
  id: string
  level: number
  text: string
}

type TableOfContentsProps = {
  className?: string
}

const headingSelector =
  "#article-content h1[id], #article-content h2[id], #article-content h3[id]"

function getHeadingText(element: HTMLElement) {
  return (
    element.getAttribute("data-toc-label") ||
    element.querySelector("[data-heading-text]")?.textContent ||
    element.textContent ||
    ""
  ).trim()
}

function getHeadingsFromDocument() {
  const elements = Array.from(
    document.querySelectorAll<HTMLElement>(headingSelector)
  )

  return {
    elements,
    headings: elements.map((element) => ({
      id: element.id,
      level: Number(element.tagName.slice(1)),
      text: getHeadingText(element),
    })),
  }
}

function areHeadingsEqual(previous: TocHeading[], next: TocHeading[]) {
  return (
    previous.length === next.length &&
    previous.every(
      (heading, index) =>
        heading.id === next[index]?.id &&
        heading.level === next[index]?.level &&
        heading.text === next[index]?.text
    )
  )
}

function getScrollBehavior(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth"
}

function findTocItem(container: HTMLDivElement, activeId: string) {
  return Array.from(
    container.querySelectorAll<HTMLElement>("[data-toc-id]")
  ).find((element) => element.dataset.tocId === activeId)
}

function scrollTocItemIntoView(container: HTMLDivElement, item: HTMLElement) {
  const visibleTop = container.scrollTop
  const visibleBottom = visibleTop + container.clientHeight
  const itemTop = item.offsetTop
  const itemBottom = itemTop + item.offsetHeight

  if (itemTop < visibleTop) {
    container.scrollTo({ top: itemTop, behavior: getScrollBehavior() })
    return
  }

  if (itemBottom > visibleBottom) {
    container.scrollTo({
      top: itemBottom - container.clientHeight,
      behavior: getScrollBehavior(),
    })
  }
}

export function TableOfContents({ className }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TocHeading[]>([])
  const [activeId, setActiveId] = useState("")
  const [filterText, setFilterText] = useState("")
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({})

  const headingElements = useRef<HTMLElement[]>([])
  const listRef = useRef<HTMLDivElement>(null)
  const collectRaf = useRef<number | null>(null)
  const scrollRaf = useRef<number | null>(null)
  const clickScrollTimer = useRef<number | null>(null)
  const clickScrolling = useRef(false)

  useEffect(() => {
    function updateActiveHeading() {
      if (clickScrolling.current) {
        return
      }

      const elements = headingElements.current

      if (elements.length === 0) {
        setActiveId("")
        return
      }

      let nextActiveId = elements[0].id
      const activationOffset = Math.max(112, window.innerHeight * 0.28)

      for (const element of elements) {
        if (element.getBoundingClientRect().top <= activationOffset) {
          nextActiveId = element.id
        } else {
          break
        }
      }

      setActiveId((previous) =>
        previous === nextActiveId ? previous : nextActiveId
      )
    }

    function collectHeadings() {
      const next = getHeadingsFromDocument()

      headingElements.current = next.elements
      setHeadings((previous) =>
        areHeadingsEqual(previous, next.headings) ? previous : next.headings
      )

      setExpandedSections((prev) => {
        const nextState = { ...prev }
        next.headings.forEach((h) => {
          if (h.level === 1 && nextState[h.id] === undefined) {
            nextState[h.id] = true
          }
        })
        return nextState
      })

      updateActiveHeading()
      collectRaf.current = null
    }

    function scheduleCollectHeadings() {
      if (collectRaf.current) {
        cancelAnimationFrame(collectRaf.current)
      }

      collectRaf.current = requestAnimationFrame(collectHeadings)
    }

    function scheduleActiveHeadingUpdate() {
      if (scrollRaf.current) {
        return
      }

      scrollRaf.current = requestAnimationFrame(() => {
        updateActiveHeading()
        scrollRaf.current = null
      })
    }

    scheduleCollectHeadings()

    window.addEventListener("scroll", scheduleActiveHeadingUpdate, {
      passive: true,
    })
    window.addEventListener("resize", scheduleCollectHeadings, {
      passive: true,
    })

    const article = document.getElementById("article-content")
    const observer = article
      ? new MutationObserver(scheduleCollectHeadings)
      : null

    observer?.observe(article as HTMLElement, {
      childList: true,
      subtree: true,
      characterData: true,
    })

    return () => {
      if (collectRaf.current) {
        cancelAnimationFrame(collectRaf.current)
      }

      if (scrollRaf.current) {
        cancelAnimationFrame(scrollRaf.current)
      }

      if (clickScrollTimer.current) {
        clearTimeout(clickScrollTimer.current)
      }

      window.removeEventListener("scroll", scheduleActiveHeadingUpdate)
      window.removeEventListener("resize", scheduleCollectHeadings)
      observer?.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!activeId || !listRef.current) {
      return
    }

    const activeItem = findTocItem(listRef.current, activeId)

    if (activeItem) {
      scrollTocItemIntoView(listRef.current, activeItem)
    }
  }, [activeId])

  if (headings.length === 0) {
    return null
  }

  function scrollToHeading(headingId: string) {
    const target = document.getElementById(headingId)

    if (!target) {
      return
    }

    const offset = 88
    const top = window.scrollY + target.getBoundingClientRect().top - offset

    clickScrolling.current = true
    setActiveId(headingId)
    window.history.pushState(null, "", `#${headingId}`)
    window.scrollTo({ top, behavior: getScrollBehavior() })

    if (clickScrollTimer.current) {
      clearTimeout(clickScrollTimer.current)
    }

    clickScrollTimer.current = window.setTimeout(() => {
      clickScrolling.current = false
    }, 700)
  }

  function toggleSection(sectionId: string, event: React.MouseEvent) {
    event.preventDefault()
    event.stopPropagation()
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }))
  }

  const renderingItems: {
    heading: TocHeading
    isVisible: boolean
    hasLineGuide: boolean
  }[] = []
  let isCurrentParentExpanded = true

  headings.forEach((heading) => {
    if (heading.level === 1) {
      isCurrentParentExpanded = expandedSections[heading.id] !== false

      const matchesFilter = heading.text
        .toLowerCase()
        .includes(filterText.toLowerCase())
      renderingItems.push({
        heading,
        isVisible: filterText ? matchesFilter : true,
        hasLineGuide: false,
      })
    } else {
      const matchesFilter = heading.text
        .toLowerCase()
        .includes(filterText.toLowerCase())
      const isVisible = filterText ? matchesFilter : isCurrentParentExpanded

      renderingItems.push({
        heading,
        isVisible,
        hasLineGuide: isCurrentParentExpanded,
      })
    }
  })

  return (
    <nav
      className={cn(
        "flex flex-col overflow-hidden border border-border/50 bg-card/45 font-sans text-xs shadow-sm backdrop-blur-sm",
        className
      )}
      aria-label="Table of contents"
    >
      <div className="flex items-center justify-between border-b border-border/45 px-4 py-3">
        <p className="flex items-center gap-2 font-mono text-[11px] font-semibold tracking-wide text-foreground">
          <span className="relative flex size-2">
            <span className="relative inline-flex size-2 bg-primary/70"></span>
          </span>
          On this page
        </p>
        <span className="border border-border/20 bg-muted/45 px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">
          INDEX: {headings.length}
        </span>
      </div>

      <div className="relative border-b border-border/25 bg-muted/20 p-2">
        <FilterIcon className="pointer-events-none absolute top-1/2 left-4 size-3 -translate-y-1/2 text-muted-foreground/80" />
        <Input
          type="text"
          placeholder="Filter modules..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="h-7 w-full border-border/30 bg-background/35 pr-3 pl-7 font-mono text-[11px] focus:bg-background/80"
        />
      </div>

      <div
        ref={listRef}
        className="max-h-64 min-h-0 overflow-y-auto px-2 py-3 2xl:max-h-none 2xl:flex-1"
      >
        <ul className="space-y-0.5">
          {renderingItems.map(({ heading, isVisible }, index) => {
            if (!isVisible) return null

            const isActive = heading.id === activeId
            const prefix = index.toString().padStart(2, "0")
            const isFolder = heading.level === 1
            const isSubFolder = heading.level === 2
            const isExpanded = expandedSections[heading.id] !== false

            return (
              <li
                key={heading.id}
                className="relative"
                data-toc-id={heading.id}
              >
                <a
                  href={`#${heading.id}`}
                  className={cn(
                    "group/toc relative flex min-h-8 items-center gap-2 py-1 pr-1.5 transition-colors duration-150 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none",
                    isFolder
                      ? "bg-muted/10 pl-2 font-semibold text-foreground hover:bg-muted/25"
                      : isSubFolder
                        ? "pl-6 text-muted-foreground hover:bg-muted/15 hover:text-foreground"
                        : "pl-9 text-muted-foreground hover:bg-muted/15 hover:text-foreground",
                    isActive &&
                      (isFolder
                        ? "bg-accent/35 text-primary"
                        : "bg-accent/35 font-semibold text-primary")
                  )}
                  aria-current={isActive ? "location" : undefined}
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
                    scrollToHeading(heading.id)
                  }}
                >
                  {isActive && (
                    <span
                      className="absolute top-1.5 bottom-1.5 left-0 w-[2px] bg-primary/70"
                      aria-hidden="true"
                    />
                  )}

                  {isFolder ? (
                    <button
                      onClick={(e) => toggleSection(heading.id, e)}
                      className="shrink-0 p-0.5 text-muted-foreground transition-colors hover:bg-muted/45 hover:text-foreground"
                    >
                      {isExpanded ? (
                        <FolderOpenIcon className="size-3.5 text-primary/65" />
                      ) : (
                        <FolderIcon className="size-3.5 text-primary/65" />
                      )}
                    </button>
                  ) : (
                    <FileTextIcon className="size-3 shrink-0 text-muted-foreground/60" />
                  )}

                  <span className="shrink-0 font-mono text-[9px] tracking-tighter text-muted-foreground/70">
                    {prefix}
                  </span>

                  <span className="line-clamp-2 text-[11px] leading-4 break-all select-none">
                    {heading.text.replace(/^[\d\.]+\s*/, "")}
                  </span>

                  {isFolder &&
                    headings.some(
                      (h) => h.level > 1 && h.id.startsWith(heading.id)
                    ) && (
                      <button
                        onClick={(e) => toggleSection(heading.id, e)}
                        className="ml-auto shrink-0 p-0.5 text-muted-foreground/60 hover:text-foreground"
                      >
                        {isExpanded ? (
                          <ChevronDownIcon className="size-3" />
                        ) : (
                          <ChevronRightIcon className="size-3" />
                        )}
                      </button>
                    )}

                  {isActive && !isFolder && (
                    <CircleDotIcon className="ml-auto size-2 shrink-0 text-primary/70" />
                  )}
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
