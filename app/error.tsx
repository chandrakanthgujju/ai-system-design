"use client"

import { Button } from "@/components/ui/button"

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        Render error
      </p>
      <h1 className="mt-3 font-display text-4xl tracking-tight">This page did not render.</h1>
      <p className="mt-4 text-base leading-relaxed">
        The brief is still here. Try the render again. Your filed notes, if the browser kept
        them, are unchanged.
      </p>
      <Button type="button" className="mt-6" onClick={() => reset()}>
        Try again
      </Button>
    </div>
  )
}
