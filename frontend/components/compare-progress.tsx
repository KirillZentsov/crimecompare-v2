"use client"

import { useEffect, useState } from "react"
import { CheckCircle, Circle, Loader2 } from "lucide-react"

const STEPS = [
  { label: "Looking up postcodes", delay: 0 },
  { label: "Fetching crime data",  delay: 1200 },
  { label: "Calculating scores",   delay: 2800 },
]

export function CompareProgress() {
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    const timers = STEPS.slice(1).map(({ delay }, i) =>
      setTimeout(() => setActiveStep(i + 1), delay)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="flex flex-col gap-4 py-8">
      {STEPS.map(({ label }, i) => {
        const done   = i < activeStep
        const active = i === activeStep
        return (
          <div key={label} className="flex items-center gap-3">
            {done ? (
              <CheckCircle className="size-5 shrink-0 text-green-600" />
            ) : active ? (
              <Loader2 className="size-5 shrink-0 animate-spin text-primary" />
            ) : (
              <Circle className="size-5 shrink-0 text-muted-foreground" />
            )}
            <span
              className={[
                "text-sm",
                done   ? "text-muted-foreground line-through" : "",
                active ? "font-medium text-foreground" : "",
                !done && !active ? "text-muted-foreground" : "",
              ].join(" ")}
            >
              {label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
