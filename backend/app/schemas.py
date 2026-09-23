from datetime import datetime
from typing import Optional
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

    model_config = ConfigDict(from_attributes=True)
