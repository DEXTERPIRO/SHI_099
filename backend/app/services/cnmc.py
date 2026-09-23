from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models import CommonMaterialCode, MaterialMapping
from app.services.standardization import standardize_cluster
from app.services.duplicates import get_duplicate_clusters


CATEGORY_PREFIXES = {
    "Bearings": "BRG",
    "Valves": "VLV",
    "Pipes": "PIP",
    "Motors": "MTR",
}


def generate_cnmc_for_cluster(db: Session, cluster_id: int) -> Optional[Dict[str, Any]]:
    """Automatically generate a standardized CNMC code for a duplicate cluster.

    Format: NUM-{PREFIX}-{NNN} (e.g. NUM-BRG-001, NUM-VLV-001)
    Prefixes:
      - BRG (Bearings)
      - VLV (Valves)
      - PIP (Pipes)
      - MTR (Motors)

    Stores:
      - cnmc_code
      - standardized_description
    """
    std_info = standardize_cluster(db, cluster_id)
    if not std_info:
        return None

    category = std_info.get("category", "General")
    standardized_description = std_info.get("standardized_description", "")
    uom = std_info.get("uom", "NOS")

    prefix = CATEGORY_PREFIXES.get(category, "GEN")

    # Find next incrementing integer for prefix
    existing_codes = (
        db.query(CommonMaterialCode.cnmc_code)
        .filter(CommonMaterialCode.cnmc_code.like(f"NUM-{prefix}-%"))
        .all()
    )

    max_num = 0
    for (code,) in existing_codes:
        try:
            parts = code.split("-")
            if len(parts) >= 3 and parts[-1].isdigit():
                max_num = max(max_num, int(parts[-1]))
        except Exception:
            continue

    next_num = max_num + 1
    cnmc_code = f"NUM-{prefix}-{next_num:03d}"

    # Check for existing code collision and increment if needed
    while db.query(CommonMaterialCode).filter_by(cnmc_code=cnmc_code).first() is not None:
        next_num += 1
        cnmc_code = f"NUM-{prefix}-{next_num:03d}"

    # Store in common_material_codes table
    cnmc_record = CommonMaterialCode(
        cnmc_code=cnmc_code,
        standardized_description=standardized_description,
        category=category,
        uom_standard=uom,
        status="active",
    )
    db.add(cnmc_record)
    db.commit()
    db.refresh(cnmc_record)

    # Link materials from cluster into material_mappings
    clusters = get_duplicate_clusters(db)
    target_cluster = next((c for c in clusters if c["cluster_id"] == cluster_id), None)
    if target_cluster:
        for mat in target_cluster.get("materials", []):
            mapping = MaterialMapping(
                material_id=mat["id"],
                cnmc_id=cnmc_record.id,
                confidence_score=mat.get("score", 100.0),
                match_method="standardized",
                status="approved",
            )
            db.add(mapping)
        db.commit()

    return {
        "id": cnmc_record.id,
        "cnmc_code": cnmc_record.cnmc_code,
        "standardized_description": cnmc_record.standardized_description,
        "category": cnmc_record.category,
        "uom": cnmc_record.uom_standard,
    }
