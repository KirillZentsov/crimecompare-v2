import asyncio
import time
from datetime import datetime

import aiohttp
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from app.services.crime_api import (
    fetch_polygon_monthly_data_async,
    make_circle_polygon,
    summarize_crimes,
)
from app.services.postcode_lookup import (
    get_postcode_data,
    normalize_postcode,
    validate_postcode_pair,
)
from app.services.quota_manager import check_limit, increment_usage

router = APIRouter(prefix="/v1", tags=["compare"])

# In-memory cache for latest Police.uk month (TTL: 1 hour)
_month_cache: dict = {"value": None, "expires": 0.0}


async def get_latest_month() -> str:
    now = time.time()
    if _month_cache["value"] and now < _month_cache["expires"]:
        return _month_cache["value"]

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(
                "https://data.police.uk/api/crime-last-updated",
                timeout=aiohttp.ClientTimeout(total=10),
            ) as resp:
                resp.raise_for_status()
                data = await resp.json()
                month = datetime.fromisoformat(data["date"]).strftime("%Y-%m")
    except Exception:
        month = datetime.utcnow().strftime("%Y-%m")

    _month_cache["value"] = month
    _month_cache["expires"] = now + 3600
    return month


def build_recent_months(latest_month: str, count: int = 3) -> list[str]:
    dt = datetime.strptime(latest_month, "%Y-%m")
    months = []
    for offset in range(count):
        m, y = dt.month - offset, dt.year
        while m <= 0:
            m += 12
            y -= 1
        months.append(f"{y:04d}-{m:02d}")
    return list(reversed(months))


def parse_radius(radius_str: str) -> float:
    """Convert radius string to metres. Accepts: 5min, 10min, 15min, 0.5mi, 1mi, 2mi."""
    s = radius_str.lower().strip().replace(" ", "")
    if "min" in s:
        minutes = float(s.replace("minutes", "").replace("minute", "").replace("min", ""))
        return minutes * 80
    if "mi" in s:
        miles = float(s.replace("miles", "").replace("mile", "").replace("mi", ""))
        return miles * 1609.34
    return 800.0  # default ~10 minutes


class CompareRequest(BaseModel):
    postcode_a: str
    postcode_b: str
    radius: str = "10min"


@router.post("/compare")
async def compare(body: CompareRequest, request: Request):
    try:
        radius_meters = parse_radius(body.radius)
    except ValueError:
        raise HTTPException(status_code=422, detail=f"Invalid radius: {body.radius!r}")

    norm_a = normalize_postcode(body.postcode_a)
    norm_b = normalize_postcode(body.postcode_b)

    valid, err = validate_postcode_pair(norm_a, norm_b)
    if not valid:
        raise HTTPException(status_code=422, detail=err)

    user_id = request.client.host if request.client else "unknown"
    if check_limit(user_id):
        raise HTTPException(status_code=429, detail="Daily request limit reached. Try again tomorrow.")

    data_a = get_postcode_data(norm_a)
    data_b = get_postcode_data(norm_b)
    if not data_a:
        raise HTTPException(status_code=404, detail=f"{norm_a} not found in database")
    if not data_b:
        raise HTTPException(status_code=404, detail=f"{norm_b} not found in database")

    lat_a, lng_a = data_a["lat"], data_a["lng"]
    lat_b, lng_b = data_b["lat"], data_b["lng"]

    latest_month = await get_latest_month()
    months = build_recent_months(latest_month, 3)

    polygon_a = make_circle_polygon(lat_a, lng_a, radius_meters)
    polygon_b = make_circle_polygon(lat_b, lng_b, radius_meters)

    # Fetch both postcodes across all months concurrently
    monthly_data_a, monthly_data_b = await asyncio.gather(
        fetch_polygon_monthly_data_async(polygon_a, months),
        fetch_polygon_monthly_data_async(polygon_b, months),
    )

    monthly_summaries_a = {m: summarize_crimes(ev) for m, ev in monthly_data_a.items()}
    monthly_summaries_b = {m: summarize_crimes(ev) for m, ev in monthly_data_b.items()}

    # Quarter = all 3 months combined
    all_events_a = [ev for events in monthly_data_a.values() for ev in events]
    all_events_b = [ev for events in monthly_data_b.values() for ev in events]

    increment_usage(user_id)

    return {
        "postcode_a": norm_a,
        "postcode_b": norm_b,
        "radius": body.radius,
        "radius_meters": radius_meters,
        "latest_month": latest_month,
        "months": months,
        "coords": {
            "lat_a": lat_a, "lng_a": lng_a,
            "lat_b": lat_b, "lng_b": lng_b,
        },
        "monthly": {
            "a": monthly_summaries_a,
            "b": monthly_summaries_b,
        },
        "quarter": {
            "a": summarize_crimes(all_events_a),
            "b": summarize_crimes(all_events_b),
        },
    }
