from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import MaterialMapping, Material, CommonMaterialCode
from app.schemas import ReviewItemResponse

router = APIRouter(prefix="/api/review", tags=["Review"])


@router.get("", response_model=List[ReviewItemResponse])
def get_reviews(
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status: pending, approved, rejected"),
    db: Session = Depends(get_db),
):
    """Retrieve material mappings for review."""
    query = (
        db.query(
            MaterialMapping.id,
            MaterialMapping.material_id,
            Material.cpse_material_code.label("material_code"),
            Material.description.label("material_description"),
            MaterialMapping.cnmc_id,
            CommonMaterialCode.cnmc_code.label("cnmc_code"),
            CommonMaterialCode.standardized_description.label("standardized_description"),
            MaterialMapping.confidence_score,
            MaterialMapping.match_method,
            MaterialMapping.status,
        )
        .join(Material, MaterialMapping.material_id == Material.id)
        .join(CommonMaterialCode, MaterialMapping.cnmc_id == CommonMaterialCode.id)
    )

    if status_filter:
        query = query.filter(MaterialMapping.status == status_filter.lower())

    results = query.order_by(MaterialMapping.id.asc()).all()

    return [
        ReviewItemResponse(
            id=row.id,
            material_id=row.material_id,
            material_code=row.material_code,
            material_description=row.material_description,
            cnmc_id=row.cnmc_id,
            cnmc_code=row.cnmc_code,
            standardized_description=row.standardized_description,
            confidence_score=row.confidence_score,
            match_method=row.match_method,
            status=row.status,
        )
        for row in results
    ]


@router.post("/{id}/approve", response_model=ReviewItemResponse)
def approve_review(id: int, db: Session = Depends(get_db)):
    """Approve a material mapping in the review workflow."""
    mapping = db.query(MaterialMapping).filter(MaterialMapping.id == id).first()
    if not mapping:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Material mapping with id {id} not found",
        )

    mapping.status = "approved"
    db.commit()
    db.refresh(mapping)

    material = db.query(Material).filter(Material.id == mapping.material_id).first()
    cnmc = db.query(CommonMaterialCode).filter(CommonMaterialCode.id == mapping.cnmc_id).first()

    return ReviewItemResponse(
        id=mapping.id,
        material_id=mapping.material_id,
        material_code=material.cpse_material_code if material else None,
        material_description=material.description if material else None,
        cnmc_id=mapping.cnmc_id,
        cnmc_code=cnmc.cnmc_code if cnmc else None,
        standardized_description=cnmc.standardized_description if cnmc else None,
        confidence_score=mapping.confidence_score,
        match_method=mapping.match_method,
        status=mapping.status,
    )


@router.post("/{id}/reject", response_model=ReviewItemResponse)
def reject_review(id: int, db: Session = Depends(get_db)):
    """Reject a material mapping in the review workflow."""
    mapping = db.query(MaterialMapping).filter(MaterialMapping.id == id).first()
    if not mapping:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Material mapping with id {id} not found",
        )

    mapping.status = "rejected"
    db.commit()
    db.refresh(mapping)

    material = db.query(Material).filter(Material.id == mapping.material_id).first()
    cnmc = db.query(CommonMaterialCode).filter(CommonMaterialCode.id == mapping.cnmc_id).first()

    return ReviewItemResponse(
        id=mapping.id,
        material_id=mapping.material_id,
        material_code=material.cpse_material_code if material else None,
        material_description=material.description if material else None,
        cnmc_id=mapping.cnmc_id,
        cnmc_code=cnmc.cnmc_code if cnmc else None,
        standardized_description=cnmc.standardized_description if cnmc else None,
        confidence_score=mapping.confidence_score,
        match_method=mapping.match_method,
        status=mapping.status,
    )
