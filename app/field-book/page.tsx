import type { Metadata } from "next"
import { FieldBook } from "@/components/field-book"

export const metadata: Metadata = {
  title: "Field book",
  description: "The principles filed from each Northline brief, and which of your designs still break.",
}

export default function FieldBookPage() {
  return <FieldBook />
}
