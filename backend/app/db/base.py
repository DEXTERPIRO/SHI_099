"""Import all models for Alembic autogenerate discovery."""
from app.db.session import Base
from app.models import (
    CPSE,
    Material,
    CommonMaterialCode,
    MaterialMapping,
    MatchCandidate,
    User,
    AuditLog,
)

__all__ = [
    "Base",
    "CPSE",
    "Material",
    "CommonMaterialCode",
    "MaterialMapping",
    "MatchCandidate",
    "User",
    "AuditLog",
]
