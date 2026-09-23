from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.demo import reset_demo_data

router = APIRouter(prefix="/api/demo", tags=["Demo"])


@router.post("/reset")
def reset_demo(db: Session = Depends(get_db)):
    """Reset demo data: re-seed 100 materials, run RapidFuzz matching, generate CNMCs, and populate review queue."""
    return reset_demo_data(db)
