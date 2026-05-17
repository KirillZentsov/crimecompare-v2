export interface CrimeSummary {
  total_crimes: number
  by_category: Record<string, number>
  weighted_sum: number
  risk_score: number
  top_categories: [string, number][]
}

export interface CompareResponse {
  postcode_a: string
  postcode_b: string
  radius: string
  radius_meters: number
  latest_month: string
  months: string[]
  coords: {
    lat_a: number
    lng_a: number
    lat_b: number
    lng_b: number
  }
  monthly: {
    a: Record<string, CrimeSummary>
    b: Record<string, CrimeSummary>
  }
  quarter: {
    a: CrimeSummary
    b: CrimeSummary
  }
}
