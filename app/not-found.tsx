import Link from "next/link"

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        Missing brief
      </p>
      <h1 className="mt-3 font-display text-4xl tracking-tight">That page is not a brief.</h1>
      <p className="mt-4 text-base leading-relaxed">
        The course is the six production briefs and the design review. Nothing else is filed
        under this path.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        Back to the map
      </Link>
    </div>
  )
}
