import { readFile } from "node:fs/promises"
import path from "node:path"
import type { ReactNode } from "react"
import { Fragment, jsx, jsxs } from "react/jsx-runtime"
import type { Element, Root, RootContent } from "hast"
import rehypeShiki from "@shikijs/rehype"
import rehypeRaw from "rehype-raw"
import rehypeReact, { type Components } from "rehype-react"
import rehypeSanitize from "rehype-sanitize"
import remarkGfm from "remark-gfm"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import { unified } from "unified"

import { mdxComponents } from "@/mdx-components"

const contentPath = path.join(process.cwd(), "tips-and-tricks.mdx")
const clobberPrefix = "user-content-"

type ShikiPreContext = {
  source: string
  options: {
    lang?: string
  }
}

function isElement(node: Root | RootContent): node is Element {
  return node.type === "element"
}

function walk(node: Root | RootContent, visitor: (node: Element) => void) {
  if (isElement(node)) {
    visitor(node)
  }

  if ("children" in node) {
    for (const child of node.children) {
      walk(child, visitor)
    }
  }
}

function rewriteReferenceList(value: unknown, idMap: Map<string, string>) {
  if (typeof value !== "string") {
    return value
  }

  return value
    .split(/\s+/)
    .map((reference) => idMap.get(reference) ?? reference)
    .join(" ")
}

function rehypeRewriteSanitizedHashReferences() {
  return function transformer(tree: Root) {
    const idMap = new Map<string, string>()

    walk(tree, (node) => {
      const properties = node.properties as Record<string, unknown>

      for (const key of ["id", "name"]) {
        const value = properties[key]

        if (typeof value === "string" && value.startsWith(clobberPrefix)) {
          idMap.set(value.slice(clobberPrefix.length), value)
        }
      }
    })

    walk(tree, (node) => {
      const properties = node.properties as Record<string, unknown>
      const href = properties.href

      if (typeof href === "string" && href.startsWith("#")) {
        const target = href.slice(1)
        const rewrittenTarget = idMap.get(target)

        if (rewrittenTarget) {
          properties.href = `#${rewrittenTarget}`
        }
      }

      for (const key of [
        "aria-describedby",
        "ariaDescribedBy",
        "aria-labelledby",
        "ariaLabelledBy",
      ]) {
        properties[key] = rewriteReferenceList(properties[key], idMap)
      }
    })
  }
}

function shikiCodeBlockMeta() {
  return {
    name: "code-block-meta",
    pre(this: ShikiPreContext, node: Element) {
      const properties = (node.properties ??= {}) as Record<string, unknown>

      properties["data-code"] = this.source
      properties["data-language"] = this.options.lang ?? "text"
    },
  }
}

export async function renderTipsAndTricks(): Promise<ReactNode> {
  const source = await readFile(contentPath, "utf8")
  // Keep authoring in a .mdx file, but parse it as GFM + sanitized HTML only.
  // This avoids executing MDX imports, JSX expressions, or event handlers.
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, {
      allowDangerousHtml: true,
      clobberPrefix: "",
    })
    .use(rehypeRaw)
    .use(rehypeSanitize)
    .use(rehypeShiki, {
      themes: {
        light: "andromeeda",
        dark: "andromeeda",
      },
      defaultLanguage: "text",
      fallbackLanguage: "text",
      addLanguageClass: true,
      transformers: [shikiCodeBlockMeta()],
    })
    .use(rehypeRewriteSanitizedHashReferences)
    .use(rehypeReact, {
      Fragment,
      jsx,
      jsxs,
      components: mdxComponents as Components,
    })
    .process(source)

  return file.result as ReactNode
}
