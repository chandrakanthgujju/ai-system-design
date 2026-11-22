"use client"

import { getBrief, reviewSynthesis } from "@/lib/course"
import { useProgress } from "@/components/progress-provider"
import { cn } from "@/lib/utils"

export function DesignNote() {
  const brief = getBrief("review")
  const { progress } = useProgress()
  if (!brief) return null

  const rows = brief.questions.map((question) => ({
    question,
    option: question.options.find((item) => item.id === progress.choices[question.id]),
  }))
  const decided = rows.filter((row) => row.option).length
  const holding = rows.filter((row) => row.option?.holds).length
  const ready = decided === rows.length

  return (
    <section className="mt-12 rounded-xl border border-border bg-paper p-5 sm:p-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        Design note
      </p>
      <h2 className="mt-2 font-display text-2xl tracking-tight">Inbox triage, as you designed it</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {ready
          ? `${holding} of ${rows.length} decisions hold.`
          : `${decided} of ${rows.length} decisions committed.`}
      </p>
      <div className="mt-5 space-y-5">
        {rows.map(({ question, option }) => (
          <article key={question.id}>
            <h3 className="text-sm font-medium">{question.prompt}</h3>
            {option ? (
              <>
                <p
                  className={cn(
                    "mt-1 font-mono text-[10px] uppercase tracking-[0.16em]",
                    option.holds ? "text-hold" : "text-break",
                  )}
                >
                  {option.holds ? "Holds" : "Breaks"} · {option.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed">{option.feedback}</p>
              </>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">Not decided.</p>
            )}
          </article>
        ))}
      </div>
      <p className="mt-6 border-t border-border pt-4 text-sm leading-relaxed">
        {ready && holding === rows.length
          ? reviewSynthesis
          : ready
            ? "This is the design you would take into the review. The breaks are the parts that fail in the inbox: a click that waits on a model, a prompt with no macro to measure, a send path that moves money, or a gate the easy mail can carry."
            : "The note fills in as you commit. It records the design you chose, including the parts that break."}
      </p>
    </section>
  )
}
