"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { AlertCircle, Link2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PostcodeAutocomplete } from "@/components/postcode-autocomplete"
import { CompareProgress } from "@/components/compare-progress"
import { CompareResults } from "@/components/results/compare-results"
import { CompareResponse } from "@/types/compare"

const RADIUS_OPTIONS = [
  { value: "5min",  label: "5 min walk" },
  { value: "10min", label: "10 min walk" },
  { value: "15min", label: "15 min walk" },
  { value: "0.5mi", label: "0.5 miles" },
  { value: "1mi",   label: "1 mile" },
  { value: "2mi",   label: "2 miles" },
] as const

type RadiusValue = typeof RADIUS_OPTIONS[number]["value"]

const COLOR_A = "#1D9E75"
const COLOR_B = "#378ADD"
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

interface CompareRequest {
  postcode_a: string
  postcode_b: string
  radius: string
}

function parseApiError(status: number, detail: unknown): string {
  if (status === 429) return "Daily comparison limit reached. Try again tomorrow."
  if (status === 400) {
    if (typeof detail === "string") return detail
    return "One or more postcodes weren't recognised. Please check and try again."
  }
  if (status === 422) return "Please check your postcode format and try again."
  if (status >= 500) return "The crime data service is temporarily unavailable. Please try again."
  return "Something went wrong. Please try again."
}

async function runCompare(body: CompareRequest): Promise<CompareResponse> {
  const res = await fetch(`${API_URL}/v1/compare`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}))
    throw new Error(parseApiError(res.status, payload.detail))
  }
  return res.json()
}

export default function ComparePage() {
  const [postcodeA, setPostcodeA] = useState("")
  const [postcodeB, setPostcodeB] = useState("")
  const [radius, setRadius] = useState<RadiusValue>("10min")

  const mutation = useMutation({ mutationFn: runCompare })

  const canSubmit =
    postcodeA.replace(/\s/g, "").length >= 5 &&
    postcodeB.replace(/\s/g, "").length >= 5

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    mutation.mutate({
      postcode_a: postcodeA.replace(/\s/g, "").toUpperCase(),
      postcode_b: postcodeB.replace(/\s/g, "").toUpperCase(),
      radius,
    })
  }

  function handleReset() {
    mutation.reset()
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (mutation.isPending) {
    return (
      <main
        className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12"
        aria-live="polite"
        aria-label="Comparison in progress"
      >
        <div className="w-full max-w-lg space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Comparing{" "}
            <span className="font-semibold" style={{ color: COLOR_A }}>{postcodeA}</span>
            {" "}vs{" "}
            <span className="font-semibold" style={{ color: COLOR_B }}>{postcodeB}</span>
          </p>
          <CompareProgress />
        </div>
      </main>
    )
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (mutation.isError) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg space-y-6">
          <div role="alert" aria-atomic="true" className="flex gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <AlertCircle className="size-5 shrink-0 text-destructive mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-destructive">Comparison failed</p>
              <p className="text-sm text-muted-foreground">
                {mutation.error.message}
              </p>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={handleReset}>
            Try again
          </Button>
        </div>
      </main>
    )
  }

  // ── Success ────────────────────────────────────────────────────────────────
  if (mutation.isSuccess) {
    const shareUrl = `/compare/${mutation.data.postcode_a.replace(/\s/g, "")}/${mutation.data.postcode_b.replace(/\s/g, "")}`
    return (
      <>
        <ShareBanner url={shareUrl} />
        <CompareResults data={mutation.data} onReset={handleReset} />
      </>
    )
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Compare crime rates
          </h1>
          <p className="text-muted-foreground">
            Enter two UK postcodes to compare risk scores and crime trends.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <span className="inline-block w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLOR_A }} />
              Postcode A
            </label>
            <PostcodeAutocomplete
              value={postcodeA}
              onChange={setPostcodeA}
              placeholder="e.g. SW1A 1AA"
              accentColor={COLOR_A}
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <span className="inline-block w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLOR_B }} />
              Postcode B
            </label>
            <PostcodeAutocomplete
              value={postcodeB}
              onChange={setPostcodeB}
              placeholder="e.g. E1 6AN"
              accentColor={COLOR_B}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">Search radius</label>
            <div className="flex flex-wrap gap-2">
              {RADIUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRadius(opt.value)}
                  className={[
                    "px-3 py-1.5 rounded-md text-sm font-medium border transition-colors",
                    radius === opt.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-border hover:bg-muted",
                  ].join(" ")}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={!canSubmit}>
            Compare
          </Button>
        </form>
      </div>
    </main>
  )
}

function ShareBanner({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)
  const full = `https://crimecompare.co.uk${url}`

  function copy() {
    navigator.clipboard.writeText(full).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="bg-muted/50 border-b border-border px-4 py-2 flex items-center justify-center gap-3 text-sm">
      <Link2 className="size-4 shrink-0 text-muted-foreground" />
      <span className="text-muted-foreground truncate max-w-xs">{full}</span>
      <button
        onClick={copy}
        className="text-xs font-medium text-primary hover:underline shrink-0"
      >
        {copied ? "Copied!" : "Copy link"}
      </button>
    </div>
  )
}
