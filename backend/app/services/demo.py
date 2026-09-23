import sys
import os
from sqlalchemy.orm import Session
from app.models import (
    CPSE,
    Material,
    MatchCandidate,
    CommonMaterialCode,
    MaterialMapping,
)

# Add backend directory to sys.path to import get_sample_materials
backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from seed_materials import get_sample_materials
from app.services.matching import run_matching_engine
from app.services.duplicates import get_duplicate_clusters
from app.services.cnmc import generate_cnmc_for_cluster


def initialize_demo_data(db: Session):
    """Seed data automatically on startup if not already seeded,
    run matching, generate CNMCs, and populate review queue.
    """
    mat_count = db.query(Material).count()
    if mat_count < 10:
        reset_demo_data(db)
    else:
        # Ensure match candidates exist
        cand_count = db.query(MatchCandidate).count()
        if cand_count == 0:
            run_matching_engine(db)

        # Ensure CNMC codes exist
        cnmc_count = db.query(CommonMaterialCode).count()
        if cnmc_count == 0:
            clusters = get_duplicate_clusters(db)
            for c in clusters:
                generate_cnmc_for_cluster(db, c["cluster_id"])

        # Ensure pending items in review queue
        pending_count = db.query(MaterialMapping).filter(MaterialMapping.status == "pending").count()
        if pending_count == 0:
            mappings = db.query(MaterialMapping).limit(5).all()
            for m in mappings:
                m.status = "pending"
            db.commit()


def reset_demo_data(db: Session):
    """Reset and re-seed the full demo dataset cleanly.
    1. Clear existing records
    2. Seed 5 CPSEs
    3. Seed 100 materials across 5 CPSEs
    4. Run RapidFuzz matching automatically
    5. Generate CNMCs automatically
    6. Set review queue items
    """
    # 1. Clear existing records
    db.query(MaterialMapping).delete()
    db.query(MatchCandidate).delete()
    db.query(CommonMaterialCode).delete()
    db.query(Material).delete()
    db.query(CPSE).delete()
    db.commit()

    # 2. Seed CPSEs
    cpse_data = [
        {"code": "ONGC", "name": "Oil and Natural Gas Corporation", "sector": "Hydrocarbons / Oil & Gas"},
        {"code": "SAIL", "name": "Steel Authority of India Limited", "sector": "Steel & Metallurgy"},
        {"code": "NTPC", "name": "NTPC Limited", "sector": "Power Generation & Utilities"},
        {"code": "CIL", "name": "Coal India Limited", "sector": "Mining & Resources"},
        {"code": "BHEL", "name": "Bharat Heavy Electricals Limited", "sector": "Heavy Engineering & Manufacturing"},
    ]
    for c_info in cpse_data:
        db.add(CPSE(**c_info))
    db.commit()

    cpses = db.query(CPSE).all()
    cpse_map = {c.code: c.id for c in cpses}

    # 3. Seed 100 materials
    materials = get_sample_materials(cpse_map)
    for item in materials:
        mat = Material(
            cpse_id=item["cpse_id"],
            cpse_material_code=item["cpse_material_code"],
            description=item["description"],
            unit_of_measure=item.get("unit_of_measure", "NOS"),
        )
        db.add(mat)
    db.commit()

    # 4. Run matching automatically
    run_matching_engine(db)

    # 5. Generate CNMC automatically for clusters
    clusters = get_duplicate_clusters(db)
    for c in clusters:
        generate_cnmc_for_cluster(db, c["cluster_id"])

    # 6. Set first 5 mappings to 'pending' for review demo flow, rest approved
    mappings = db.query(MaterialMapping).all()
    for idx, m in enumerate(mappings):
        m.status = "pending" if idx < 5 else "approved"
    db.commit()

    return {
        "status": "success",
        "message": "Demo data reset successfully: 100 materials, RapidFuzz matching executed, CNMC codes generated, review queue populated.",
        "materials": db.query(Material).count(),
        "candidates": db.query(MatchCandidate).count(),
        "cnmc_codes": db.query(CommonMaterialCode).count(),
        "pending_reviews": db.query(MaterialMapping).filter(MaterialMapping.status == "pending").count(),
    }
