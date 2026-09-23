from datetime import datetime
from typing import Optional, List, Any
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Float,
    DateTime,
    ForeignKey,
    Index,
    JSON,
    func
)
from sqlalchemy.orm import relationship
from app.db.session import Base


class CPSE(Base):
    """Central Public Sector Enterprise (CPSE) entity."""
    __tablename__ = "cpses"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    code = Column(String(50), unique=True, index=True, nullable=False)  # e.g. ONGC, SAIL, NTPC, CIL, BHEL
    sector = Column(String(100), nullable=True)
    sap_system_id = Column(String(100), nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    # Relationships
    materials = relationship("Material", back_populates="cpse", cascade="all, delete-orphan")
    users = relationship("User", back_populates="cpse")

    def __repr__(self) -> str:
        return f"<CPSE(code='{self.code}', name='{self.name}')>"


class Material(Base):
    """Legacy or ERP material master record ingested from a specific CPSE."""
    __tablename__ = "materials"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    cpse_id = Column(Integer, ForeignKey("cpses.id", ondelete="CASCADE"), nullable=False, index=True)
    cpse_material_code = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=False, index=True)
    long_description = Column(Text, nullable=True)
    specification_text = Column(Text, nullable=True)
    unit_of_measure = Column(String(50), nullable=True)
    classification_code = Column(String(100), nullable=True)  # e.g. MESC, UNSPSC, or legacy CPSE group
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    # Relationships
    cpse = relationship("CPSE", back_populates="materials")
    mappings = relationship("MaterialMapping", back_populates="material", cascade="all, delete-orphan")
    candidates_as_source = relationship(
        "MatchCandidate",
        foreign_keys="MatchCandidate.material_id",
        back_populates="material",
        cascade="all, delete-orphan",
    )
    candidates_as_target = relationship(
        "MatchCandidate",
        foreign_keys="MatchCandidate.candidate_material_id",
        back_populates="candidate_material",
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        Index("ix_materials_cpse_code", "cpse_id", "cpse_material_code"),
        Index("ix_materials_description_trgm", "description"),
    )

    def __repr__(self) -> str:
        return f"<Material(id={self.id}, cpse_code='{self.cpse_material_code}', desc='{self.description[:30]}...')>"


class CommonMaterialCode(Base):
    """Common National Material Code (CNMC) - Harmonized standardized item registry."""
    __tablename__ = "common_material_codes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    cnmc_code = Column(String(100), unique=True, index=True, nullable=False)  # e.g. "NUM-STL-000123"
    standardized_description = Column(Text, nullable=False)
    standardized_specification = Column(Text, nullable=True)
    category = Column(String(100), nullable=True)
    subcategory = Column(String(100), nullable=True)
    uom_standard = Column(String(50), nullable=True)
    status = Column(String(50), default="active", nullable=False)  # draft / active / deprecated
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    # Relationships
    mappings = relationship("MaterialMapping", back_populates="cnmc", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<CommonMaterialCode(cnmc='{self.cnmc_code}', status='{self.status}')>"


class MaterialMapping(Base):
    """Linkage between an enterprise legacy material record and a unified CNMC standard."""
    __tablename__ = "material_mappings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    material_id = Column(Integer, ForeignKey("materials.id", ondelete="CASCADE"), nullable=False, index=True)
    cnmc_id = Column(Integer, ForeignKey("common_material_codes.id", ondelete="CASCADE"), nullable=False, index=True)
    confidence_score = Column(Float, nullable=True)
    match_method = Column(String(50), nullable=False)  # exact / fuzzy / semantic / manual
    status = Column(String(50), default="pending", nullable=False)  # pending / approved / rejected
    reviewed_by = Column(String(100), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)

    # Relationships
    material = relationship("Material", back_populates="mappings")
    cnmc = relationship("CommonMaterialCode", back_populates="mappings")

    def __repr__(self) -> str:
        return f"<MaterialMapping(material_id={self.material_id}, cnmc_id={self.cnmc_id}, method='{self.match_method}', status='{self.status}')>"


class MatchCandidate(Base):
    """Raw AI matching output between materials across CPSEs before becoming an approved mapping."""
    __tablename__ = "match_candidates"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    material_id = Column(Integer, ForeignKey("materials.id", ondelete="CASCADE"), nullable=False, index=True)
    candidate_material_id = Column(Integer, ForeignKey("materials.id", ondelete="CASCADE"), nullable=False, index=True)
    similarity_score = Column(Float, nullable=False)
    method = Column(String(50), nullable=False)  # exact / rapidfuzz / sentence_transformers
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    # Relationships
    material = relationship("Material", foreign_keys=[material_id], back_populates="candidates_as_source")
    candidate_material = relationship("Material", foreign_keys=[candidate_material_id], back_populates="candidates_as_target")

    def __repr__(self) -> str:
        return f"<MatchCandidate(m1={self.material_id}, m2={self.candidate_material_id}, score={self.similarity_score:.3f}, method='{self.method}')>"


class User(Base):
    """System and CPSE user accounts."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    role = Column(String(50), nullable=False)  # admin / cpse_user / approver
    cpse_id = Column(Integer, ForeignKey("cpses.id", ondelete="SET NULL"), nullable=True, index=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    # Relationships
    cpse = relationship("CPSE", back_populates="users")

    def __repr__(self) -> str:
        return f"<User(email='{self.email}', role='{self.role}')>"


class AuditLog(Base):
    """Immutable audit trail for compliance and tracking harmonization operations."""
    __tablename__ = "audit_log"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    entity_type = Column(String(100), nullable=False, index=True)
    entity_id = Column(Integer, nullable=True, index=True)
    action = Column(String(100), nullable=False)  # CREATE / UPDATE / DELETE / APPROVE / REJECT / MERGE
    actor = Column(String(100), nullable=False)  # User email or system identifier
    before_json = Column(JSON, nullable=True)
    after_json = Column(JSON, nullable=True)
    timestamp = Column(DateTime, server_default=func.now(), nullable=False, index=True)

    def __repr__(self) -> str:
        return f"<AuditLog(action='{self.action}', entity='{self.entity_type}:{self.entity_id}', actor='{self.actor}')>"
