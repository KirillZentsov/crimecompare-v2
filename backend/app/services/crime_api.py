"""
Async Crime API Module
Handles asynchronous requests to UK Police API with rate limiting and error handling
"""

import aiohttp
import asyncio
from typing import List, Dict, Any, Optional
from collections import Counter
import math

RATE_LIMIT = 15  # requests per second
MAX_CONCURRENT = 10  # max concurrent requests
REQUEST_TIMEOUT = 15  # seconds

SEM = asyncio.Semaphore(MAX_CONCURRENT)

CRIME_WEIGHTS = {
    "violence-and-sexual-offences": 10,
    "robbery": 9,
    "possession-of-weapons": 8,
    "burglary": 7,
    "criminal-damage-arson": 6,
    "vehicle-crime": 5,
    "drugs": 4,
    "public-order": 4,
    "anti-social-behaviour": 3,
    "theft-from-the-person": 3,
    "other-theft": 2,
    "bicycle-theft": 2,
    "shoplifting": 1,
    "other-crime": 1
}


async def fetch_with_retry(
    url: str,
    session: aiohttp.ClientSession,
    max_retries: int = 3,
    retry_delay: float = 1.0
) -> List[Dict[str, Any]]:
    async with SEM:
        for attempt in range(max_retries):
            try:
                async with session.get(url, timeout=aiohttp.ClientTimeout(total=REQUEST_TIMEOUT)) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        return data if data else []

                    elif resp.status == 429:
                        wait_time = retry_delay * (2 ** attempt)
                        print(f"[Crime API] Rate limit reached. Waiting {wait_time}s...")
                        await asyncio.sleep(wait_time)
                        continue

                    elif resp.status == 503:
                        print(f"[Crime API] Service unavailable. Retrying...")
                        await asyncio.sleep(retry_delay)
                        continue

                    else:
                        print(f"[Crime API] HTTP {resp.status} for {url}")
                        return []

            except asyncio.TimeoutError:
                print(f"[Crime API] Timeout on attempt {attempt + 1}")
                if attempt < max_retries - 1:
                    await asyncio.sleep(retry_delay)
                    continue
                return []

            except Exception as e:
                print(f"[Crime API] Error: {e}")
                return []

        print(f"[Crime API] Max retries exceeded for {url}")
        return []


async def fetch_crimes_polygon_async(
    polygon: List[List[float]],
    date_ym: str
) -> List[Dict[str, Any]]:
    base_url = "https://data.police.uk/api/crimes-street/all-crime"
    poly_str = ":".join([f"{lat},{lng}" for lat, lng in polygon])
    url = f"{base_url}?poly={poly_str}&date={date_ym}"

    async with aiohttp.ClientSession() as session:
        return await fetch_with_retry(url, session)


async def fetch_crimes_point_async(
    lat: float,
    lng: float,
    date_ym: str
) -> List[Dict[str, Any]]:
    base_url = "https://data.police.uk/api/crimes-street/all-crime"
    url = f"{base_url}?lat={lat}&lng={lng}&date={date_ym}"

    async with aiohttp.ClientSession() as session:
        return await fetch_with_retry(url, session)


async def fetch_multiple_months_async(
    lat: float,
    lng: float,
    months: List[str]
) -> List[Dict[str, Any]]:
    base_url = "https://data.police.uk/api/crimes-street/all-crime"

    async with aiohttp.ClientSession() as session:
        tasks = [
            fetch_with_retry(f"{base_url}?date={month}&lat={lat}&lng={lng}", session)
            for month in months
        ]
        results = await asyncio.gather(*tasks)

    all_crimes = []
    for result in results:
        all_crimes.extend(result)
    return all_crimes


async def fetch_polygon_multiple_months_async(
    polygon: List[List[float]],
    months: List[str]
) -> List[Dict[str, Any]]:
    base_url = "https://data.police.uk/api/crimes-street/all-crime"
    poly_str = ":".join([f"{lat},{lng}" for lat, lng in polygon])

    async with aiohttp.ClientSession() as session:
        tasks = [
            fetch_with_retry(f"{base_url}?poly={poly_str}&date={month}", session)
            for month in months
        ]
        results = await asyncio.gather(*tasks)

    all_crimes = []
    for result in results:
        all_crimes.extend(result)
    return all_crimes


async def fetch_polygon_monthly_data_async(
    polygon: List[List[float]],
    months: List[str]
) -> Dict[str, List[Dict[str, Any]]]:
    base_url = "https://data.police.uk/api/crimes-street/all-crime"
    poly_str = ":".join([f"{lat},{lng}" for lat, lng in polygon])

    async with aiohttp.ClientSession() as session:
        tasks = [
            fetch_with_retry(f"{base_url}?poly={poly_str}&date={month}", session)
            for month in months
        ]
        results = await asyncio.gather(*tasks)

    return {month: events for month, events in zip(months, results)}


async def fetch_both_postcodes_async(
    postcode_a_data: Dict[str, Any],
    postcode_b_data: Dict[str, Any],
    polygon_a: List[List[float]],
    polygon_b: List[List[float]],
    month: str
) -> tuple:
    base_url = "https://data.police.uk/api/crimes-street/all-crime"
    poly_a_str = ":".join([f"{lat},{lng}" for lat, lng in polygon_a])
    poly_b_str = ":".join([f"{lat},{lng}" for lat, lng in polygon_b])

    async with aiohttp.ClientSession() as session:
        results = await asyncio.gather(
            fetch_with_retry(f"{base_url}?poly={poly_a_str}&date={month}", session),
            fetch_with_retry(f"{base_url}?poly={poly_b_str}&date={month}", session),
        )

    return results[0], results[1]


def make_circle_polygon(lat: float, lng: float, radius_m: float, num_points: int = 32) -> List[List[float]]:
    pts = []
    R = 6371000  # Earth radius in metres

    for i in range(num_points):
        angle = 2 * math.pi * i / num_points
        d_lat = (radius_m / R) * math.cos(angle)
        d_lng = (radius_m / (R * math.cos(math.radians(lat)))) * math.sin(angle)
        pts.append([lat + math.degrees(d_lat), lng + math.degrees(d_lng)])

    return pts


def summarize_crimes(events: List[Dict[str, Any]]) -> Dict[str, Any]:
    if not events:
        return {
            "total_crimes": 0,
            "by_category": {},
            "weighted_sum": 0,
            "risk_score": 0,
            "top_categories": []
        }

    categories = [e.get("category", "other-crime") for e in events]
    total = len(categories)
    by_cat = dict(Counter(categories))

    weighted = sum(
        count * CRIME_WEIGHTS.get(cat, 1)
        for cat, count in by_cat.items()
    )

    risk = min(100, (weighted / 80) * 100)
    top_cats = sorted(by_cat.items(), key=lambda x: x[1], reverse=True)[:3]

    return {
        "total_crimes": total,
        "by_category": by_cat,
        "weighted_sum": weighted,
        "risk_score": round(risk),
        "top_categories": top_cats
    }


def format_category_name(category: str) -> str:
    return category.replace("-", " ").title()


def get_risk_level(risk_score: float) -> str:
    if risk_score < 40:
        return "Low"
    elif risk_score < 70:
        return "Medium"
    return "High"
