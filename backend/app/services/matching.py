import re
import string
from typing import List, Tuple
from sqlalchemy.orm import Session
from rapidfuzz import fuzz

from app.models import Material, MatchCandidate


def normalize_text(text: str) -> str:
    """Normalize text according to specified rules:

    1. Lowercase
    2. Remove punctuation
    3. Expand abbreviations:
       - brg -> bearing
       - vlv -> valve
       - ci  -> cast iron
    """
    if not text:
        return ""

    # 1. Lowercase
    text = text.lower()

    # 2. Remove punctuation (replacing with space to keep words separated)
    translator = str.maketrans(string.punctuation, " " * len(string.punctuation))
    text = text.translate(translator)

    # 3. Expand abbreviations using word boundaries
    expansions = {
        r"\bbrg\b": "bearing",
        r"\bvlv\b": "valve",
        r"\bci\b": "cast iron",
    }
    for pattern, replacement in expansions.items():
        text = re.sub(pattern, replacement, text)

    # Collapse excess whitespace
    return " ".join(text.split())


def compute_similarity(desc1: str, desc2: str) -> float:
    """Compare descriptions using rapidfuzz.fuzz.token_sort_ratio.

    Returns a score between 0 and 100.
    """
    norm1 = normalize_text(desc1)
    norm2 = normalize_text(desc2)
    return float(fuzz.token_sort_ratio(norm1, norm2))


def run_matching_engine(db: Session, min_score: float = 0.0) -> Tuple[int, int]:
    """Run lightweight matching engine across materials using RapidFuzz.

    Compares materials, selects top 5 matches per material,
    and stores results in the match_candidates table.

    Returns:
        Tuple of (materials_processed, candidates_stored)
    """
    materials = db.query(Material).all()
    if not materials:
        return 0, 0

    # Clear previous match candidates to refresh results
    db.query(MatchCandidate).delete()
    db.commit()

    candidates_to_insert: List[MatchCandidate] = []

    # Pre-normalize all material descriptions
    normalized_cache = {m.id: normalize_text(m.description) for m in materials}

    for source_mat in materials:
        source_norm = normalized_cache[source_mat.id]
        scores = []

        for target_mat in materials:
            if target_mat.id == source_mat.id:
                continue

            target_norm = normalized_cache[target_mat.id]
            score = float(fuzz.token_sort_ratio(source_norm, target_norm))

            if score >= min_score:
                scores.append((target_mat.id, score))

        # Sort descending by score and select top 5 matches
        scores.sort(key=lambda x: x[1], reverse=True)
        top_5 = scores[:5]

        for cand_id, score in top_5:
            candidates_to_insert.append(
                MatchCandidate(
                    material_id=source_mat.id,
                    candidate_material_id=cand_id,
                    similarity_score=round(score, 2),
                    method="rapidfuzz",
                )
            )

    if candidates_to_insert:
        db.bulk_save_objects(candidates_to_insert)
        db.commit()

    return len(materials), len(candidates_to_insert)


def get_candidates_for_material(db: Session, material_id: int) -> List[dict]:
    """Retrieve top 5 match candidates for a given material_id.

    Returns list of dicts with: candidate_id, description, score.
    """
    material = db.query(Material).filter(Material.id == material_id).first()
    if not material:
        return []

    candidates = (
        db.query(MatchCandidate)
        .filter(MatchCandidate.material_id == material_id)
        .order_by(MatchCandidate.similarity_score.desc())
        .limit(5)
        .all()
    )

    # Compute on-the-fly if matching run has not been executed yet
    if not candidates:
        all_materials = db.query(Material).all()
        source_norm = normalize_text(material.description)
        scores = []

        for target_mat in all_materials:
            if target_mat.id == material_id:
                continue
            target_norm = normalize_text(target_mat.description)
            score = float(fuzz.token_sort_ratio(source_norm, target_norm))
            scores.append((target_mat, score))

        scores.sort(key=lambda x: x[1], reverse=True)
        top_5 = scores[:5]

        results = []
        for target_mat, score in top_5:
            results.append(
                {
                    "candidate_id": target_mat.id,
                    "description": target_mat.description,
                    "score": round(score, 2),
                }
            )
        return results

    results = []
    for c in candidates:
        candidate_mat = db.query(Material).filter(Material.id == c.candidate_material_id).first()
        results.append(
            {
                "candidate_id": c.candidate_material_id,
                "description": candidate_mat.description if candidate_mat else "",
                "score": c.similarity_score,
            }
        )

    return results
