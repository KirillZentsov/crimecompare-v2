"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const RADIUS_OPTIONS = [
  { value: "5min",  label: "5 min walk" },
  { value: "10min", label: "10 min walk" },
  { value: "15min", label: "15 min walk" },
  { value: "0.5mi", label: "0.5 miles" },
  { value: "1mi",   label: "1 mile" },
  { value: "2mi",   label: "2 miles" },
] as const

type RadiusValue = typeof RADIUS_OPTIONS[number]["value"]

export default function ComparePage() {
  const [postcodeA, setPostcodeA] = useState("")
  const [postcodeB, setPostcodeB] = useState("")
  const [radius, setRadius] = useState<RadiusValue>("10min")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // wired up in next task
  }

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
          {/* Postcode A */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              <span
                className="inline-block w-5 h-5 rounded-full mr-2 align-middle"
                style={{ backgroundColor: "#1D9E75" }}
              />
              Postcode A
            </label>
            <Input
              type="text"
              placeholder="e.g. SW1A 1AA"
              value={postcodeA}
              onChange={(e) => setPostcodeA(e.target.value.toUpperCase())}
              autoComplete="off"
              spellCheck={false}
              maxLength={8}
              className="uppercase tracking-widest text-base"
              style={{ borderColor: postcodeA ? "#1D9E75" : undefined }}
            />
          </div>

          {/* Postcode B */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              <span
                className="inline-block w-5 h-5 rounded-full mr-2 align-middle"
                style={{ backgroundColor: "#378ADD" }}
              />
              Postcode B
            </label>
            <Input
              type="text"
              placeholder="e.g. E1 6AN"
              value={postcodeB}
              onChange={(e) => setPostcodeB(e.target.value.toUpperCase())}
              autoComplete="off"
              spellCheck={false}
              maxLength={8}
              className="uppercase tracking-widest text-base"
              style={{ borderColor: postcodeB ? "#378ADD" : undefined }}
            />
          </div>

          {/* Radius */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Search radius
            </label>
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

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={postcodeA.trim().length < 5 || postcodeB.trim().length < 5}
          >
            Compare
          </Button>
        </form>
      </div>
    </main>
  )
}
