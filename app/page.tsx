import { TableOfContents } from "@/components/table-of-contents"
import { renderTipsAndTricks } from "@/lib/render-tips-and-tricks"

const noticeLinkClassName =
  "font-semibold text-primary underline decoration-primary/40 underline-offset-4 transition-colors duration-150 hover:text-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"

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
        <ProjectNotice />
        {content}
      </article>
    </main>
  )
}

function ProjectNotice() {
  return (
    <section
      className="mb-12 border border-primary/35 bg-card/55 p-4 shadow-sm sm:p-5"
      aria-label="Project notice"
    >
      <div className="flex flex-col gap-4 border-l-2 border-primary/70 pl-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] font-semibold tracking-wide text-muted-foreground">
          <span className="size-2 bg-primary/80" aria-hidden="true" />
          <span>Project notice</span>
        </div>

        <div className="flex flex-col gap-4 text-sm leading-7 text-foreground/90">
          <p>
            Created by{" "}
            <span className="font-mono text-foreground">
              extencil@segfault.net
            </span>
            , released by{" "}
            <a
              href="https://haltman.io/"
              className={noticeLinkClassName}
              target="_blank"
              rel="noreferrer"
            >
              Haltman-IO
            </a>
            .
          </p>

          <p>
            THC published their work for free and helped build the core of
            hacking worldwide. Unfortunately, it&apos;s common to see
            &quot;hackers&quot; nowadays charging for everything as a
            &quot;subscription&quot; in their vibecoded SaaS platforms.
          </p>

          <p>
            Information should be free, accessible, and free of charge. As a
            protest, I&apos;m publishing this work under{" "}
            <a
              href="https://unlicense.org/"
              className={noticeLinkClassName}
              target="_blank"
              rel="noreferrer"
            >
              UNLICENSE
            </a>
            .
          </p>

          <p>
            Source code:{" "}
            <a
              href="https://github.com/haltman-io/web-tips-and-tricks-thc"
              className={noticeLinkClassName}
              target="_blank"
              rel="noreferrer"
            >
              https://github.com/haltman-io/web-tips-and-tricks-thc
            </a>
          </p>

          <p className="font-mono text-xs font-semibold tracking-tight text-foreground">
            Copy it, Modify it, Contribute to it, Sell it. It&apos;s yours.
            <br />
            For the LULZ. For the record. For the network.
          </p>
        </div>
      </div>
    </section>
  )
}
