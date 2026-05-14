"""
Enhanced Postcode Autocomplete with Database Search Key
Optimized for 1.5M+ postcodes with trigram indexes
Requires minimum 4 characters for search
"""

import re
from typing import List, Optional, Tuple, Dict, Any
from functools import lru_cache
from app.core.supabase import get_supabase_client, supabase_query

POSTCODE_PATTERN = re.compile(
    r'^([A-Z]{1,2})([0-9]{1,2}|[0-9][A-Z])\s?([0-9][A-Z]{2})$',
    re.IGNORECASE
)


class PostcodeAutocomplete:
    """Handles postcode autocomplete using optimized search_key column"""

    def __init__(self, cache_size: int = 3000):
        self.cache_size = cache_size

    @staticmethod
    def to_search_key(postcode: str) -> str:
        if not postcode:
            return ""
        return postcode.strip().upper().replace(' ', '')

    @staticmethod
    def normalize_display(postcode: str) -> str:
        if not postcode:
            return ""
        pc = postcode.strip().upper().replace(' ', '')
        if len(pc) < 5:
            return pc
        return f"{pc[:-3]} {pc[-3:]}"

    @lru_cache(maxsize=3000)
    def search_cached(self, search_term: str, limit: int = 15) -> Tuple[List[Dict[str, str]], bool]:
        try:
            search_key = self.to_search_key(search_term)

            if len(search_key) < 4:
                return [], True

            client = get_supabase_client()

            def query():
                return (
                    client.table("postcodes")
                    .select("postcode, display_name")
                    .ilike("search_key", f"{search_key}%")
                    .order("postcode")
                    .limit(limit)
                    .execute()
                )

            result = supabase_query(query)
            data = getattr(result, "data", None) or []

            results = [
                {
                    "postcode": row["postcode"],
                    "display": row.get("display_name", row["postcode"])
                }
                for row in data if row.get("postcode")
            ]

            print(f"[Search] '{search_term}' → '{search_key}' → found {len(results)}")
            return results, True

        except Exception as e:
            print(f"[Autocomplete] Search failed: {e}")
            return [], False

    def search(self, prefix: str, limit: int = 15) -> List[Dict[str, str]]:
        if not prefix or len(prefix.strip()) < 4:
            return []
        results, success = self.search_cached(prefix, limit)
        return results if success else []

    @lru_cache(maxsize=1500)
    def exists_cached(self, postcode: str) -> bool:
        try:
            search_key = self.to_search_key(postcode)
            client = get_supabase_client()

            def query():
                return (
                    client.table("postcodes")
                    .select("postcode")
                    .eq("search_key", search_key)
                    .maybe_single()
                    .execute()
                )

            result = supabase_query(query)
            return bool(getattr(result, "data", None))

        except Exception as e:
            print(f"[Autocomplete] Existence check failed: {e}")
            return False

    def exists(self, postcode: str) -> bool:
        if not postcode:
            return False
        return self.exists_cached(postcode)

    @lru_cache(maxsize=1500)
    def get_full_data_cached(self, postcode: str) -> Optional[Dict[str, Any]]:
        try:
            search_key = self.to_search_key(postcode)
            client = get_supabase_client()

            def query():
                return (
                    client.table("postcodes")
                    .select("*")
                    .eq("search_key", search_key)
                    .maybe_single()
                    .execute()
                )

            result = supabase_query(query)
            return getattr(result, "data", None)

        except Exception as e:
            print(f"[Autocomplete] Full data lookup failed: {e}")
            return None

    def get_full_data(self, postcode: str) -> Optional[Dict[str, Any]]:
        if not postcode:
            return None
        return self.get_full_data_cached(postcode)

    def get_coordinates(self, postcode: str) -> Optional[Tuple[float, float]]:
        data = self.get_full_data(postcode)
        if data and "lat" in data and "lng" in data:
            return data["lat"], data["lng"]
        return None

    @staticmethod
    def validate_format(postcode: str) -> Tuple[bool, Optional[str]]:
        if not postcode or len(postcode.strip()) == 0:
            return False, "Postcode cannot be empty"

        normalized = postcode.strip().upper()
        no_space = normalized.replace(' ', '')

        if len(no_space) < 5 or len(no_space) > 7:
            return False, "Invalid postcode length"

        if not POSTCODE_PATTERN.match(normalized):
            return False, "Invalid postcode format"

        return True, None


_autocomplete = PostcodeAutocomplete()


def to_search_key(postcode: str) -> str:
    return _autocomplete.to_search_key(postcode)


def normalize_postcode(postcode: str) -> str:
    return _autocomplete.normalize_display(postcode)


def is_valid_postcode(value: str) -> bool:
    is_valid, _ = _autocomplete.validate_format(value)
    return is_valid


def postcode_exists(value: str) -> bool:
    return _autocomplete.exists(value)


def get_postcode_suggestions(prefix: str, limit: int = 15) -> List[Dict[str, str]]:
    return _autocomplete.search(prefix, limit)


def get_postcode_data(postcode: str) -> Optional[Dict[str, Any]]:
    return _autocomplete.get_full_data(postcode)


def validate_postcode_pair(postcode_a: str, postcode_b: str) -> Tuple[bool, Optional[str]]:
    if not postcode_a or not postcode_b:
        return False, "Both postcodes are required"

    norm_a = normalize_postcode(postcode_a)
    norm_b = normalize_postcode(postcode_b)

    if norm_a == norm_b:
        return False, "Please enter two different postcodes"

    valid_a, err_a = _autocomplete.validate_format(norm_a)
    if not valid_a:
        return False, f"Postcode A: {err_a}"

    valid_b, err_b = _autocomplete.validate_format(norm_b)
    if not valid_b:
        return False, f"Postcode B: {err_b}"

    if not _autocomplete.exists(norm_a):
        return False, f"Postcode A ({norm_a}) not found in database"

    if not _autocomplete.exists(norm_b):
        return False, f"Postcode B ({norm_b}) not found in database"

    return True, None
