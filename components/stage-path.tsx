"use client"

import { useState } from "react"
import type { Stage } from "@/lib/course"
import { cn } from "@/lib/utils"

export function StagePath({
  stages,
  caption,
}: {
  stages: Stage[]
  caption: string
}) {
  const [activeId, setActiveId] = useState(stages[0]?.id ?? "")
  const active = stages.find((stage) => stage.id === activeId) ?? stages[0]

  if (!active) return null

  const rows = [
    ["In", active.input],
    ["Out", active.output],
    ["Fails when", active.failure],
    ["Watch", active.metric],
  ] as const

  return (
    <figure className="mt-8">
      <figcaption className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        The path
      </figcaption>
      <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{caption}</p>
      <ol className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {stages.map((stage, index) => {
          const selected = stage.id === active.id
          return (
            <li key={stage.id} className="flex items-center gap-2">
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => setActiveId(stage.id)}
                className={cn(
                  "w-36 shrink-0 rounded-lg border px-3 py-2 text-left transition-colors sm:w-40",
                  selected
                    ? "border-primary bg-paper shadow-sm"
                    : "border-border bg-paper/40 hover:bg-paper",
                )}
              >
                <span className="font-mono text-[10px] text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="mt-1 block text-sm leading-snug font-medium">{stage.name}</span>
              </button>
            </li>
          )
        })}
      </ol>
      <div className="mt-3 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
        {rows.map(([label, text]) => (
          <div key={label} className="bg-paper px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {label}
            </p>
            <p className="mt-1 text-sm leading-relaxed">{text}</p>
          </div>
        ))}
      </div>
    </figure>
  )
}
