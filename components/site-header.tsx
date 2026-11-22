"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { briefs } from "@/lib/course"
import { filedSlugs } from "@/lib/grade"
import { useProgress } from "@/components/progress-provider"
import { buttonVariants } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

export function SiteHeader() {
  const pathname = usePathname()
  const { progress } = useProgress()
  const filed = filedSlugs(progress).length
  const total = briefs.length
  const onBook = pathname === "/field-book"

  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-desk/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="min-w-0">
          <span className="font-display block text-xl leading-none tracking-tight text-ink">
            Northline
          </span>
          <span className="mt-1 hidden text-xs text-muted-foreground sm:block">
            Applied AI system design
          </span>
        </Link>
        <div className="flex items-center gap-3 sm:gap-4">
          <p className="font-mono text-[11px] text-muted-foreground sm:text-xs">
            {filed} of {total} filed
          </p>
          <Link
            href="/field-book"
            className={cn(buttonVariants({ variant: onBook ? "default" : "outline", size: "sm" }))}
            aria-current={onBook ? "page" : undefined}
          >
            Field book
          </Link>
        </div>
      </div>
      <Progress
        value={total === 0 ? 0 : (filed / total) * 100}
        aria-label={`${filed} of ${total} briefs filed`}
        className="gap-0 px-0"
      />
    </header>
  )
}
