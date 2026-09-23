from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import Material
from app.schemas import CandidateResponse, MatchingRunResponse
from app.services.matching import run_matching_engine, get_candidates_for_material

router = APIRouter(prefix="/api/matching", tags=["Matching"])


@router.post("/run", response_model=MatchingRunResponse)
def run_matching(db: Session = Depends(get_db)):
    """Run the RapidFuzz lightweight matching engine across all materials.

    1. Normalizes material descriptions (lowercase, remove punctuation, expand brg/vlv/ci).
    2. Computes similarity using rapidfuzz.fuzz.token_sort_ratio (score 0-100).
    3. Persists top 5 matches per material in match_candidates table.
    """
    processed, stored = run_matching_engine(db)
    return MatchingRunResponse(
        status="success",
        message=f"Matching run complete. Processed {processed} materials, stored {stored} candidates.",
        materials_processed=processed,
        candidates_stored=stored,
    )


@router.get("/candidates/{material_id}", response_model=List[CandidateResponse])
def get_candidates(material_id: int, db: Session = Depends(get_db)):
    """Retrieve top 5 match candidates for a specified material ID.

    Returns:
        List of objects containing candidate_id, description, and score.
    """
    material = db.query(Material).filter(Material.id == material_id).first()
    if not material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Material with id {material_id} not found",
        )

    candidates = get_candidates_for_material(db, material_id)
    return candidates
