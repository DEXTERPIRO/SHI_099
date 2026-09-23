from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.materials import router as materials_router
from app.api.matching import router as matching_router
from app.api.duplicates import router as duplicates_router
from app.api.standardization import router as standardization_router
from app.api.cnmc import router as cnmc_router
from app.api.review import router as review_router
from app.api.demo import router as demo_router
from app.db.session import SessionLocal, engine, Base
import app.models  # ensure models are registered
from app.services.demo import initialize_demo_data

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API for National Unified Material Master (NUMM) Platform",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# CORS configuration for production Vercel frontend and local development
origins = [
    "https://shi-099-lwb2.vercel.app",
    "https://shi-099-lwb2-mddsezpgp-s-hubham.vercel.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app|https://.*\.onrender\.com",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register endpoints
app.include_router(materials_router)
app.include_router(matching_router)
app.include_router(duplicates_router)
app.include_router(standardization_router)
app.include_router(cnmc_router)
app.include_router(review_router)
app.include_router(demo_router)


@app.on_event("startup")
def on_startup():
    """Ensure database schema is created and demo dataset is initialized on startup."""
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"[!] Database table initialization warning: {e}")

    db = SessionLocal()
    try:
        initialize_demo_data(db)
    except Exception as e:
        print(f"[!] Startup demo initialization error: {e}")
    finally:
        db.close()



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
        "materials_api": "/api/materials",
    }
