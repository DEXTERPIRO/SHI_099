from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas import CNMCGenerateResponse
from app.services.cnmc import generate_cnmc_for_cluster

router = APIRouter(prefix="/api/cnmc", tags=["CNMC"])


@router.post("/generate/{cluster_id}", response_model=CNMCGenerateResponse, status_code=status.HTTP_201_CREATED)
def generate_cnmc(cluster_id: int, db: Session = Depends(get_db)):
    """Automatically generate and store a standardized CNMC code for a duplicate cluster.

    Format: NUM-BRG-001, NUM-VLV-001, etc.
    Stores:
      - cnmc_code
      - standardized_description
    """
    result = generate_cnmc_for_cluster(db, cluster_id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Duplicate cluster with id {cluster_id} not found",
        )
    return result
