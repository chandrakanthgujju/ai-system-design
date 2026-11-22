"use client"

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react"
import { incidentSteps } from "@/lib/course"
import {
  emptyProgress,
  normalizeProgress,
  type Progress,
} from "@/lib/grade"

const STORAGE_KEY = "northline.progress.v1"

let snapshot: Progress = emptyProgress
let hydrated = false
const listeners = new Set<() => void>()

function hydrate() {
  if (hydrated || typeof window === "undefined") return
  hydrated = true
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    snapshot = normalizeProgress(JSON.parse(raw))
  } catch {
    snapshot = emptyProgress
  }
}

function emit() {
  for (const listener of listeners) listener()
}

function write(next: Progress) {
  snapshot = next
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
  }
  emit()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  hydrate()
  return snapshot
}

function getServerSnapshot() {
  return emptyProgress
}

function choose(questionId: string, optionId: string) {
  const current = getSnapshot()
  write({
    ...current,
    choices: { ...current.choices, [questionId]: optionId },
  })
}

function toggleBlock(blockId: string) {
  const current = getSnapshot()
  const on = current.pack.includes(blockId)
  write({
    ...current,
    pack: on ? current.pack.filter((id) => id !== blockId) : [...current.pack, blockId],
  })
}

function reviewPack() {
  write({ ...getSnapshot(), packReviewed: true })
}

function tryIncident(stepId: string, optionId: string) {
  const current = getSnapshot()
  const index = incidentSteps.findIndex((step) => step.id === stepId)
  if (index !== current.incidentStep) return
  const step = incidentSteps[index]
  const option = step?.options.find((item) => item.id === optionId)
  if (!option) return
  const tried = current.incidentTried[stepId] ?? []
  write({
    ...current,
    incidentTried: {
      ...current.incidentTried,
      [stepId]: tried.includes(optionId) ? tried : [...tried, optionId],
    },
    incidentStep: option.holds ? current.incidentStep + 1 : current.incidentStep,
  })
}

function resetIncident() {
  const current = getSnapshot()
  write({ ...current, incidentStep: 0, incidentTried: {} })
}

function reset() {
  write(emptyProgress)
}

type ProgressApi = {
  progress: Progress
  choose: typeof choose
  toggleBlock: typeof toggleBlock
  reviewPack: typeof reviewPack
  tryIncident: typeof tryIncident
  resetIncident: typeof resetIncident
  reset: typeof reset
}

const ProgressContext = createContext<ProgressApi | null>(null)

export function ProgressProvider({ children }: { children: ReactNode }) {
  const progress = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const api = useMemo<ProgressApi>(
    () => ({
      progress,
      choose,
      toggleBlock,
      reviewPack,
      tryIncident,
      resetIncident,
      reset,
    }),
    [progress],
  )
  return <ProgressContext.Provider value={api}>{children}</ProgressContext.Provider>
}

export function useProgress(): ProgressApi {
  const value = useContext(ProgressContext)
  if (!value) throw new Error("useProgress must be used inside ProgressProvider")
  return value
}
