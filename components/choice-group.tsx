"use client"

import type { Meter, Question } from "@/lib/course"
import { useProgress } from "@/components/progress-provider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"

function Allowance({ meter }: { meter: Meter }) {
  const over = meter.used > meter.cap
  const width = Math.min(100, (meter.used / meter.cap) * 100)
  return (
    <div className="mt-3">
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full", over ? "bg-break" : "bg-hold")}
          style={{ width: `${width}%` }}
        />
      </div>
      <p className="mt-1 font-mono text-[11px] text-muted-foreground">
        {meter.used.toLocaleString()}
        {meter.unit} sketch against a {meter.cap.toLocaleString()}
        {meter.unit} ceiling
        {over ? " — over" : " — inside"}
      </p>
    </div>
  )
}

export function ChoiceGroup({ question }: { question: Question }) {
  const { progress, choose } = useProgress()
  const selectedId = progress.choices[question.id]

  return (
    <fieldset className="mt-10">
      <legend className="max-w-3xl font-display text-2xl tracking-tight text-balance">
        {question.prompt}
      </legend>
      {question.detail ? (
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {question.detail}
        </p>
      ) : null}
      <RadioGroup
        value={selectedId ?? ""}
        onValueChange={(value) => {
          if (typeof value === "string" && value) choose(question.id, value)
        }}
        className="mt-4 gap-3"
      >
        {question.options.map((option) => {
          const selected = selectedId === option.id
          return (
            <label
              key={option.id}
              onClick={() => choose(question.id, option.id)}
              className={cn(
                "block cursor-pointer rounded-xl border bg-paper p-4 transition-colors",
                selected && option.holds && "border-hold bg-hold-soft",
                selected && !option.holds && "border-break bg-break-soft",
                !selected && "border-border hover:border-ink/30",
              )}
            >
              <span className="flex gap-3">
                <RadioGroupItem value={option.id} className="mt-1" />
                <span className="min-w-0">
                  <span className="block font-medium">{option.title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                    {option.summary}
                  </span>
                  {option.meter ? <Allowance meter={option.meter} /> : null}
                </span>
              </span>
              {selected ? (
                <span className="mt-4 block border-t border-current/10 pt-3 text-sm leading-relaxed">
                  <span
                    className={cn(
                      "mb-1 block font-mono text-[10px] uppercase tracking-[0.16em]",
                      option.holds ? "text-hold" : "text-break",
                    )}
                  >
                    {option.holds ? "Holds" : "Breaks"}
                  </span>
                  {option.feedback}
                </span>
              ) : null}
            </label>
          )
        })}
      </RadioGroup>
    </fieldset>
  )
}
