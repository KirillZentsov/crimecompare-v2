"use client"

import { useState } from "react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts"
import { CompareResponse } from "@/types/compare"

const COLOR_A = "#1D9E75"
const COLOR_B = "#378ADD"

function fmt(slug: string) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

interface TooltipPayload {
  name: string
  value: number
  color: string
}

function CustomTooltip({
  active, payload, label,
}: {
  active?: boolean
  payload?: TooltipPayload[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  const a = payload.find((p) => p.name === "a")?.value ?? 0
  const b = payload.find((p) => p.name === "b")?.value ?? 0
  const diff = a > 0 ? Math.round(((b - a) / a) * 100) : null

  return (
    <div className="rounded-lg border border-border bg-popover p-3 text-sm shadow-md space-y-1">
      <p className="font-medium text-foreground">{label}</p>
      <p style={{ color: COLOR_A }}>A: {a}</p>
      <p style={{ color: COLOR_B }}>B: {b}</p>
      {diff !== null && (
        <p className="text-muted-foreground text-xs">
          {diff > 0 ? `B is ${diff}% higher` : diff < 0 ? `B is ${Math.abs(diff)}% lower` : "Equal"}
        </p>
      )}
    </div>
  )
}

interface Props {
  data: CompareResponse
}

export function CategoriesChart({ data }: Props) {
  const [mode, setMode] = useState<"side-by-side" | "overlay">("side-by-side")

  const { quarter } = data
  const allCats = new Set([
    ...Object.keys(quarter.a.by_category),
    ...Object.keys(quarter.b.by_category),
  ])

  const chartData = Array.from(allCats)
    .map((cat) => ({
      name: fmt(cat),
      a: quarter.a.by_category[cat] ?? 0,
      b: quarter.b.by_category[cat] ?? 0,
    }))
    .sort((x, y) => (y.a + y.b) - (x.a + x.b))
    .slice(0, 10)

  const barSizeA = 20
  const barSizeB = mode === "overlay" ? Math.round(barSizeA * 0.8) : barSizeA

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4">
      <div className="sticky top-0 z-10 bg-card flex items-center justify-between pb-3 border-b border-border -mx-4 px-4">
        <p className="text-sm font-medium text-foreground">Crime categories (top 10)</p>
        <div className="flex rounded-md border border-border overflow-hidden text-xs">
          {(["side-by-side", "overlay"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={[
                "px-3 py-1.5 transition-colors",
                mode === m
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:bg-muted",
              ].join(" ")}
            >
              {m === "side-by-side" ? "Side by side" : "Overlay"}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 60 }}
          barCategoryGap={mode === "overlay" ? "35%" : "20%"}
          barGap={mode === "overlay" ? -barSizeB : 2}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            angle={-40}
            textAnchor="end"
            interval={0}
          />
          <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} width={32} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--muted)", opacity: 0.4 }} />
          <Bar dataKey="a" name="a" fill={COLOR_A} barSize={barSizeA} opacity={mode === "overlay" ? 0.75 : 1} radius={[2, 2, 0, 0]} />
          <Bar dataKey="b" name="b" fill={COLOR_B} barSize={barSizeB} opacity={mode === "overlay" ? 0.75 : 1} radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div className="flex gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-2 rounded-sm" style={{ backgroundColor: COLOR_A }} />
          {data.postcode_a}
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-2 rounded-sm" style={{ backgroundColor: COLOR_B }} />
          {data.postcode_b}
        </span>
      </div>
    </div>
  )
}
