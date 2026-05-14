from datetime import date
from app.core.supabase import get_supabase_client, supabase_query
from app.core.config import settings


def check_limit(user_id: str) -> bool:
    """
    Check if a user has exceeded their daily request limit.

    Returns:
        True if limit exceeded, False otherwise
    """
    today = date.today().isoformat()
    client = get_supabase_client()

    def query():
        return client.table("usage_limits").select("*").eq("user_id", user_id).eq("date", today).maybe_single().execute()

    try:
        result = supabase_query(query)
        if not result or not getattr(result, "data", None):
            return False
        row = result.data

        if not row:
            def insert():
                return client.table("usage_limits").insert({
                    "user_id": user_id,
                    "date": today,
                    "requests_used": 0
                }).execute()
            supabase_query(insert)
            return False

        requests_used = row.get("requests_used", 0)
        return requests_used >= settings.daily_requests_per_user

    except Exception as e:
        print(f"[Quota Manager] Failed to check limit for {user_id[:10]}: {e}")
        return False  # fail open


def increment_usage(user_id: str) -> None:
    """Increment the usage counter for a user."""
    today = date.today().isoformat()
    client = get_supabase_client()

    def get_current():
        return client.table("usage_limits").select("id, requests_used").eq("user_id", user_id).eq("date", today).maybe_single().execute()

    try:
        result = supabase_query(get_current)
        row = getattr(result, "data", None) if result else None

        if not row:
            def insert():
                return client.table("usage_limits").insert({
                    "user_id": user_id,
                    "date": today,
                    "requests_used": 1
                }).execute()
            supabase_query(insert)
        else:
            def update():
                return client.table("usage_limits").update({
                    "requests_used": row["requests_used"] + 1
                }).eq("id", row["id"]).execute()
            supabase_query(update)

    except Exception as e:
        print(f"[Quota Manager] Failed to increment usage for {user_id[:10]}: {e}")


def get_remaining_requests(user_id: str) -> int:
    """Get the number of remaining requests for a user today."""
    today = date.today().isoformat()
    client = get_supabase_client()

    def query():
        return client.table("usage_limits").select("requests_used").eq("user_id", user_id).eq("date", today).maybe_single().execute()

    try:
        result = supabase_query(query)
        row = result.data if result else None

        if not row:
            return settings.daily_requests_per_user

        remaining = settings.daily_requests_per_user - row.get("requests_used", 0)
        return max(0, remaining)

    except Exception as e:
        print(f"[Quota Manager] Failed to get remaining requests: {e}")
        return settings.daily_requests_per_user
