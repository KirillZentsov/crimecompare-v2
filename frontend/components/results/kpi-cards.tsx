"use client"

import { motion, type Variants } from "framer-motion"
import { CompareResponse } from "@/types/compare"

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
}

const COLOR_A = "#1D9E75"
const COLOR_B = "#378ADD"

interface Props {
  data: CompareResponse
}

function riskLevel(score: number) {
  if (score < 40) return { label: "Low",    bg: "bg-green-100",  text: "text-green-700" }
  if (score < 70) return { label: "Medium", bg: "bg-amber-100",  text: "text-amber-700" }
  return               { label: "High",   bg: "bg-red-100",    text: "text-red-700"   }
}

function density(totalCrimes: number, radiusMeters: number) {
  const areaKm2 = Math.PI * Math.pow(radiusMeters / 1000, 2)
  return (totalCrimes / areaKm2).toFixed(1)
}

interface KpiCardProps {
  title: string
  valueA: React.ReactNode
  valueB: React.ReactNode
  labelA: string
  labelB: string
}

function KpiCard({ title, valueA, valueB, labelA, labelB }: KpiCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
      <div className="flex gap-4">
        <div className="flex-1 space-y-1">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: COLOR_A }} />
            {labelA}
          </p>
          <div className="text-2xl font-bold text-foreground">{valueA}</div>
        </div>
        <div className="w-px bg-border" />
        <div className="flex-1 space-y-1">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: COLOR_B }} />
            {labelB}
          </p>
          <div className="text-2xl font-bold text-foreground">{valueB}</div>
        </div>
      </div>
    </div>
  )
}

export function KpiCards({ data }: Props) {
  const { quarter, postcode_a, postcode_b, radius_meters } = data
  const qa = quarter.a
  const qb = quarter.b

  const riskA = riskLevel(qa.risk_score)
  const riskB = riskLevel(qb.risk_score)

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={fadeUp}>
        <KpiCard
          title="Total crimes (3 months)"
          valueA={qa.total_crimes.toLocaleString()}
          valueB={qb.total_crimes.toLocaleString()}
          labelA={postcode_a}
          labelB={postcode_b}
        />
      </motion.div>
      <motion.div variants={fadeUp}>
        <KpiCard
          title="Risk score"
          valueA={
            <span className="flex items-center gap-2">
              {qa.risk_score}
              <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${riskA.bg} ${riskA.text}`}>
                {riskA.label}
              </span>
            </span>
          }
          valueB={
            <span className="flex items-center gap-2">
              {qb.risk_score}
              <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${riskB.bg} ${riskB.text}`}>
                {riskB.label}
              </span>
            </span>
          }
          labelA={postcode_a}
          labelB={postcode_b}
        />
      </motion.div>
      <motion.div variants={fadeUp}>
        <KpiCard
          title="Density (crimes / km²)"
          valueA={density(qa.total_crimes, radius_meters)}
          valueB={density(qb.total_crimes, radius_meters)}
          labelA={postcode_a}
          labelB={postcode_b}
        />
      </motion.div>
    </motion.div>
  )
}
