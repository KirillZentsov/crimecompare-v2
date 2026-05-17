"use client"

import { CompareResponse } from "@/types/compare"

const COLOR_A = "#1D9E75"
const COLOR_B = "#378ADD"

function fmt(slug: string) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

function fmtMonth(ym: string) {
  const [year, month] = ym.split("-")
  return new Date(Number(year), Number(month) - 1).toLocaleString("en-GB", {
    month: "long", year: "numeric",
  })
}

function riskLabel(score: number) {
  if (score < 40) return "Low"
  if (score < 70) return "Medium"
  return "High"
}

function trendSentence(postcode: string, monthly: Record<string, { total_crimes: number }>, months: string[]) {
  if (months.length < 2) return ""
  const first = monthly[months[0]]?.total_crimes ?? 0
  const last  = monthly[months[months.length - 1]]?.total_crimes ?? 0
  if (first === 0) return ""
  const change = ((last - first) / first) * 100
  if (change > 10)  return `Crime in ${postcode} rose over this period (+${Math.round(change)}% month-on-month).`
  if (change < -10) return `Crime in ${postcode} fell over this period (${Math.round(change)}% month-on-month).`
  return `Crime in ${postcode} remained broadly stable over this period.`
}

function generateSummary(data: CompareResponse): string {
  const { postcode_a, postcode_b, quarter, monthly, months, radius } = data
  const qa = quarter.a
  const qb = quarter.b

  const period = months.length === 3
    ? `${fmtMonth(months[0])} to ${fmtMonth(months[months.length - 1])}`
    : fmtMonth(months[0])

  const radiusLabel: Record<string, string> = {
    "5min": "5-minute walk", "10min": "10-minute walk", "15min": "15-minute walk",
    "0.5mi": "0.5-mile", "1mi": "1-mile", "2mi": "2-mile",
  }
  const radiusDesc = radiusLabel[radius] ?? radius

  // Opener — totals and risk scores
  const saferPostcode = qa.risk_score < qb.risk_score ? postcode_a
                      : qb.risk_score < qa.risk_score ? postcode_b
                      : null
  const pctDiff = qa.risk_score > 0 && qb.risk_score > 0
    ? Math.abs(Math.round(((qa.risk_score - qb.risk_score) / Math.max(qa.risk_score, qb.risk_score)) * 100))
    : 0

  let opener = `Over the period ${period}, within a ${radiusDesc} radius, `
  opener += `${postcode_a} recorded ${qa.total_crimes.toLocaleString()} crimes `
  opener += `(risk score ${qa.risk_score}/100 — ${riskLabel(qa.risk_score)}), `
  opener += `compared with ${qb.total_crimes.toLocaleString()} crimes in ${postcode_b} `
  opener += `(risk score ${qb.risk_score}/100 — ${riskLabel(qb.risk_score)}).`

  // Safety verdict
  let verdict = ""
  if (saferPostcode) {
    verdict = ` ${saferPostcode} is the safer of the two areas, with a risk score ${pctDiff}% lower.`
  } else {
    verdict = ` Both areas carry the same risk score.`
  }

  // Top categories for A
  const topA = qa.top_categories.slice(0, 3).map(([slug]) => fmt(slug))
  const sentenceA = topA.length
    ? ` The most common crime types near ${postcode_a} were ${topA.join(", ")}.`
    : ""

  // Top categories for B
  const topB = qb.top_categories.slice(0, 3).map(([slug]) => fmt(slug))
  const sentenceB = topB.length
    ? ` Near ${postcode_b}, the most frequent categories were ${topB.join(", ")}.`
    : ""

  // Trend sentences
  const trendA = trendSentence(postcode_a, monthly.a, months)
  const trendB = trendSentence(postcode_b, monthly.b, months)
  const trendPart = [trendA, trendB].filter(Boolean).join(" ")

  return [opener, verdict, sentenceA, sentenceB, trendPart ? ` ${trendPart}` : ""].join("")
}

interface Props {
  data: CompareResponse
}

export function TextSummary({ data }: Props) {
  const summary = generateSummary(data)

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-2">
      <p className="text-sm font-medium text-foreground">Summary</p>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {summary.split(data.postcode_a).flatMap((part, i, arr) =>
          i < arr.length - 1
            ? [part, <span key={`a${i}`} className="font-medium" style={{ color: COLOR_A }}>{data.postcode_a}</span>]
            : [part]
        ).flatMap((node, i) =>
          typeof node !== "string"
            ? [node]
            : node.split(data.postcode_b).flatMap((part, j, arr) =>
                j < arr.length - 1
                  ? [part, <span key={`b${i}-${j}`} className="font-medium" style={{ color: COLOR_B }}>{data.postcode_b}</span>]
                  : [part]
              )
        )}
      </p>
    </div>
  )
}
