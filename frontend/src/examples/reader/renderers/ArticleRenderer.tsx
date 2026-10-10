import { cn } from "@hollis-labs/design-components"
import { readerPlainTextExcerpt } from "../model"
import type { ReaderItem } from "../types"

export interface ArticleRendererProps {
  item: ReaderItem
  presentation: "card" | "detail"
  className?: string
}

export function ArticleRenderer({ item, presentation, className }: ArticleRendererProps) {
  const content = item.article.preview_markdown.trim() || item.display.summary.value.trim()
  const excerpt = readerPlainTextExcerpt(content, presentation === "card" ? 480 : 3600)

  if (presentation === "card") {
    return (
      <div
        className={cn("min-w-0", className)}
        data-reader-renderer="article"
        data-reader-presentation="card"
      >
        <p className="line-clamp-5 text-sm leading-6 text-text-muted">
          {excerpt || "No article preview was captured."}
        </p>
        {item.article.full_content_available && (
          <p className="mt-3 text-xs leading-5 text-text-subtle">Full article available</p>
        )}
      </div>
    )
  }

  return (
    <section
      className={cn("mx-auto w-full max-w-[78ch]", className)}
      data-reader-renderer="article"
      data-reader-presentation="detail"
    >
      <div className="text-base leading-7 text-text-muted whitespace-pre-wrap font-sans">
        {excerpt || "No readable article content was captured."}
      </div>
      {item.article.full_content_available && (
        <p className="mt-4 text-xs leading-5 text-text-subtle" role="status">
          Full article available (reading preview displayed).
        </p>
      )}
    </section>
  )
}
