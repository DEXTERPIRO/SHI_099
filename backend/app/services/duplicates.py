from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models import Material, MatchCandidate
from app.services.matching import run_matching_engine


def get_duplicate_clusters(db: Session) -> List[Dict[str, Any]]:
    """Group materials using simple grouping based on match candidates.

    Rules:
    - score > 90: exact duplicate
    - score > 75: near duplicate

    Simple grouping without graph algorithms or union-find.
    """
    materials = db.query(Material).all()
    if not materials:
        return []

    material_map = {m.id: m for m in materials}

    # Fetch stored candidates with similarity_score > 75
    candidates = (
        db.query(MatchCandidate)
        .filter(MatchCandidate.similarity_score > 75)
        .order_by(MatchCandidate.similarity_score.desc())
        .all()
    )

    # If match candidates are not stored yet, run matching engine to compute and persist
    if not candidates:
        run_matching_engine(db)
        candidates = (
            db.query(MatchCandidate)
            .filter(MatchCandidate.similarity_score > 75)
            .order_by(MatchCandidate.similarity_score.desc())
            .all()
        )

    # Group candidate records by source material_id
    cand_by_material: Dict[int, List[MatchCandidate]] = {}
    for c in candidates:
        cand_by_material.setdefault(c.material_id, []).append(c)

    visited = set()
    clusters: List[Dict[str, Any]] = []

    for mat in materials:
        if mat.id in visited:
            continue

        mat_cands = cand_by_material.get(mat.id, [])
        valid_cands = [c for c in mat_cands if c.candidate_material_id not in visited]

        if valid_cands:
            visited.add(mat.id)
            has_exact = False
            group_materials = [
                {
                    "id": mat.id,
                    "cpse_material_code": mat.cpse_material_code,
                    "description": mat.description,
                    "cpse_id": mat.cpse_id,
                    "score": 100.0,
                    "duplicate_type": "primary",
                }
            ]

            for c in valid_cands:
                cand_mat = material_map.get(c.candidate_material_id)
                if cand_mat and cand_mat.id not in visited:
                    visited.add(cand_mat.id)
                    dtype = "exact" if c.similarity_score > 90 else "near"
                    if dtype == "exact":
                        has_exact = True

                    group_materials.append(
                        {
                            "id": cand_mat.id,
                            "cpse_material_code": cand_mat.cpse_material_code,
                            "description": cand_mat.description,
                            "cpse_id": cand_mat.cpse_id,
                            "score": c.similarity_score,
                            "duplicate_type": dtype,
                        }
                    )

            match_type = "exact" if has_exact else "near"

            clusters.append(
                {
                    "cluster_id": len(clusters) + 1,
                    "match_type": match_type,
                    "primary_material": {
                        "id": mat.id,
                        "cpse_material_code": mat.cpse_material_code,
                        "description": mat.description,
                        "cpse_id": mat.cpse_id,
                    },
                    "materials": group_materials,
                    "count": len(group_materials),
                }
            )

    return clusters


def get_duplicate_summary(db: Session) -> Dict[str, Any]:
    """Calculate summary statistics for duplicate materials.

    Returns:
    {
      "total_materials": int,
      "duplicate_groups": int,
      "estimated_savings": float
    }
    """
    total_materials = db.query(Material).count()
    clusters = get_duplicate_clusters(db)

    duplicate_groups = len(clusters)
    total_redundant_items = sum(c["count"] - 1 for c in clusters)

    # Cost savings estimate: 50,000 per redundant item eliminated across CPSEs
    estimated_savings = float(total_redundant_items * 50000.0)

    return {
        "total_materials": total_materials,
        "duplicate_groups": duplicate_groups,
        "estimated_savings": estimated_savings,
    }
