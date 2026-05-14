from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import List

from app.services.postcode_lookup import get_postcode_suggestions, get_postcode_data

router = APIRouter(prefix="/v1/postcodes", tags=["postcodes"])


class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1)
    limit: int = Field(default=15, ge=1, le=50)


class PostcodeSuggestion(BaseModel):
    postcode: str
    display: str


@router.post("/search", response_model=List[PostcodeSuggestion])
def search_postcodes(body: SearchRequest):
    return get_postcode_suggestions(body.query, body.limit)
