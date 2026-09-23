from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API for National Unified Material Master (NUMM) Platform",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# CORS configuration allowing frontend at localhost:5173
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["System"])
def health_check():
    """Health check endpoint required by platform monitor and frontend shell."""
    return {"status": "ok"}


@app.get("/", tags=["System"])
def root():
    """Root metadata endpoint."""
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "health": "/health",
        "docs": "/docs",
    }
