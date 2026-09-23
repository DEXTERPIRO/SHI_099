from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, func

from app.db.session import get_db
from app.models import Material, CPSE
from app.schemas import MaterialCreate, MaterialResponse

router = APIRouter(prefix="/api/materials", tags=["Materials"])


@router.get("", response_model=List[MaterialResponse])
def get_materials(
    search: Optional[str] = Query(None, description="Search description or CPSE material code"),
    cpse: Optional[str] = Query(None, description="Filter by CPSE code (e.g. ONGC, BHEL) or CPSE id"),
    skip: int = Query(0, ge=0, description="Offset for pagination"),
    limit: int = Query(50, ge=1, le=500, description="Limit rows returned"),
    db: Session = Depends(get_db),
):
    """Retrieve materials with optional text search and CPSE filtering."""
    query = db.query(Material).join(CPSE, Material.cpse_id == CPSE.id)

    # Search filter on description or cpse_material_code
    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Material.description.ilike(search_pattern),
                Material.cpse_material_code.ilike(search_pattern),
            )
        )

    # CPSE filter by code or ID
    if cpse:
        cpse_val = cpse.strip()
        if cpse_val.isdigit():
            query = query.filter(Material.cpse_id == int(cpse_val))
        else:
            query = query.filter(func.upper(CPSE.code) == cpse_val.upper())

    materials = query.order_by(Material.id.asc()).offset(skip).limit(limit).all()
    return materials


@router.get("/{id}", response_model=MaterialResponse)
def get_material(id: int, db: Session = Depends(get_db)):
    """Retrieve a single material record by ID."""
    material = db.query(Material).filter(Material.id == id).first()
    if not material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Material with id {id} not found",
        )
    return material


@router.post("", response_model=MaterialResponse, status_code=status.HTTP_201_CREATED)
def create_material(material_in: MaterialCreate, db: Session = Depends(get_db)):
    """Create a new material record."""
    # Verify CPSE exists
    cpse = db.query(CPSE).filter(CPSE.id == material_in.cpse_id).first()
    if not cpse:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"CPSE with id {material_in.cpse_id} does not exist",
        )

    new_material = Material(
        cpse_id=material_in.cpse_id,
        cpse_material_code=material_in.cpse_material_code,
        description=material_in.description,
        unit_of_measure=material_in.unit_of_measure,
        long_description=material_in.long_description,
        specification_text=material_in.specification_text,
        classification_code=material_in.classification_code,
    )
    db.add(new_material)
    db.commit()
    db.refresh(new_material)
    return new_material
