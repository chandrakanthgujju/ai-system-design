"use client"

import Link from "next/link"
import { briefs } from "@/lib/course"
import { briefHolds, isBriefComplete } from "@/lib/grade"
import { useProgress } from "@/components/progress-provider"
import { cn } from "@/lib/utils"

export function CourseMap() {
  const { progress } = useProgress()

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        A field course
      </p>
      <h1 className="mt-3 max-w-3xl font-display text-4xl tracking-tight text-balance sm:text-6xl">
        Design the system around the model.
      </h1>
      <div className="mt-6 max-w-3xl space-y-4 text-base leading-relaxed sm:text-lg">
        <p>
          Applied AI system design is how a model call survives contact with a product. The
          model is one stage. Around it are a budget, a corpus, a window you refuse to fill, a
          side effect the model is not allowed to take, an eval that matches the harm, and the
          trace you will need on a Tuesday.
        </p>
        <p>
          Northline is six production briefs and a design review. Each one asks you to choose
          under constraints that do not bend. The feedback names what breaks: a latency ceiling,
          a citation that points at the wrong year, a refund that can fire twice.
        </p>
      </div>
      <ol className="mt-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {briefs.slice(0, 6).map((brief) => (
          <li key={brief.slug}>
            <Link
              href={`/brief/${brief.slug}`}
              className="block h-full rounded-xl border border-border bg-paper px-4 py-3 transition-colors hover:border-ink/30"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                {brief.number}
              </span>
              <span className="mt-1 block text-sm leading-snug">{brief.question}</span>
            </Link>
          </li>
        ))}
      </ol>
      <section className="mt-14">
        <h2 className="font-display text-2xl tracking-tight">The briefs</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Work them in order if you can. Nothing is locked. Read the constraint strip before the
          architecture. Inspect a stage for its contract in, its contract out, the way it fails,
          and the metric you would watch. Then commit a design. The field book keeps the
          principle once you do.
        </p>
        <ol className="mt-6 divide-y divide-border overflow-hidden rounded-xl border border-border bg-paper">
          {briefs.map((brief) => {
            const complete = isBriefComplete(brief.slug, progress)
            const holds = briefHolds(brief.slug, progress)
            const mark = !complete ? "Open" : holds ? "Holds" : "Filed, with a break"
            return (
              <li key={brief.slug}>
                <Link
                  href={`/brief/${brief.slug}`}
                  className="grid gap-3 px-4 py-4 transition-colors hover:bg-desk/60 sm:grid-cols-[4rem_minmax(0,1fr)_auto] sm:items-center sm:px-5"
                >
                  <span className="font-mono text-xs text-muted-foreground">{brief.number}</span>
                  <span>
                    <span className="block font-display text-xl tracking-tight">{brief.title}</span>
                    <span className="mt-1 block text-sm text-muted-foreground">
                      {brief.product} · {brief.minutes} min
                    </span>
                    <span className="mt-2 flex flex-wrap gap-1.5">
                      {brief.constraints.map((constraint) => (
                        <span
                          key={constraint.label}
                          className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground"
                        >
                          {constraint.value}
                        </span>
                      ))}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "font-mono text-[11px] uppercase tracking-[0.14em] sm:text-right",
                      holds && "text-hold",
                      complete && !holds && "text-break",
                      !complete && "text-muted-foreground",
                    )}
                  >
                    {mark}
                  </span>
                </Link>
              </li>
            )
          })}
        </ol>
      </section>
    </div>
  )
}
