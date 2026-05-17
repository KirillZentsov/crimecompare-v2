"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { motion, type Variants } from "framer-motion"
import { Button } from "@/components/ui/button"
import { CompareResponse } from "@/types/compare"
import { WinnerBanner } from "./winner-banner"
import { KpiCards } from "./kpi-cards"
import { CategoriesChart } from "./categories-chart"
import { TrendChart } from "./trend-chart"
import { SeverityChart } from "./severity-chart"
import { TextSummary } from "./text-summary"

const CompareMap = dynamic(() => import("./compare-map"), { ssr: false })

const COLOR_A = "#1D9E75"
const COLOR_B = "#378ADD"

const RADIUS_LABELS: Record<string, string> = {
  "5min":  "5 min walk",
  "10min": "10 min walk",
  "15min": "15 min walk",
  "0.5mi": "0.5 miles",
  "1mi":   "1 mile",
  "2mi":   "2 miles",
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
}

interface Props {
  data: CompareResponse
  onReset?: () => void   // absent in SSR context — shows Link instead
}

export function CompareResults({ data, onReset }: Props) {
  const { postcode_a, postcode_b, radius, months } = data
  const radiusLabel = RADIUS_LABELS[radius] ?? radius

  const monthRange = months.length >= 2
    ? `${fmtMonth(months[0])} – ${fmtMonth(months[months.length - 1])}`
    : fmtMonth(months[0])

  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show"
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              <span style={{ color: COLOR_A }}>{postcode_a}</span>
              <span className="text-muted-foreground mx-2">vs</span>
              <span style={{ color: COLOR_B }}>{postcode_b}</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {radiusLabel} radius · {monthRange}
            </p>
          </div>
          {onReset ? (
            <Button variant="outline" size="sm" onClick={onReset}>
              Compare again
            </Button>
          ) : (
            <Link
              href="/compare"
              className="inline-flex h-7 items-center rounded-[min(var(--radius-md),12px)] border border-border bg-background px-2.5 text-[0.8rem] font-medium text-foreground transition-colors hover:bg-muted"
            >
              Compare again
            </Link>
          )}
        </motion.div>

        <WinnerBanner data={data} />
        <KpiCards data={data} />

        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <CategoriesChart data={data} />
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <TrendChart data={data} />
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <SeverityChart data={data} />
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <CompareMap data={data} />
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <TextSummary data={data} />
        </motion.div>
      </div>
    </div>
  )
}

function fmtMonth(ym: string) {
  const [year, month] = ym.split("-")
  return new Date(Number(year), Number(month) - 1).toLocaleString("en-GB", {
    month: "short", year: "numeric",
  })
}
