"use client"

import Link from "next/link"
import { briefIndex, briefs, getBrief } from "@/lib/course"
import { briefHolds, isBriefComplete } from "@/lib/grade"
import { ChoiceGroup } from "@/components/choice-group"
import { ContextPacker } from "@/components/context-packer"
import { DesignNote } from "@/components/design-note"
import { IncidentLadder } from "@/components/incident-ladder"
import { useProgress } from "@/components/progress-provider"
import { RetrievalExhibit } from "@/components/retrieval-exhibit"
import { StagePath } from "@/components/stage-path"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function BriefView({ slug }: { slug: string }) {
  const brief = getBrief(slug)
  const { progress } = useProgress()
  if (!brief) return null

  const index = briefIndex(slug)
  const previous = index > 0 ? briefs[index - 1] : undefined
  const next = index < briefs.length - 1 ? briefs[index + 1] : undefined
  const complete = isBriefComplete(slug, progress)
  const holds = briefHolds(slug, progress)

  return (
    <article className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        {brief.number} · {brief.minutes} min · {brief.product}
      </p>
      <h1 className="mt-3 max-w-3xl font-display text-4xl tracking-tight text-balance sm:text-5xl">
        {brief.title}
      </h1>
      <p className="mt-4 max-w-3xl text-lg leading-relaxed text-ink/80">{brief.question}</p>
      <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4">
        {brief.constraints.map((constraint) => (
          <div key={constraint.label} className="bg-paper px-3 py-3 sm:px-4">
            <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {constraint.label}
            </dt>
            <dd className="mt-1 text-sm font-medium">{constraint.value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-8 max-w-3xl space-y-4 text-base leading-relaxed">
        {brief.situation.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <StagePath stages={brief.stages} caption={brief.stagesCaption} />
      {brief.exhibit === "traces" ? <RetrievalExhibit /> : null}
      {brief.questions.map((question) => (
        <ChoiceGroup key={question.id} question={question} />
      ))}
      {brief.interaction === "context" ? <ContextPacker /> : null}
      {brief.interaction === "incident" ? <IncidentLadder /> : null}
      {brief.interaction === "review" ? <DesignNote /> : null}
      <section className="mt-12 max-w-3xl rounded-xl border border-border bg-paper p-5 sm:p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          Field note {brief.number}
        </p>
        {complete ? (
          <>
            <h2 className="mt-2 font-display text-2xl tracking-tight text-balance">
              {brief.principle}
            </h2>
            <p className="mt-3 text-sm leading-relaxed">{brief.principleDetail}</p>
            <p
              className={cn(
                "mt-4 font-mono text-[11px] uppercase tracking-[0.16em]",
                holds ? "text-hold" : "text-break",
              )}
            >
              {holds
                ? "Your design holds. The note is filed."
                : "The note is filed. At least one choice still breaks — the marks above say which. Change it and the note updates."}
            </p>
          </>
        ) : (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Commit the decisions above to file this note. It files either way. Holding is a
            separate mark.
          </p>
        )}
      </section>
      <nav className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {previous ? (
          <Link
            href={`/brief/${previous.slug}`}
            className={cn(buttonVariants({ variant: "outline" }), "justify-start")}
          >
            {previous.number} {previous.title}
          </Link>
        ) : (
          <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
            Back to the map
          </Link>
        )}
        {next ? (
          <Link href={`/brief/${next.slug}`} className={cn(buttonVariants({ variant: "default" }))}>
            {next.number} {next.title}
          </Link>
        ) : (
          <Link href="/field-book" className={cn(buttonVariants({ variant: "default" }))}>
            Open the field book
          </Link>
        )}
      </nav>
    </article>
  )
}
