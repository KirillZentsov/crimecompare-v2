"use client"

import { useState, useRef, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { Input } from "@/components/ui/input"

interface Suggestion {
  postcode: string
  display: string
}

interface PostcodeAutocompleteProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  accentColor: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

async function fetchSuggestions(query: string): Promise<Suggestion[]> {
  const res = await fetch(`${API_URL}/v1/postcodes/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  })
  if (!res.ok) return []
  return res.json()
}

export function PostcodeAutocomplete({
  value,
  onChange,
  placeholder,
  accentColor,
}: PostcodeAutocompleteProps) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)

  // Debounce: normalize to uppercase no-spaces for the API query
  useEffect(() => {
    const id = setTimeout(
      () => setDebouncedQuery(value.replace(/\s/g, "").toUpperCase()),
      300
    )
    return () => clearTimeout(id)
  }, [value])

  const { data: suggestions = [] } = useQuery<Suggestion[]>({
    queryKey: ["postcodes", debouncedQuery],
    queryFn: () => fetchSuggestions(debouncedQuery),
    enabled: debouncedQuery.length >= 4,
    staleTime: 30_000,
  })

  // Close dropdown on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onMouseDown)
    return () => document.removeEventListener("mousedown", onMouseDown)
  }, [])

  // Open/close as suggestions arrive
  useEffect(() => {
    setActiveIndex(-1)
    setOpen(suggestions.length > 0 && debouncedQuery.length >= 4)
  }, [suggestions, debouncedQuery])

  function select(s: Suggestion) {
    onChange(s.postcode)
    setOpen(false)
    setActiveIndex(-1)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, -1))
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault()
      select(suggestions[activeIndex])
    } else if (e.key === "Escape") {
      setOpen(false)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        onKeyDown={handleKeyDown}
        onFocus={() => { if (suggestions.length > 0) setOpen(true) }}
        autoComplete="off"
        spellCheck={false}
        maxLength={8}
        className="uppercase tracking-widest text-base h-11"
        style={{ borderColor: value ? accentColor : undefined }}
      />

      {open && (
        <ul className="absolute z-10 mt-1 w-full rounded-md border border-border bg-popover shadow-md overflow-hidden">
          {suggestions.map((s, i) => (
            <li
              key={s.postcode}
              onMouseDown={(e) => {
                e.preventDefault() // prevent input blur before select fires
                select(s)
              }}
              className={[
                "flex items-baseline gap-2 px-3 py-2 text-sm cursor-pointer",
                i === activeIndex ? "bg-muted" : "hover:bg-muted",
              ].join(" ")}
            >
              <span className="font-mono font-semibold text-foreground">
                {s.postcode}
              </span>
              {s.display !== s.postcode && (
                <span className="text-xs text-muted-foreground truncate">
                  {s.display}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
