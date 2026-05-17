import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { CompareResults } from "@/components/results/compare-results"
import type { CompareResponse } from "@/types/compare"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
const SITE_URL = "https://crimecompare.co.uk"

async function fetchCompare(a: string, b: string): Promise<CompareResponse | null> {
  try {
    const res = await fetch(`${API_URL}/v1/compare`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postcode_a: a, postcode_b: b, radius: "10min" }),
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ a: string; b: string }>
}): Promise<Metadata> {
  const { a, b } = await params
  const data = await fetchCompare(a.toUpperCase(), b.toUpperCase())

  if (!data) {
    return { title: "CrimeCompare — Postcode not found" }
  }

  const { postcode_a, postcode_b, quarter } = data
  const winner =
    quarter.a.risk_score < quarter.b.risk_score ? postcode_a
    : quarter.b.risk_score < quarter.a.risk_score ? postcode_b
    : null

  const title = `${postcode_a} vs ${postcode_b} — Crime Comparison | CrimeCompare`
  const description = winner
    ? `${winner} has a lower crime risk score (${Math.min(quarter.a.risk_score, quarter.b.risk_score)}/100 vs ${Math.max(quarter.a.risk_score, quarter.b.risk_score)}/100). Compare ${quarter.a.total_crimes} vs ${quarter.b.total_crimes} crimes over 3 months.`
    : `Compare crime rates between ${postcode_a} and ${postcode_b}. ${quarter.a.total_crimes} vs ${quarter.b.total_crimes} crimes over 3 months.`

  const canonical = `${SITE_URL}/compare/${a.toUpperCase()}/${b.toUpperCase()}`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "CrimeCompare",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  }
}

export default async function SharedComparePage({
  params,
}: {
  params: Promise<{ a: string; b: string }>
}) {
  const { a, b } = await params
  const data = await fetchCompare(a.toUpperCase(), b.toUpperCase())

  if (!data) notFound()

  return <CompareResults data={data} />
}
