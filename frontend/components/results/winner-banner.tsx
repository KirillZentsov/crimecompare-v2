"use client"

import { motion, type Variants } from "framer-motion"
import { Shield, Minus } from "lucide-react"
import { CompareResponse } from "@/types/compare"

const COLOR_A = "#1D9E75"
const COLOR_B = "#378ADD"

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
}

interface Props {
  data: CompareResponse
}

export function WinnerBanner({ data }: Props) {
  const { quarter, postcode_a, postcode_b } = data
  const scoreA = quarter.a.risk_score
  const scoreB = quarter.b.risk_score

  if (scoreA === scoreB) {
    return (
      <motion.div
        variants={fadeUp} initial="hidden" animate="show"
        className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 px-5 py-4"
      >
        <Minus className="size-5 shrink-0 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">
          Tied — both areas have the same risk score ({scoreA}/100)
        </p>
      </motion.div>
    )
  }

  const winnerPostcode = scoreA < scoreB ? postcode_a : postcode_b
  const loserPostcode  = scoreA < scoreB ? postcode_b : postcode_a
  const winnerScore   = scoreA < scoreB ? scoreA : scoreB
  const loserScore    = scoreA < scoreB ? scoreB : scoreA
  const winnerColor   = scoreA < scoreB ? COLOR_A : COLOR_B

  const diff = loserScore - winnerScore
  const pct  = loserScore > 0 ? Math.round((diff / loserScore) * 100) : 0

  return (
    <motion.div
      variants={fadeUp} initial="hidden" animate="show"
      className="flex items-start gap-3 rounded-lg border px-5 py-4"
      style={{ borderColor: winnerColor + "40", backgroundColor: winnerColor + "0d" }}
    >
      <Shield className="size-5 shrink-0 mt-0.5" style={{ color: winnerColor }} />
      <div className="space-y-0.5">
        <p className="text-sm font-semibold text-foreground">
          <span style={{ color: winnerColor }}>{winnerPostcode}</span> is the safer area
        </p>
        <p className="text-xs text-muted-foreground">
          Risk score {winnerScore}/100
          {" — "}
          <span className="whitespace-nowrap">{pct}% lower than {loserPostcode} ({loserScore}/100)</span>
        </p>
      </div>
    </motion.div>
  )
}
