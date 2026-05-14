from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.supabase import init_supabase, supabase_available


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_supabase()
    yield


app = FastAPI(
    title="CrimeCompare API",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.allowed_origins.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/v1/health")
def health():
    return {
        "status": "ok",
        "version": "2.0.0",
        "supabase": supabase_available(),
    }
