"use client"

import { contextBlocks, CONTEXT_BUDGET } from "@/lib/course"
import { gradePack, type FlagTone } from "@/lib/grade"
import { useProgress } from "@/components/progress-provider"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const toneClass: Record<FlagTone, string> = {
  hold: "border-hold/40 bg-hold-soft",
  break: "border-break/40 bg-break-soft",
  watch: "border-watch/40 bg-watch-soft",
}

const toneLabel: Record<FlagTone, string> = {
  hold: "Holds",
  break: "Breaks",
  watch: "Watch",
}

export function ContextPacker() {
  const { progress, toggleBlock, reviewPack } = useProgress()
  const grade = gradePack(progress.pack)
  const ratio = Math.min(100, (grade.tokens / grade.budget) * 100)
  const over = grade.tokens > CONTEXT_BUDGET

  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl tracking-tight">Pack the window</h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        Toggle the blocks the generation call is allowed to see. The brief has to say who the
        account is, what is open, what changed recently, and whether support is on fire. Stay
        inside {CONTEXT_BUDGET.toLocaleString()} tokens, and never receive the NDA. Several packs
        hold. Stuffing the window is not one of them.
      </p>
      <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <ul className="space-y-2">
          {contextBlocks.map((block) => {
            const on = progress.pack.includes(block.id)
            return (
              <li key={block.id}>
                <label
                  className={cn(
                    "flex cursor-pointer gap-3 rounded-xl border bg-paper px-4 py-3",
                    on ? "border-ink/40" : "border-border hover:border-ink/25",
                    block.kind === "forbidden" && on && "border-break bg-break-soft",
                  )}
                >
                  <input
                    type="checkbox"
                    className="mt-1 size-4 accent-primary"
                    checked={on}
                    onChange={() => toggleBlock(block.id)}
                  />
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <span className="font-medium">{block.name}</span>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {block.tokens.toLocaleString()} tokens
                      </span>
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                      {block.detail}
                    </span>
                  </span>
                </label>
              </li>
            )
          })}
        </ul>
        <aside className="h-fit rounded-xl border border-border bg-paper p-4 lg:sticky lg:top-24">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            Allowance
          </p>
          <p className="mt-2 font-display text-3xl tracking-tight tabular-nums">
            {grade.tokens.toLocaleString()}
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            of {CONTEXT_BUDGET.toLocaleString()} tokens
          </p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className={cn("h-full rounded-full", over ? "bg-break" : "bg-hold")}
              style={{ width: `${ratio}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {progress.pack.length === 0
              ? "No blocks selected."
              : `${progress.pack.length} block${progress.pack.length === 1 ? "" : "s"} selected.`}
          </p>
          <Button type="button" className="mt-4 w-full" onClick={reviewPack}>
            {progress.packReviewed ? "Review again" : "Review this pack"}
          </Button>
        </aside>
      </div>
      {progress.packReviewed ? (
        <div className="mt-6 space-y-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            {grade.holds ? "This pack holds" : "This pack breaks"}
          </p>
          {grade.flags.map((flag) => (
            <article key={flag.title} className={cn("rounded-xl border px-4 py-3", toneClass[flag.tone])}>
              <p
                className={cn(
                  "font-mono text-[10px] uppercase tracking-[0.16em]",
                  flag.tone === "hold" && "text-hold",
                  flag.tone === "break" && "text-break",
                  flag.tone === "watch" && "text-watch",
                )}
              >
                {toneLabel[flag.tone]}
              </p>
              <h3 className="mt-1 font-medium">{flag.title}</h3>
              <p className="mt-1 text-sm leading-relaxed">{flag.text}</p>
            </article>
          ))}
          {grade.orderNote ? (
            <article className="rounded-xl border border-border bg-paper px-4 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Order
              </p>
              <p className="mt-1 text-sm leading-relaxed">{grade.orderNote}</p>
            </article>
          ) : null}
        </div>
      ) : (
        <p className="mt-6 text-sm text-muted-foreground">
          The tally updates as you toggle. The review files the brief, whether the pack holds or
          not. You can change it after.
        </p>
      )}
    </section>
  )
}
