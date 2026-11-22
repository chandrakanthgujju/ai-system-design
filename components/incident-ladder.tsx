"use client"

import { incidentSteps } from "@/lib/course"
import { useProgress } from "@/components/progress-provider"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function IncidentLadder() {
  const { progress, tryIncident, resetIncident } = useProgress()
  const done = progress.incidentStep >= incidentSteps.length
  const current = incidentSteps[progress.incidentStep]

  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl tracking-tight">The ladder</h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        One check at a time. A wrong check stays on the page with what it would have shown you,
        which is how you learn not to open it first next time.
      </p>
      <ol className="mt-6 space-y-4">
        {incidentSteps.slice(0, progress.incidentStep).map((step, index) => {
          const finding = step.options.find((option) => option.holds)
          return (
            <li key={step.id} className="rounded-xl border border-hold/40 bg-hold-soft px-4 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-hold">
                Check {index + 1} · {finding?.title}
              </p>
              <p className="mt-2 text-sm leading-relaxed">{finding?.feedback}</p>
            </li>
          )
        })}
      </ol>
      {current ? (
        <div className="mt-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            Check {progress.incidentStep + 1} of {incidentSteps.length}
          </p>
          <h3 className="mt-2 max-w-3xl font-display text-xl tracking-tight text-balance">
            {current.prompt}
          </h3>
          <ul className="mt-4 space-y-3">
            {current.options.map((option) => {
              const tried = (progress.incidentTried[current.id] ?? []).includes(option.id)
              return (
                <li key={option.id}>
                  <button
                    type="button"
                    onClick={() => tryIncident(current.id, option.id)}
                    className={cn(
                      "w-full rounded-xl border bg-paper px-4 py-3 text-left transition-colors",
                      tried && option.holds && "border-hold bg-hold-soft",
                      tried && !option.holds && "border-break bg-break-soft",
                      !tried && "border-border hover:border-ink/30",
                    )}
                  >
                    <span className="block font-medium">{option.title}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                      {option.summary}
                    </span>
                    {tried ? (
                      <span className="mt-3 block border-t border-current/10 pt-3 text-sm leading-relaxed">
                        <span
                          className={cn(
                            "mb-1 block font-mono text-[10px] uppercase tracking-[0.16em]",
                            option.holds ? "text-hold" : "text-break",
                          )}
                        >
                          {option.holds ? "This is the check" : "Does not explain Tuesday"}
                        </span>
                        {option.feedback}
                      </span>
                    ) : null}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}
      {done ? (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <p className="text-sm text-muted-foreground">
            The ladder is filed. The old clause is gone, the cache key knows the version, and
            the next bad replace has a page that does not wait for a thumbs-down.
          </p>
          <Button type="button" variant="outline" onClick={resetIncident}>
            Walk it again
          </Button>
        </div>
      ) : null}
    </section>
  )
}
