import type { ComponentPropsWithoutRef, ReactNode } from "react"
import type { MDXComponents } from "mdx/types"

import { CodeBlock } from "@/components/code-block"
import { HeadingAnchor } from "@/components/heading-anchor"
import { cn } from "@/lib/utils"

function getTextContent(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node)
  }

  if (Array.isArray(node)) {
    return node.map(getTextContent).join("")
  }

  return ""
}

function slugify(node: ReactNode) {
  return getTextContent(node)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function getHeadingData(children: ReactNode, id?: string) {
  const label = getTextContent(children).trim() || "Section"
  const headingId = (id ?? slugify(label)) || "section"

  return { headingId, label }
}

export const mdxComponents: MDXComponents = {
  h1: ({
    className,
    children,
    id,
    ...props
  }: ComponentPropsWithoutRef<"h1">) => {
    const { headingId, label } = getHeadingData(children, id)

    return (
      <HeadingAnchor
        as="h1"
        id={headingId}
        label={label}
        className={cn(
          "relative mt-4 mb-8 border-b border-border/45 pb-6 font-mono text-4xl font-bold tracking-tight text-balance text-foreground after:absolute after:bottom-[-1px] after:left-0 after:h-[2px] after:w-12 after:bg-primary/65 sm:text-5xl",
          className
        )}
        {...props}
      >
        {children}
      </HeadingAnchor>
    )
  },
  h2: ({
    className,
    children,
    id,
    ...props
  }: ComponentPropsWithoutRef<"h2">) => {
    const { headingId, label } = getHeadingData(children, id)

    return (
      <HeadingAnchor
        as="h2"
        id={headingId}
        label={label}
        className={cn(
          "mt-14 mb-5 flex scroll-mt-28 items-center gap-2 border-b border-border/35 pb-2 font-mono text-xl font-semibold tracking-tight text-foreground",
          className
        )}
        {...props}
      >
        {children}
      </HeadingAnchor>
    )
  },
  h3: ({
    className,
    children,
    id,
    ...props
  }: ComponentPropsWithoutRef<"h3">) => {
    const { headingId, label } = getHeadingData(children, id)

    return (
      <HeadingAnchor
        as="h3"
        id={headingId}
        label={label}
        className={cn(
          "mt-10 mb-4 flex items-center gap-1.5 font-mono text-base font-semibold tracking-tight text-foreground/90",
          className
        )}
        {...props}
      >
        {children}
      </HeadingAnchor>
    )
  },
  p: ({ className, ...props }: ComponentPropsWithoutRef<"p">) => (
    <p
      className={cn(
        "my-4 font-sans text-sm leading-7 tracking-normal text-foreground/90",
        className
      )}
      {...props}
    />
  ),
  a: ({ className, ...props }: ComponentPropsWithoutRef<"a">) => (
    <a
      className={cn(
        "px-1 py-0.5 font-medium text-primary underline decoration-primary/40 underline-offset-4 transition-colors duration-150 hover:bg-accent/45 hover:text-foreground",
        className
      )}
      {...props}
    />
  ),
  ul: ({ className, ...props }: ComponentPropsWithoutRef<"ul">) => (
    <ul
      className={cn(
        "my-5 flex list-disc flex-col gap-2 pl-6 font-sans text-sm marker:text-primary/65",
        className
      )}
      {...props}
    />
  ),
  ol: ({ className, ...props }: ComponentPropsWithoutRef<"ol">) => (
    <ol
      className={cn(
        "my-5 flex list-decimal flex-col gap-2 pl-6 font-sans text-sm marker:text-primary/65",
        className
      )}
      {...props}
    />
  ),
  li: ({ className, ...props }: ComponentPropsWithoutRef<"li">) => (
    <li className={cn("pl-1 leading-6", className)} {...props} />
  ),
  blockquote: ({
    className,
    ...props
  }: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      className={cn(
        "my-6 border-l-2 border-primary/60 bg-muted/20 px-4 py-3 font-sans text-sm text-muted-foreground/90 italic",
        className
      )}
      {...props}
    />
  ),
  code: ({ className, ...props }: ComponentPropsWithoutRef<"code">) => {
    const isCodeBlock = className?.includes("language-")

    return (
      <code
        className={cn(
          isCodeBlock
            ? "font-mono text-[11px] tracking-tight"
            : "border border-border/60 bg-muted/45 px-1.5 py-0.5 font-mono text-[11px] tracking-tight text-foreground/90 select-all",
          className
        )}
        {...props}
      />
    )
  },
  pre: CodeBlock,
  table: ({ className, ...props }: ComponentPropsWithoutRef<"table">) => (
    <div className="my-6 overflow-hidden border border-border/50 bg-card/35 shadow-sm backdrop-blur-sm">
      <table
        className={cn(
          "w-full border-collapse text-left font-sans text-xs leading-6",
          className
        )}
        {...props}
      />
    </div>
  ),
  thead: ({ className, ...props }: ComponentPropsWithoutRef<"thead">) => (
    <thead
      className={cn(
        "border-b border-border/40 bg-muted/50 font-mono text-[10px] tracking-wider text-muted-foreground/80 uppercase",
        className
      )}
      {...props}
    />
  ),
  tbody: ({ className, ...props }: ComponentPropsWithoutRef<"tbody">) => (
    <tbody className={cn("divide-y divide-border/20", className)} {...props} />
  ),
  tr: ({ className, ...props }: ComponentPropsWithoutRef<"tr">) => (
    <tr
      className={cn(
        "border-border/25 transition-colors duration-150 hover:bg-muted/10",
        className
      )}
      {...props}
    />
  ),
  th: ({ className, ...props }: ComponentPropsWithoutRef<"th">) => (
    <th
      className={cn(
        "border-r border-border/40 px-4 py-2.5 font-bold last:border-r-0",
        className
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }: ComponentPropsWithoutRef<"td">) => (
    <td
      className={cn(
        "border-r border-border/20 px-4 py-2.5 align-top text-foreground/85 last:border-r-0",
        className
      )}
      {...props}
    />
  ),
  del: ({ className, ...props }: ComponentPropsWithoutRef<"del">) => (
    <del className={cn("text-muted-foreground", className)} {...props} />
  ),
  hr: ({ className, ...props }: ComponentPropsWithoutRef<"hr">) => (
    <hr
      className={cn("my-10 border-t border-border/30", className)}
      {...props}
    />
  ),
  input: ({
    className,
    readOnly,
    type,
    ...props
  }: ComponentPropsWithoutRef<"input">) => (
    <input
      type={type}
      readOnly={type === "checkbox" ? true : readOnly}
      className={cn(
        type === "checkbox"
          ? "mr-2 size-3 translate-y-px border border-primary/40 accent-primary"
          : "border border-border/40 bg-background px-2 py-1 font-mono text-xs",
        className
      )}
      {...props}
    />
  ),
}

export function useMDXComponents(): MDXComponents {
  return mdxComponents
}
