"use client"

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Dot,
} from "recharts"
import { CompareResponse } from "@/types/compare"

const COLOR_A = "#1D9E75"
const COLOR_B = "#378ADD"

function fmtMonth(ym: string) {
  const [year, month] = ym.split("-")
  return new Date(Number(year), Number(month) - 1).toLocaleString("en-GB", {
    month: "short", year: "numeric",
  })
}

interface Props {
  data: CompareResponse
}

export function TrendChart({ data }: Props) {
  const { months, monthly, postcode_a, postcode_b } = data

  const chartData = months.map((m) => ({
    month: fmtMonth(m),
    a: monthly.a[m]?.total_crimes ?? 0,
    b: monthly.b[m]?.total_crimes ?? 0,
  }))

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4">
      <p className="text-sm font-medium text-foreground">3-month crime trend</p>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
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
          <Line
            type="monotone" dataKey="a" stroke={COLOR_A} strokeWidth={2}
            dot={<Dot r={4} fill={COLOR_A} />}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone" dataKey="b" stroke={COLOR_B} strokeWidth={2}
            dot={<Dot r={4} fill={COLOR_B} />}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="flex gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block w-4 h-0.5 rounded" style={{ backgroundColor: COLOR_A }} />
          {postcode_a}
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-4 h-0.5 rounded" style={{ backgroundColor: COLOR_B }} />
          {postcode_b}
        </span>
      </div>
    </div>
  )
}
