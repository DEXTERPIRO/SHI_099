from collections import Counter
from typing import Dict, Optional
from sqlalchemy.orm import Session
from app.models import Material
from app.services.duplicates import get_duplicate_clusters
from app.services.matching import normalize_text


def detect_category(text: str) -> str:
    """Detect material category based on text rules:
    - bearing -> Bearings
    - valve   -> Valves
    - pipe    -> Pipes
    - motor   -> Motors
    """
    normalized = normalize_text(text)
    if "bearing" in normalized:
        return "Bearings"
    if "valve" in normalized:
        return "Valves"
    if "pipe" in normalized:
        return "Pipes"
    if "motor" in normalized:
        return "Motors"
    return "General"


def standardize_cluster(db: Session, cluster_id: int) -> Optional[Dict[str, str]]:
    """Standardize a duplicate cluster by:
    1. Choosing the longest description as standard description.
    2. Choosing the most common UOM across cluster materials.
    3. Detecting category (bearing->Bearings, valve->Valves, pipe->Pipes, motor->Motors).
    """
    clusters = get_duplicate_clusters(db)
    target_cluster = next((c for c in clusters if c["cluster_id"] == cluster_id), None)

    if not target_cluster:
        return None

    material_ids = [m["id"] for m in target_cluster["materials"]]
    materials = db.query(Material).filter(Material.id.in_(material_ids)).all()

    if not materials:
        return None

    # 1. Choose longest description as standard description
    longest_mat = max(materials, key=lambda m: len(m.description or ""))
    standardized_description = longest_mat.description

    # 2. Choose most common UOM
    uoms = [m.unit_of_measure for m in materials if m.unit_of_measure]
    if uoms:
        uom_counter = Counter(uoms)
        most_common_uom = uom_counter.most_common(1)[0][0]
    else:
        most_common_uom = "NOS"

    # 3. Detect category based on standard description (and cluster materials)
    category = detect_category(standardized_description)
    if category == "General":
        for m in materials:
            cat = detect_category(m.description)
            if cat != "General":
                category = cat
                break

    return {
        "standardized_description": standardized_description,
        "category": category,
        "uom": most_common_uom,
    }
