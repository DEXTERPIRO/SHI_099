import sys
import os

# Ensure backend root is on path when running as script
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal, engine
from app.models import (
    CPSE,
    User,
    Material,
    CommonMaterialCode,
    MaterialMapping,
    MatchCandidate,
    AuditLog,
)


def seed_database():
    """Seed the database with initial CPSEs and demo users, and print table counts."""
    db: Session = SessionLocal()
    try:
        print("=" * 60)
        print("SEEDING NATIONAL UNIFIED MATERIAL MASTER (NUMM) DATABASE")
        print("=" * 60)

        # 1. Seed 5 CPSEs
        cpse_data = [
            {
                "code": "ONGC",
                "name": "Oil and Natural Gas Corporation",
                "sector": "Hydrocarbons / Oil & Gas",
                "sap_system_id": "SAP-ECC-ONGC-PRD",
            },
            {
                "code": "SAIL",
                "name": "Steel Authority of India Limited",
                "sector": "Steel & Metallurgy",
                "sap_system_id": "SAP-ERP-SAIL-01",
            },
            {
                "code": "NTPC",
                "name": "NTPC Limited",
                "sector": "Power Generation & Utilities",
                "sap_system_id": "ORA-ERP-NTPC-PRD",
            },
            {
                "code": "CIL",
                "name": "Coal India Limited",
                "sector": "Mining & Resources",
                "sap_system_id": "SAP-S4H-CIL-01",
            },
            {
                "code": "BHEL",
                "name": "Bharat Heavy Electricals Limited",
                "sector": "Heavy Engineering & Manufacturing",
                "sap_system_id": "SAP-S4H-BHEL-01",
            },
        ]

        cpse_map = {}
        for data in cpse_data:
            existing = db.query(CPSE).filter(CPSE.code == data["code"]).first()
            if not existing:
                cpse = CPSE(**data)
                db.add(cpse)
                db.flush()
                cpse_map[data["code"]] = cpse
                print(f" [+] Inserted CPSE: {data['code']} - {data['name']}")
            else:
                cpse_map[data["code"]] = existing
                print(f" [.] Existing CPSE: {existing.code} - {existing.name}")

        db.commit()

        # 2. Seed 3 Demo Users
        user_data = [
            {
                "name": "National Nodal Admin",
                "email": "admin@numm.gov.in",
                "role": "admin",
                "cpse_id": None,
            },
            {
                "name": "ONGC Approver",
                "email": "approver.ongc@ongc.co.in",
                "role": "approver",
                "cpse_id": cpse_map["ONGC"].id,
            },
            {
                "name": "BHEL Material Engineer",
                "email": "engineer.bhel@bhel.in",
                "role": "cpse_user",
                "cpse_id": cpse_map["BHEL"].id,
            },
        ]

        for data in user_data:
            existing = db.query(User).filter(User.email == data["email"]).first()
            if not existing:
                user = User(**data)
                db.add(user)
                db.flush()
                print(f" [+] Inserted User: {data['name']} ({data['email']}) [Role: {data['role']}]")
            else:
                print(f" [.] Existing User: {existing.name} ({existing.email})")

        db.commit()

        # 3. Create initial audit log entry for the seed operation
        audit_entry = AuditLog(
            entity_type="SYSTEM",
            entity_id=None,
            action="INITIAL_SEED",
            actor="system_initializer",
            before_json=None,
            after_json={"cpses_seeded": 5, "users_seeded": 3},
        )
        db.add(audit_entry)
        db.commit()

        # 4. Confirmation & Table Row Counts
        print("-" * 60)
        print("DATABASE CONFIRMATION & ROW COUNTS:")
        print("-" * 60)
        counts = {
            "CPSEs (cpses)": db.query(CPSE).count(),
            "Users (users)": db.query(User).count(),
            "Materials (materials)": db.query(Material).count(),
            "Common Material Codes (common_material_codes)": db.query(CommonMaterialCode).count(),
            "Material Mappings (material_mappings)": db.query(MaterialMapping).count(),
            "Match Candidates (match_candidates)": db.query(MatchCandidate).count(),
            "Audit Logs (audit_log)": db.query(AuditLog).count(),
        }

        for table_name, count in counts.items():
            print(f"  • {table_name:<45}: {count} rows")

        print("=" * 60)
        print("SEEDING COMPLETED SUCCESSFULLY!")
        print("=" * 60)

    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}", file=sys.stderr)
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
