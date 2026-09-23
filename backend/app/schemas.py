from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class CPSEBrief(BaseModel):
    id: int
    code: str
    name: str
    sector: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class MaterialBase(BaseModel):
    cpse_material_code: str
    description: str
    unit_of_measure: Optional[str] = None
    long_description: Optional[str] = None
    specification_text: Optional[str] = None
    classification_code: Optional[str] = None


class MaterialCreate(MaterialBase):
    cpse_id: int


class MaterialResponse(MaterialBase):
    id: int
    cpse_id: int
    created_at: Optional[datetime] = None
    cpse: Optional[CPSEBrief] = None
    status: Optional[str] = "Pending"

    model_config = ConfigDict(from_attributes=True)


class CandidateResponse(BaseModel):
    candidate_id: int
    description: str
    score: float

    model_config = ConfigDict(from_attributes=True)


class MatchingRunResponse(BaseModel):
    status: str
    message: str
    materials_processed: int
    candidates_stored: int


class DuplicateSummaryResponse(BaseModel):
    total_materials: int
    duplicate_groups: int
    estimated_savings: float


class DuplicateClusterMaterial(BaseModel):
    id: int
    cpse_material_code: str
    description: str
    cpse_id: int
    score: Optional[float] = None
    duplicate_type: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class DuplicateClusterResponse(BaseModel):
    cluster_id: int
    match_type: str
    primary_material: DuplicateClusterMaterial
    materials: List[DuplicateClusterMaterial]
    count: int

    model_config = ConfigDict(from_attributes=True)


class StandardizationResponse(BaseModel):
    standardized_description: str
    category: str
    uom: str

    model_config = ConfigDict(from_attributes=True)


class CNMCGenerateResponse(BaseModel):
    id: int
    cnmc_code: str
    standardized_description: str
    category: Optional[str] = None
    uom: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ReviewItemResponse(BaseModel):
    id: int
    material_id: int
    material_code: Optional[str] = None
    material_description: Optional[str] = None
    cnmc_id: int
    cnmc_code: Optional[str] = None
    standardized_description: Optional[str] = None
    confidence_score: Optional[float] = None
    match_method: str
    status: str

    model_config = ConfigDict(from_attributes=True)


