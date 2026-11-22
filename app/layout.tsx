import type { Metadata } from "next"
import { Fraunces, Geist, Geist_Mono } from "next/font/google"
import { ProgressProvider } from "@/components/progress-provider"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { TooltipProvider } from "@/components/ui/tooltip"
import "./globals.css"

const sans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})

const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
})

export const metadata: Metadata = {
  title: {
    default: "Northline — Applied AI system design",
    template: "%s · Northline",
  },
  description:
    "A field course in applied AI system design. Six production briefs and a design review: budgets, retrieval, context, control flow, evals, and the Tuesday incident.",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable} ${display.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ProgressProvider>
          <TooltipProvider>
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </TooltipProvider>
        </ProgressProvider>
      </body>
    </html>
  )
}
