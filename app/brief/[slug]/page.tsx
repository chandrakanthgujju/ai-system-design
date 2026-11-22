import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { BriefView } from "@/components/brief-view"
import { briefs, getBrief } from "@/lib/course"

export function generateStaticParams() {
  return briefs.map((brief) => ({ slug: brief.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const brief = getBrief(slug)
  if (!brief) return { title: "Not found" }
  return {
    title: `${brief.number} ${brief.title}`,
    description: brief.question,
  }
}

export default async function BriefPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const brief = getBrief(slug)
  if (!brief) notFound()
  return <BriefView slug={brief.slug} />
}
