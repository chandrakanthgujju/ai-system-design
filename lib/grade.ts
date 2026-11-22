import {
  CONTEXT_BUDGET,
  type Brief,
  briefs,
  contextBlocks,
  getBrief,
  incidentSteps,
} from "./course"

export type FlagTone = "hold" | "break" | "watch"

export type PackFlag = {
  tone: FlagTone
  title: string
  text: string
}

export type PackGrade = {
  tokens: number
  budget: number
  holds: boolean
  flags: PackFlag[]
  orderNote: string | null
}

export type Progress = {
  choices: Record<string, string>
  pack: string[]
  packReviewed: boolean
  incidentStep: number
  incidentTried: Record<string, string[]>
}

export const emptyProgress: Progress = {
  choices: {},
  pack: [],
  packReviewed: false,
  incidentStep: 0,
  incidentTried: {},
}

function isStringRecord(value: unknown): value is Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false
  return Object.values(value).every((item) => typeof item === "string")
}

function isTriedRecord(value: unknown): value is Record<string, string[]> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false
  return Object.values(value).every(
    (item) => Array.isArray(item) && item.every((entry) => typeof entry === "string"),
  )
}

export function normalizeProgress(value: unknown): Progress {
  if (!value || typeof value !== "object") return emptyProgress
  const raw = value as Partial<Progress>
  const step =
    typeof raw.incidentStep === "number" && Number.isFinite(raw.incidentStep)
      ? Math.min(Math.max(0, Math.floor(raw.incidentStep)), incidentSteps.length)
      : 0
  const knownBlocks = new Set(contextBlocks.map((block) => block.id))
  return {
    choices: isStringRecord(raw.choices) ? raw.choices : {},
    pack: Array.isArray(raw.pack)
      ? raw.pack.filter((id): id is string => typeof id === "string" && knownBlocks.has(id))
      : [],
    packReviewed: Boolean(raw.packReviewed),
    incidentStep: step,
    incidentTried: isTriedRecord(raw.incidentTried) ? raw.incidentTried : {},
  }
}

export function gradePack(selectedIds: string[]): PackGrade {
  const selected = contextBlocks.filter((block) => selectedIds.includes(block.id))
  const tokens = selected.reduce((sum, block) => sum + block.tokens, 0)
  const flags: PackFlag[] = []
  const has = (id: string) => selectedIds.includes(id)

  if (selected.length === 0) {
    flags.push({
      tone: "break",
      title: "Nothing in the window",
      text: "An empty pack still produces a brief. The model will write it from prior habit: a plausible account, a plausible last touch, a plausible risk. That is the failure this product has to make impossible.",
    })
  }

  if (selected.length > 0 && tokens > CONTEXT_BUDGET) {
    flags.push({
      tone: "break",
      title: "Over the allowance",
      text: `${tokens.toLocaleString()} tokens against a ${CONTEXT_BUDGET.toLocaleString()} allowance. The call will truncate, and truncation will not consult the product. Whatever fell off the end is what the brief silently loses. Select fewer blocks.`,
    })
  } else if (selected.length > 0) {
    flags.push({
      tone: "hold",
      title: "Inside the allowance",
      text: `${tokens.toLocaleString()} of ${CONTEXT_BUDGET.toLocaleString()} tokens. The spare room is intentional. A brief does not get better because the window got fuller.`,
    })
  }

  if (has("nda")) {
    flags.push({
      tone: "break",
      title: "Legal text is in the prompt",
      text: "The NDA will be quoted, summarized, or mistaken for the commercial record. Refuse the class before the prompt is built. An instruction that says “ignore the NDA” is not a refusal. The bytes are still in the window.",
    })
  } else if (selected.length > 0) {
    flags.push({
      tone: "hold",
      title: "The NDA stays out",
      text: "Legal text is a class, not a document you hope the model skips. Leaving it unselected is the control.",
    })
  }

  const lastWeek = has("touch") || has("emails5")
  if (selected.length > 0 && !lastWeek) {
    flags.push({
      tone: "break",
      title: "Nothing can answer last week",
      text: "The seller will ask what changed. If the pack has no last-touch line and no recent mail, the model will invent a last touch, because a brief that says nothing feels broken. “Not in the record” is only possible when the record was actually given a chance to contain it.",
    })
  } else if (lastWeek) {
    flags.push({
      tone: "hold",
      title: "Last week is answerable",
      text: has("touch")
        ? "The structured last-touch line is the reliable answer to “what changed.” It is seventy tokens and it already names the date and the person."
        : "The trimmed emails can answer what changed, at 1,600 tokens, and they are easier to misread than a single CRM line. The last-touch field would have been the sturdier choice. This still holds.",
    })
  }

  if (selected.length > 0 && !has("spine")) {
    flags.push({
      tone: "break",
      title: "No account spine",
      text: "Without the plan, the owner, and the renewal, the brief is a pile of anecdotes that could belong to a neighboring account. The spine is what the rest of the blocks are about.",
    })
  } else if (has("spine")) {
    flags.push({
      tone: "hold",
      title: "The brief knows which account this is",
      text: "Plan, owner, renewal, ARR. The model does not have to infer them from an email signature.",
    })
  }

  if (selected.length > 0 && !has("opps")) {
    flags.push({
      tone: "break",
      title: "Nothing open is in the record",
      text: "The seller is walking into a call about a deal. Without the open opportunities, the model will invent a stage and an amount. “Not in the record” is only honest if the opportunities block was available and empty, not if you left it out.",
    })
  } else if (has("opps")) {
    flags.push({
      tone: "hold",
      title: "Open work is structured",
      text: "Stage, amount, close date, next step. That is the whole answer to “what is open,” and it is 280 tokens.",
    })
  }

  if (selected.length > 0 && !has("tickets")) {
    flags.push({
      tone: "break",
      title: "Support is invisible",
      text: "“Whether support is on fire” cannot be answered from CRM fields. Titles and status are enough. Full threads are not. Leave the titles out and the brief will say the account is quiet, because a quiet account is the fluent default.",
    })
  } else if (has("tickets")) {
    flags.push({
      tone: "hold",
      title: "Support is visible",
      text: "Twelve titles and a status. The seller can see a fire without reading the argument.",
    })
  }

  if (has("emailsAll") || has("threads")) {
    flags.push({
      tone: "break",
      title: "Untrimmed history",
      text: "Full mail or full ticket threads are a refusal to decide what the brief is for. They blow the allowance, they bury the spine, and they invite the model to quote a grievance from last year as if it were the current risk.",
    })
  }

  if (has("similar")) {
    flags.push({
      tone: "watch",
      title: "Analogy is not evidence",
      text: "Similar-customer stories are about other accounts. If you keep them, label them as analogy in the block itself and do not let them supply a fact about this one. They are the usual source of a “teams like yours” sentence nobody can source.",
    })
  }

  if (has("touch") && has("emails5")) {
    flags.push({
      tone: "watch",
      title: "Two sources for the same question",
      text: "The last-touch line and the five emails can disagree. Prefer the structured line for what happened, and keep the emails only if the seller needs tone. Do not make the model reconcile them in the brief.",
    })
  }

  const rank: Record<FlagTone, number> = { break: 0, watch: 1, hold: 2 }
  flags.sort((a, b) => rank[a.tone] - rank[b.tone])
  const holds = selected.length > 0 && flags.every((flag) => flag.tone !== "break")

  return {
    tokens,
    budget: CONTEXT_BUDGET,
    holds,
    flags,
    orderNote: holds
      ? "Put the account spine and the instruction at the top. The instruction is the job: 150 words, and if a fact is not in these blocks, say it is not in the record. Evidence goes after the spine. Repeat the abstain rule at the end if the pack ever grows. Lost-in-the-middle is mild at this size and real the moment someone pastes the full threads back in."
      : null,
  }
}

function choiceComplete(brief: Brief, progress: Progress): boolean {
  return brief.questions.every((question) =>
    question.options.some((option) => option.id === progress.choices[question.id]),
  )
}

function choiceHolds(brief: Brief, progress: Progress): boolean {
  return brief.questions.every((question) => {
    const selected = question.options.find((option) => option.id === progress.choices[question.id])
    return selected?.holds === true
  })
}

export function isBriefComplete(slug: string, progress: Progress): boolean {
  const brief = getBrief(slug)
  if (!brief) return false
  if (brief.interaction === "context") return progress.packReviewed
  if (brief.interaction === "incident") return progress.incidentStep >= incidentSteps.length
  return choiceComplete(brief, progress)
}

export function briefHolds(slug: string, progress: Progress): boolean {
  if (!isBriefComplete(slug, progress)) return false
  const brief = getBrief(slug)
  if (!brief) return false
  if (brief.interaction === "context") return gradePack(progress.pack).holds
  if (brief.interaction === "incident") return true
  return choiceHolds(brief, progress)
}

export function filedSlugs(progress: Progress): string[] {
  return briefs.filter((brief) => isBriefComplete(brief.slug, progress)).map((brief) => brief.slug)
}

export function holdingSlugs(progress: Progress): string[] {
  return briefs.filter((brief) => briefHolds(brief.slug, progress)).map((brief) => brief.slug)
}
