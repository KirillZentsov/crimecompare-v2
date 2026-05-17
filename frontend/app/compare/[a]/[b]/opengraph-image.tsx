import { ImageResponse } from "next/og"
import type { CompareResponse } from "@/types/compare"

export const runtime = "edge"
export const alt = "CrimeCompare — postcode crime comparison"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

const COLOR_A = "#1D9E75"
const COLOR_B = "#378ADD"

async function fetchCompare(a: string, b: string): Promise<CompareResponse | null> {
  try {
    const res = await fetch(`${API_URL}/v1/compare`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postcode_a: a, postcode_b: b, radius: "10min" }),
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function Image({
  params,
}: {
  params: Promise<{ a: string; b: string }>
}) {
  const { a, b } = await params
  const data = await fetchCompare(a.toUpperCase(), b.toUpperCase())

  const postcodeA = data?.postcode_a ?? a.toUpperCase()
  const postcodeB = data?.postcode_b ?? b.toUpperCase()
  const scoreA = data?.quarter.a.risk_score ?? "—"
  const scoreB = data?.quarter.b.risk_score ?? "—"

  const winner =
    data && data.quarter.a.risk_score < data.quarter.b.risk_score ? postcodeA
    : data && data.quarter.b.risk_score < data.quarter.a.risk_score ? postcodeB
    : null

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#0f172a",
          fontFamily: "system-ui, Arial, sans-serif",
          padding: "60px",
          gap: "32px",
        }}
      >
        {/* Postcodes */}
        <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          <span style={{ fontSize: 80, fontWeight: 700, color: COLOR_A, letterSpacing: "-2px" }}>
            {postcodeA}
          </span>
          <span style={{ fontSize: 48, color: "#64748b", fontWeight: 300 }}>vs</span>
          <span style={{ fontSize: 80, fontWeight: 700, color: COLOR_B, letterSpacing: "-2px" }}>
            {postcodeB}
          </span>
        </div>

        {/* Risk scores */}
        <div style={{ display: "flex", gap: "40px" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
            <span style={{ fontSize: 48, fontWeight: 700, color: COLOR_A }}>{scoreA}</span>
            <span style={{ fontSize: 18, color: "#94a3b8" }}>risk score</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
            <span style={{ fontSize: 48, fontWeight: 700, color: COLOR_B }}>{scoreB}</span>
            <span style={{ fontSize: 18, color: "#94a3b8" }}>risk score</span>
          </div>
        </div>

        {/* Winner line */}
        {winner && (
          <div style={{ fontSize: 24, color: "#94a3b8" }}>
            <span style={{ color: winner === postcodeA ? COLOR_A : COLOR_B, fontWeight: 600 }}>
              {winner}
            </span>
            {" "}is the safer area
          </div>
        )}

        {/* Brand */}
        <div style={{ position: "absolute", bottom: 40, right: 60, fontSize: 20, color: "#475569", fontWeight: 600 }}>
          crimecompare.co.uk
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
