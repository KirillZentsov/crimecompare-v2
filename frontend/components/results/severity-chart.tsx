"use client"

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts"
import { CompareResponse } from "@/types/compare"

const COLOR_A = "#1D9E75"
const COLOR_B = "#378ADD"

const HIGH_CATS   = new Set(["violence-and-sexual-offences", "robbery", "possession-of-weapons", "burglary"])
const MEDIUM_CATS = new Set(["criminal-damage-arson", "vehicle-crime", "drugs", "public-order", "anti-social-behaviour", "theft-from-the-person"])
// everything else → Low

function tierCount(byCat: Record<string, number>, tier: Set<string>) {
  return Object.entries(byCat)
    .filter(([cat]) => tier.has(cat))
    .reduce((sum, [, n]) => sum + n, 0)
}

function lowCount(byCat: Record<string, number>) {
  return Object.entries(byCat)
    .filter(([cat]) => !HIGH_CATS.has(cat) && !MEDIUM_CATS.has(cat))
    .reduce((sum, [, n]) => sum + n, 0)
}

interface Props {
  data: CompareResponse
}

export function SeverityChart({ data }: Props) {
  const { quarter, postcode_a, postcode_b } = data

  const chartData = [
    {
      tier: "High",
      a: tierCount(quarter.a.by_category, HIGH_CATS),
      b: tierCount(quarter.b.by_category, HIGH_CATS),
    },
    {
      tier: "Medium",
      a: tierCount(quarter.a.by_category, MEDIUM_CATS),
      b: tierCount(quarter.b.by_category, MEDIUM_CATS),
    },
    {
      tier: "Low",
      a: lowCount(quarter.a.by_category),
      b: lowCount(quarter.b.by_category),
    },
  ]

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4">
      <div className="space-y-0.5">
        <p className="text-sm font-medium text-foreground">Severity breakdown</p>
        <p className="text-xs text-muted-foreground">High: violence, robbery, weapons, burglary · Medium: damage, drugs, vehicle, disorder · Low: theft, shoplifting</p>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
          <XAxis dataKey="tier" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
          <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} width={36} />
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid var(--border)",
              backgroundColor: "var(--popover)",
              color: "var(--foreground)",
              fontSize: "13px",
            }}
            formatter={(value, name) => [
              value,
              name === "a" ? postcode_a : postcode_b,
            ]}
          />
          <Bar dataKey="a" name="a" fill={COLOR_A} radius={[2, 2, 0, 0]} />
          <Bar dataKey="b" name="b" fill={COLOR_B} radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div className="flex gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-2 rounded-sm" style={{ backgroundColor: COLOR_A }} />
          {postcode_a}
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-2 rounded-sm" style={{ backgroundColor: COLOR_B }} />
          {postcode_b}
        </span>
      </div>
    </div>
  )
}
