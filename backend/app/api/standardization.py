from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas import StandardizationResponse
from app.services.standardization import standardize_cluster

router = APIRouter(prefix="/api/standardization", tags=["Standardization"])


@router.get("/{cluster_id}", response_model=StandardizationResponse)
def get_standardization(cluster_id: int, db: Session = Depends(get_db)):
    """Retrieve standardized item details for a specified duplicate cluster ID.

    Returns:
        {
          "standardized_description": str,
          "category": str,
          "uom": str
        }
    """
    result = standardize_cluster(db, cluster_id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Duplicate cluster with id {cluster_id} not found",
        )
    return result
