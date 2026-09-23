from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas import DuplicateSummaryResponse, DuplicateClusterResponse
from app.services.duplicates import get_duplicate_summary, get_duplicate_clusters

router = APIRouter(prefix="/api/duplicates", tags=["Duplicates"])


@router.get("/summary", response_model=DuplicateSummaryResponse)
def get_summary(db: Session = Depends(get_db)):
    """Retrieve summary metrics of detected duplicates.

    Returns total_materials, duplicate_groups, and estimated_savings.
    """
    return get_duplicate_summary(db)


@router.get("/clusters", response_model=List[DuplicateClusterResponse])
def get_clusters(db: Session = Depends(get_db)):
    """Retrieve grouped materials using simple clustering based on scores.

    Rules:
    - score > 90: exact duplicate
    - score > 75: near duplicate
    """
    return get_duplicate_clusters(db)
