import { retrievalTraces } from "@/lib/course"
import { cn } from "@/lib/utils"

export function RetrievalExhibit() {
  return (
    <section className="mt-10">
      <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        Two queries, three channels
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        Top three passages for each channel. A marked passage is one you could cite as the
        answer. The others are neighbors, filename collisions, or the right theme with the
        wrong sentence.
      </p>
      <div className="mt-5 space-y-8">
        {retrievalTraces.map((query) => (
          <div key={query.query}>
            <p className="font-display text-lg tracking-tight">“{query.query}”</p>
            <div className="mt-3 grid gap-3 lg:grid-cols-3">
              {query.columns.map((column) => (
                <div key={column.name} className="rounded-lg border border-border bg-paper">
                  <p className="border-b border-border px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                    {column.name}
                  </p>
                  <ol className="divide-y divide-border">
                    {column.hits.map((hit, index) => (
                      <li key={hit.title} className="px-3 py-3">
                        <p className="flex items-start justify-between gap-3 text-sm font-medium">
                          <span>
                            <span className="mr-2 font-mono text-[10px] text-muted-foreground">
                              {index + 1}
                            </span>
                            {hit.title}
                          </span>
                          <span
                            className={cn(
                              "shrink-0 font-mono text-[10px] uppercase tracking-[0.12em]",
                              hit.hit ? "text-hold" : "text-muted-foreground",
                            )}
                          >
                            {hit.hit ? "Cite" : "Miss"}
                          </span>
                        </p>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                          {hit.note}
                        </p>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
