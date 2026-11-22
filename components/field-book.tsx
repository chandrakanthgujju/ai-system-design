"use client"

import Link from "next/link"
import { briefs } from "@/lib/course"
import { briefHolds, isBriefComplete } from "@/lib/grade"
import { useProgress } from "@/components/progress-provider"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function FieldBook() {
  const { progress, reset } = useProgress()
  const filed = briefs.filter((brief) => isBriefComplete(brief.slug, progress))
  const open = briefs.filter((brief) => !isBriefComplete(brief.slug, progress))

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        Field book
      </p>
      <h1 className="mt-3 font-display text-4xl tracking-tight sm:text-5xl">What you would defend</h1>
      <p className="mt-4 max-w-3xl text-base leading-relaxed">
        A note files when you commit the brief, including a design that still breaks. Holding
        means the design survives the constraints. Both marks stay in this browser.
      </p>
      {filed.length === 0 ? (
        <div className="mt-10 max-w-3xl rounded-xl border border-dashed border-border bg-paper px-5 py-6">
          <p className="font-display text-2xl tracking-tight">Nothing filed yet.</p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Start with the latency budget. A suggestion that arrives after the support agent has
            already spoken is not a suggestion, and the model you wanted is usually the one the
            ceiling will not pay for.
          </p>
          <Link
            href="/brief/budgets"
            className="mt-4 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Open 01 Budgets
          </Link>
        </div>
      ) : (
        <ol className="mt-10 space-y-4">
          {filed.map((brief) => {
            const holds = briefHolds(brief.slug, progress)
            return (
              <li key={brief.slug} className="rounded-xl border border-border bg-paper p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    {brief.number} · {brief.title}
                  </p>
                  <p
                    className={cn(
                      "font-mono text-[11px] uppercase tracking-[0.14em]",
                      holds ? "text-hold" : "text-break",
                    )}
                  >
                    {holds ? "Holds" : "Break still open"}
                  </p>
                </div>
                <h2 className="mt-2 font-display text-2xl tracking-tight text-balance">
                  {brief.principle}
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed">{brief.principleDetail}</p>
                <Link
                  href={`/brief/${brief.slug}`}
                  className="mt-3 inline-block text-sm text-primary underline-offset-4 hover:underline"
                >
                  Reopen the brief
                </Link>
              </li>
            )
          })}
        </ol>
      )}
      {open.length > 0 && filed.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-display text-2xl tracking-tight">Still open</h2>
          <ul className="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border bg-paper">
            {open.map((brief) => (
              <li key={brief.slug}>
                <Link
                  href={`/brief/${brief.slug}`}
                  className="flex items-baseline justify-between gap-4 px-4 py-3 hover:bg-desk/60"
                >
                  <span>
                    <span className="font-mono text-xs text-muted-foreground">{brief.number}</span>
                    <span className="ml-3 font-medium">{brief.title}</span>
                  </span>
                  <span className="text-sm text-muted-foreground">{brief.product}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <div className="mt-12">
        <Button type="button" variant="outline" onClick={reset}>
          Clear this browser’s notes
        </Button>
      </div>
    </div>
  )
}
