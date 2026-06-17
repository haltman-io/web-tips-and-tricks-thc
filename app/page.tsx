import { TableOfContents } from "@/components/table-of-contents"
import { renderTipsAndTricks } from "@/lib/render-tips-and-tricks"

export default async function Page() {
  const content = await renderTipsAndTricks()

  return (
    <main
      id="content"
      tabIndex={-1}
      className="tips-page bg-background outline-none"
    >
      <aside className="tips-toc-panel">
        <TableOfContents className="h-full" />
      </aside>
      <div className="tips-compact-toc">
        <TableOfContents />
      </div>
      <article id="article-content" className="tips-article">
        {content}
      </article>
    </main>
  )
}
