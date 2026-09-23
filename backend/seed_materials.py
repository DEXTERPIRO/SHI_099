"""Seed script to populate exactly 100 sample materials across 5 CPSEs.

Categories (20 items each = 100 total):
- Bearings
- Valves
- Pipes
- Motors
- Fasteners

Includes 10 cross-CPSE duplicate groups demonstrating variation in naming conventions,
abbreviations, metric/imperial notations, and word order across CPSE ERP systems.
"""

import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models import CPSE, Material


def get_sample_materials(cpse_map: dict[str, int]) -> list[dict]:
    """Build list of exactly 100 sample materials with 10 duplicate groups."""
    materials = [
        # =====================================================================
        # CATEGORY: BEARINGS (20 items)
        # =====================================================================
        # DUPLICATE GROUP 1: Deep Groove Ball Bearing 6205 ZZ
        {
            "cpse_id": cpse_map["ONGC"],
            "cpse_material_code": "ONGC-BRG-6205",
            "description": "Ball Bearing 6205 ZZ",
            "unit_of_measure": "NOS",
        },
        {
            "cpse_id": cpse_map["SAIL"],
            "cpse_material_code": "SAIL-7102941",
            "description": "BEARING,BALL,6205-2Z",
            "unit_of_measure": "PC",
        },
        {
            "cpse_id": cpse_map["NTPC"],
            "cpse_material_code": "NTPC-BG-05201",
            "description": "DG Ball Brg 6205zz",
            "unit_of_measure": "NUM",
        },
        # DUPLICATE GROUP 3: Spherical Roller Bearing 22220 EK
        {
            "cpse_id": cpse_map["SAIL"],
            "cpse_material_code": "SAIL-7108820",
            "description": "ROLLER BRG SPHERICAL 22220EK",
            "unit_of_measure": "PC",
        },
        {
            "cpse_id": cpse_map["CIL"],
            "cpse_material_code": "CIL-MB-22220",
            "description": "Bearing Sph Roller 22220 EK/C3",
            "unit_of_measure": "NOS",
        },
        {
            "cpse_id": cpse_map["BHEL"],
            "cpse_material_code": "BHEL-B-22220K",
            "description": "SPH ROLLER BEARING 22220-E1-K",
            "unit_of_measure": "EA",
        },
        # Unique Bearings (14 items)
        {
            "cpse_id": cpse_map["ONGC"],
            "cpse_material_code": "ONGC-BRG-32218",
            "description": "Taper Roller Bearing 32218",
            "unit_of_measure": "NOS",
        },
        {
            "cpse_id": cpse_map["SAIL"],
            "cpse_material_code": "SAIL-7103144",
            "description": "CYLINDRICAL ROLLER BEARING NU 314 ECP",
            "unit_of_measure": "PC",
        },
        {
            "cpse_id": cpse_map["NTPC"],
            "cpse_material_code": "NTPC-BG-06309",
            "description": "Deep Groove Ball Bearing 6309 C3",
            "unit_of_measure": "NUM",
        },
        {
            "cpse_id": cpse_map["CIL"],
            "cpse_material_code": "CIL-MB-51210",
            "description": "Thrust Ball Bearing 51210 Single Direction",
            "unit_of_measure": "NOS",
        },
        {
            "cpse_id": cpse_map["BHEL"],
            "cpse_material_code": "BHEL-B-UCP208",
            "description": "Pillow Block Bearing Unit UCP 208 Cast Housing",
            "unit_of_measure": "EA",
        },
        {
            "cpse_id": cpse_map["ONGC"],
            "cpse_material_code": "ONGC-BRG-7212",
            "description": "Angular Contact Ball Bearing 7212 BECBP 40 Deg",
            "unit_of_measure": "NOS",
        },
        {
            "cpse_id": cpse_map["SAIL"],
            "cpse_material_code": "SAIL-7104905",
            "description": "NEEDLE ROLLER BEARING RNA 4905",
            "unit_of_measure": "PC",
        },
        {
            "cpse_id": cpse_map["NTPC"],
            "cpse_material_code": "NTPC-BG-1208",
            "description": "Self Aligning Ball Bearing 1208 EKTN9",
            "unit_of_measure": "NUM",
        },
        {
            "cpse_id": cpse_map["CIL"],
            "cpse_material_code": "CIL-MB-22316",
            "description": "Spherical Roller Bearing 22316 E Heavy Duty",
            "unit_of_measure": "NOS",
        },
        {
            "cpse_id": cpse_map["BHEL"],
            "cpse_material_code": "BHEL-B-30206",
            "description": "Tapered Roller Bearing Cone Cup Set 30206",
            "unit_of_measure": "SET",
        },
        {
            "cpse_id": cpse_map["ONGC"],
            "cpse_material_code": "ONGC-BRG-LBC25",
            "description": "Linear Ball Bushing Bearing LBCR 25 D",
            "unit_of_measure": "NOS",
        },
        {
            "cpse_id": cpse_map["SAIL"],
            "cpse_material_code": "SAIL-7100205",
            "description": "INSERT BEARING UC 205 D1 WITH SET SCREW",
            "unit_of_measure": "PC",
        },
        {
            "cpse_id": cpse_map["NTPC"],
            "cpse_material_code": "NTPC-BG-6004R",
            "description": "Deep Groove Bearing 6004-2RSH Rubber Sealed",
            "unit_of_measure": "NUM",
        },
        {
            "cpse_id": cpse_map["CIL"],
            "cpse_material_code": "CIL-MB-3308A",
            "description": "Double Row Angular Contact Brg 3308 A",
            "unit_of_measure": "NOS",
        },

        # =====================================================================
        # CATEGORY: VALVES (20 items)
        # =====================================================================
        # DUPLICATE GROUP 2: Gate Valve 2" Cast Iron
        {
            "cpse_id": cpse_map["ONGC"],
            "cpse_material_code": "ONGC-VLV-GT2CI",
            "description": "Gate Valve 2 Inch CI",
            "unit_of_measure": "NOS",
        },
        {
            "cpse_id": cpse_map["BHEL"],
            "cpse_material_code": "BHEL-V-02050",
            "description": 'GATE VLV 2" CAST IRON',
            "unit_of_measure": "PC",
        },
        {
            "cpse_id": cpse_map["SAIL"],
            "cpse_material_code": "SAIL-5201192",
            "description": "Valve Gate CI 50mm",
            "unit_of_measure": "EA",
        },
        # DUPLICATE GROUP 5: Ball Valve 1" SS316 Class 150 Flanged
        {
            "cpse_id": cpse_map["ONGC"],
            "cpse_material_code": "ONGC-VLV-BL1SS",
            "description": 'Ball Valve 1" SS316 Class 150 RF Flanged',
            "unit_of_measure": "NOS",
        },
        {
            "cpse_id": cpse_map["SAIL"],
            "cpse_material_code": "SAIL-5203310",
            "description": "VLV BALL 25MM SS316 150# FLGD",
            "unit_of_measure": "PC",
        },
        {
            "cpse_id": cpse_map["NTPC"],
            "cpse_material_code": "NTPC-VL-01015",
            "description": "BALL VALVE 1 INCH FLANGED SS 316",
            "unit_of_measure": "NUM",
        },
        # DUPLICATE GROUP 9: Swing Check Valve 3" Class 300
        {
            "cpse_id": cpse_map["ONGC"],
            "cpse_material_code": "ONGC-VLV-CK3CS",
            "description": 'Check Valve Swing 3" CS Class 300 RF',
            "unit_of_measure": "NOS",
        },
        {
            "cpse_id": cpse_map["BHEL"],
            "cpse_material_code": "BHEL-V-03300",
            "description": "NRV SWING TYPE 80 NB CS 300#",
            "unit_of_measure": "EA",
        },
        {
            "cpse_id": cpse_map["NTPC"],
            "cpse_material_code": "NTPC-VL-03300",
            "description": "Non Return Valve 3 Inch CS 300 LBS",
            "unit_of_measure": "NUM",
        },
        # Unique Valves (11 items)
        {
            "cpse_id": cpse_map["ONGC"],
            "cpse_material_code": "ONGC-VLV-GL4CS",
            "description": "Globe Valve 4 Inch Carbon Steel Class 600",
            "unit_of_measure": "NOS",
        },
        {
            "cpse_id": cpse_map["SAIL"],
            "cpse_material_code": "SAIL-5204150",
            "description": "BUTTERFLY VALVE WAFER TYPE 150MM PN16",
            "unit_of_measure": "PC",
        },
        {
            "cpse_id": cpse_map["NTPC"],
            "cpse_material_code": "NTPC-VL-06150",
            "description": "Dual Plate Check Valve 6\" Class 150 Wafer Type",
            "unit_of_measure": "NUM",
        },
        {
            "cpse_id": cpse_map["CIL"],
            "cpse_material_code": "CIL-MV-080RL",
            "description": "Diaphragm Valve Rubber Lined 80 NB Flanged",
            "unit_of_measure": "NOS",
        },
        {
            "cpse_id": cpse_map["BHEL"],
            "cpse_material_code": "BHEL-V-KGV200",
            "description": "Knife Gate Valve 200 NB Pneumatic Operated",
            "unit_of_measure": "EA",
        },
        {
            "cpse_id": cpse_map["ONGC"],
            "cpse_material_code": "ONGC-VLV-ND050",
            "description": "Needle Valve 1/2 Inch NPT Female 6000 PSI SS316",
            "unit_of_measure": "NOS",
        },
        {
            "cpse_id": cpse_map["SAIL"],
            "cpse_material_code": "SAIL-5205050",
            "description": "PLUG VALVE SLEEVED PTFE 50 NB CL150",
            "unit_of_measure": "PC",
        },
        {
            "cpse_id": cpse_map["NTPC"],
            "cpse_material_code": "NTPC-VL-SOL24",
            "description": "Solenoid Valve 24V DC 1/2 Inch Brass 2-Way NC",
            "unit_of_measure": "NUM",
        },
        {
            "cpse_id": cpse_map["CIL"],
            "cpse_material_code": "CIL-MV-PRV025",
            "description": "Pressure Relief Valve Set 10 Bar 25 NB Threaded",
            "unit_of_measure": "NOS",
        },
        {
            "cpse_id": cpse_map["BHEL"],
            "cpse_material_code": "BHEL-V-SLV300",
            "description": "Motorized Sluice Valve 300 NB PN1.0 DI Body",
            "unit_of_measure": "EA",
        },
        {
            "cpse_id": cpse_map["ONGC"],
            "cpse_material_code": "ONGC-VLV-STR02",
            "description": "Y-Strainer Valve 2 Inch Flanged Class 150 WCB",
            "unit_of_measure": "NOS",
        },

        # =====================================================================
        # CATEGORY: PIPES (20 items)
        # =====================================================================
        # DUPLICATE GROUP 4: Seamless Carbon Steel Pipe 4" Sch 40 ASTM A106-B
        {
            "cpse_id": cpse_map["ONGC"],
            "cpse_material_code": "ONGC-PIP-04040",
            "description": 'CS PIPE SMLS 4" SCH 40 ASTM A106-B',
            "unit_of_measure": "MTR",
        },
        {
            "cpse_id": cpse_map["NTPC"],
            "cpse_material_code": "NTPC-PP-10040",
            "description": "PIPE,CARBON STEEL,SEAMLESS,100NB,SCH40",
            "unit_of_measure": "M",
        },
        {
            "cpse_id": cpse_map["BHEL"],
            "cpse_material_code": "BHEL-P-04040B",
            "description": "Seamless Pipe 4 Inch Sch 40 CS A106B",
            "unit_of_measure": "MTR",
        },
        # DUPLICATE GROUP 7: GI Pipe 2" Class B ERW
        {
            "cpse_id": cpse_map["SAIL"],
            "cpse_material_code": "SAIL-3105020",
            "description": "GI PIPE ERW 50 NB MEDIUM CLASS",
            "unit_of_measure": "MTR",
        },
        {
            "cpse_id": cpse_map["BHEL"],
            "cpse_material_code": "BHEL-P-02050G",
            "description": 'Galvanised Pipe 2" Class B ERW',
            "unit_of_measure": "M",
        },
        {
            "cpse_id": cpse_map["CIL"],
            "cpse_material_code": "CIL-MP-020GI",
            "description": "PIPE GI 2 INCH MED IS:1239",
            "unit_of_measure": "MTR",
        },
        # Unique Pipes (14 items)
        {
            "cpse_id": cpse_map["ONGC"],
            "cpse_material_code": "ONGC-PIP-SS021",
            "description": "SS Pipe 2 Inch Sch 10S ASTM A312 TP304 Seamless",
            "unit_of_measure": "MTR",
        },
        {
            "cpse_id": cpse_map["SAIL"],
            "cpse_material_code": "SAIL-3105008",
            "description": "SPIRAL WELDED STEEL PIPE 500 NB 8MM THK IS:3589",
            "unit_of_measure": "MTR",
        },
        {
            "cpse_id": cpse_map["NTPC"],
            "cpse_material_code": "NTPC-PP-HD110",
            "description": "HDPE Pipe 110 mm OD PN10 PE100 IS:4984",
            "unit_of_measure": "M",
        },
        {
            "cpse_id": cpse_map["CIL"],
            "cpse_material_code": "CIL-MP-060MS",
            "description": "MS Black Pipe 6 Inch Class C Heavy IS:1239",
            "unit_of_measure": "MTR",
        },
        {
            "cpse_id": cpse_map["BHEL"],
            "cpse_material_code": "BHEL-P-P11080",
            "description": "Alloy Steel Pipe P11 3 Inch Sch 80 Seamless SA335",
            "unit_of_measure": "MTR",
        },
        {
            "cpse_id": cpse_map["ONGC"],
            "cpse_material_code": "ONGC-PIP-06080",
            "description": "Seamless Pipe 6 Inch Sch 80 Carbon Steel A106 Gr B",
            "unit_of_measure": "MTR",
        },
        {
            "cpse_id": cpse_map["SAIL"],
            "cpse_material_code": "SAIL-3108040",
            "description": "ERW BLACK STEEL PIPE 80 NB SCH 40 ASTM A53",
            "unit_of_measure": "MTR",
        },
        {
            "cpse_id": cpse_map["NTPC"],
            "cpse_material_code": "NTPC-PP-CU090",
            "description": "Cupro Nickel Pipe 90/10 1 Inch OD 16 SWG Seamless",
            "unit_of_measure": "M",
        },
        {
            "cpse_id": cpse_map["CIL"],
            "cpse_material_code": "CIL-MP-030UP",
            "description": "UPVC Column Pipe 3 Inch 3m Length with Coupler",
            "unit_of_measure": "NOS",
        },
        {
            "cpse_id": cpse_map["BHEL"],
            "cpse_material_code": "BHEL-P-BT050",
            "description": "Boiler Tube 50.8 mm OD x 4.5 mm Thk SA210 Gr A1",
            "unit_of_measure": "MTR",
        },
        {
            "cpse_id": cpse_map["ONGC"],
            "cpse_material_code": "ONGC-PIP-FLX02",
            "description": "Flexible Metallic Hose Pipe 2\" SS321 1.5M Flanged",
            "unit_of_measure": "NOS",
        },
        {
            "cpse_id": cpse_map["SAIL"],
            "cpse_material_code": "SAIL-3102009",
            "description": "DUCTILE IRON K9 PIPE 200 MM DIA PUSH-ON JOINT",
            "unit_of_measure": "MTR",
        },
        {
            "cpse_id": cpse_map["NTPC"],
            "cpse_material_code": "NTPC-PP-CP025",
            "description": "CPVC Pipe 1 Inch SDR 11 3 Meter Class 1",
            "unit_of_measure": "M",
        },
        {
            "cpse_id": cpse_map["CIL"],
            "cpse_material_code": "CIL-MP-150RL",
            "description": "Slurry Delivery Pipe Rubber Lined 150 NB 6M Flanged",
            "unit_of_measure": "MTR",
        },

        # =====================================================================
        # CATEGORY: MOTORS (20 items)
        # =====================================================================
        # DUPLICATE GROUP 6: 3-Phase Induction Motor 15 kW 4-Pole 415V IE3
        {
            "cpse_id": cpse_map["BHEL"],
            "cpse_material_code": "BHEL-M-15K4P",
            "description": "3-PH IND MOTOR 15KW 4P 415V 50HZ B3 IE3",
            "unit_of_measure": "SET",
        },
        {
            "cpse_id": cpse_map["NTPC"],
            "cpse_material_code": "NTPC-MO-01504",
            "description": "Motor Induction 15 KW 1440 RPM 415V Foot",
            "unit_of_measure": "NOS",
        },
        {
            "cpse_id": cpse_map["CIL"],
            "cpse_material_code": "CIL-EM-15KW4",
            "description": "15KW 4POLE 415V AC SQUIRREL CAGE IND MOTOR",
            "unit_of_measure": "EA",
        },
        # Unique Motors (17 items)
        {
            "cpse_id": cpse_map["ONGC"],
            "cpse_material_code": "ONGC-MOT-075FP",
            "description": "Flameproof Induction Motor 7.5 kW 4P Ex-d IIB T4",
            "unit_of_measure": "NOS",
        },
        {
            "cpse_id": cpse_map["SAIL"],
            "cpse_material_code": "SAIL-6102206",
            "description": "CRANE DUTY SLIPRING MOTOR 22 KW 6P 415V S4 40% CDF",
            "unit_of_measure": "PC",
        },
        {
            "cpse_id": cpse_map["NTPC"],
            "cpse_material_code": "NTPC-MO-250HT",
            "description": "HT Induction Motor 250 kW 6.6 kV 4-Pole Squirrel Cage",
            "unit_of_measure": "NUM",
        },
        {
            "cpse_id": cpse_map["CIL"],
            "cpse_material_code": "CIL-EM-030SUB",
            "description": "Submersible Dewatering Pump Motor 30 kW 415V 2900 RPM",
            "unit_of_measure": "NOS",
        },
        {
            "cpse_id": cpse_map["BHEL"],
            "cpse_material_code": "BHEL-M-500SYN",
            "description": "Synchronous Motor 500 kW 11 kV 6-Pole 1000 RPM",
            "unit_of_measure": "SET",
        },
        {
            "cpse_id": cpse_map["ONGC"],
            "cpse_material_code": "ONGC-MOT-010DC",
            "description": "DC Shunt Motor 10 HP 220V 1500 RPM Base Mounted",
            "unit_of_measure": "NOS",
        },
        {
            "cpse_id": cpse_map["SAIL"],
            "cpse_material_code": "SAIL-6103704",
            "description": "VFD DUTY INDUCTION MOTOR 37 KW 4P IC416 BLOWER COOLED",
            "unit_of_measure": "PC",
        },
        {
            "cpse_id": cpse_map["NTPC"],
            "cpse_material_code": "NTPC-MO-01108",
            "description": "Cooling Tower Fan Motor 11 kW 8P 720 RPM Flange Mount",
            "unit_of_measure": "NUM",
        },
        {
            "cpse_id": cpse_map["CIL"],
            "cpse_material_code": "CIL-EM-055CNV",
            "description": "Conveyor Drive Motor 55 kW 415V 1480 RPM TEFC IP55",
            "unit_of_measure": "NOS",
        },
        {
            "cpse_id": cpse_map["BHEL"],
            "cpse_material_code": "BHEL-M-045VHS",
            "description": "Vertical Hollow Shaft Motor 45 kW 4P Non-Reverse Ratchet",
            "unit_of_measure": "EA",
        },
        {
            "cpse_id": cpse_map["ONGC"],
            "cpse_material_code": "ONGC-MOT-003EX",
            "description": "Explosion Proof Motor 3 kW 2-Pole Zone 1 Ex d IIC T4",
            "unit_of_measure": "NOS",
        },
        {
            "cpse_id": cpse_map["SAIL"],
            "cpse_material_code": "SAIL-6105506",
            "description": "ROLLER TABLE MOTOR 5.5 KW 6P BRAKE MOTOR IP66",
            "unit_of_measure": "PC",
        },
        {
            "cpse_id": cpse_map["NTPC"],
            "cpse_material_code": "NTPC-MO-1500BFP",
            "description": "Boiler Feed Pump Motor 1500 kW 6.6 kV 2P 2980 RPM",
            "unit_of_measure": "NUM",
        },
        {
            "cpse_id": cpse_map["CIL"],
            "cpse_material_code": "CIL-EM-075HAU",
            "description": "Haulage Motor 75 kW 3.3 kV Slipring Type FLP Ex d I",
            "unit_of_measure": "NOS",
        },
        {
            "cpse_id": cpse_map["BHEL"],
            "cpse_material_code": "BHEL-M-004SRV",
            "description": "Servo Motor 4 kW 3000 RPM 13 Nm with Absolute Encoder",
            "unit_of_measure": "EA",
        },
        {
            "cpse_id": cpse_map["ONGC"],
            "cpse_material_code": "ONGC-MOT-015SP",
            "description": "Single Phase Induction Motor 1.5 kW 230V 1440 RPM Cap Start",
            "unit_of_measure": "NOS",
        },
        {
            "cpse_id": cpse_map["NTPC"],
            "cpse_material_code": "NTPC-MO-018SMK",
            "description": "Smoke Extraction Motor 18.5 kW 4P 300 Deg C 2 Hrs Rated",
            "unit_of_measure": "NUM",
        },

        # =====================================================================
        # CATEGORY: FASTENERS (20 items)
        # =====================================================================
        # DUPLICATE GROUP 8: Hex Bolt M16 x 65 Grade 8.8
        {
            "cpse_id": cpse_map["ONGC"],
            "cpse_material_code": "ONGC-FST-M1665",
            "description": "Hex Bolt M16x65 HT Gr 8.8 with Nut",
            "unit_of_measure": "SET",
        },
        {
            "cpse_id": cpse_map["NTPC"],
            "cpse_material_code": "NTPC-FS-16065",
            "description": "BOLT HEX HD M16 X 65MM GRADE 8.8",
            "unit_of_measure": "NOS",
        },
        {
            "cpse_id": cpse_map["SAIL"],
            "cpse_material_code": "SAIL-8101665",
            "description": "HT HEX BOLT M16X65 8.8 GALV",
            "unit_of_measure": "PC",
        },
        # DUPLICATE GROUP 10: Stud Bolt M20 x 120mm SS304
        {
            "cpse_id": cpse_map["ONGC"],
            "cpse_material_code": "ONGC-FST-ST20120",
            "description": "Stud Bolt M20x120mm SS304 w/ 2 Heavy Hex Nuts",
            "unit_of_measure": "SET",
        },
        {
            "cpse_id": cpse_map["SAIL"],
            "cpse_material_code": "SAIL-8102012",
            "description": "STUD SS304 M20 X 120 MM WITH 2 NUTS",
            "unit_of_measure": "PC",
        },
        {
            "cpse_id": cpse_map["CIL"],
            "cpse_material_code": "CIL-MF-20120SS",
            "description": "M20X120 SS STUD BOLT COMPLETE WITH NUTS",
            "unit_of_measure": "NOS",
        },
        # Unique Fasteners (14 items)
        {
            "cpse_id": cpse_map["ONGC"],
            "cpse_material_code": "ONGC-FST-ANC24",
            "description": "Anchor Bolt L-Type M24 x 500mm Grade 4.6 Galvanized",
            "unit_of_measure": "NOS",
        },
        {
            "cpse_id": cpse_map["SAIL"],
            "cpse_material_code": "SAIL-8102075",
            "description": "HIGH STRENGTH FRICTION GRIP BOLT M20X75 10.9",
            "unit_of_measure": "PC",
        },
        {
            "cpse_id": cpse_map["NTPC"],
            "cpse_material_code": "NTPC-FS-12040",
            "description": "Socket Head Cap Screw M12 x 40mm Gr 12.9 Black",
            "unit_of_measure": "NUM",
        },
        {
            "cpse_id": cpse_map["CIL"],
            "cpse_material_code": "CIL-MF-22085",
            "description": "Track Shoe Bolt M22 x 85mm 10.9 with Hex Nut",
            "unit_of_measure": "SET",
        },
        {
            "cpse_id": cpse_map["BHEL"],
            "cpse_material_code": "BHEL-F-J30600",
            "description": "Foundation Bolt J-Type M30 x 600mm IS:2062 Grade A",
            "unit_of_measure": "EA",
        },
        {
            "cpse_id": cpse_map["ONGC"],
            "cpse_material_code": "ONGC-FST-NUT16",
            "description": "Hex Nut M16 Grade 8 Hot Dip Galvanized IS:1364",
            "unit_of_measure": "NOS",
        },
        {
            "cpse_id": cpse_map["SAIL"],
            "cpse_material_code": "SAIL-8100020",
            "description": "SPRING WASHER B20 DIN 127B PHOSPHATED",
            "unit_of_measure": "PC",
        },
        {
            "cpse_id": cpse_map["NTPC"],
            "cpse_material_code": "NTPC-FS-WSH16",
            "description": "Plain Washer M16 Heavy Duty IS:2016 Machined",
            "unit_of_measure": "NUM",
        },
        {
            "cpse_id": cpse_map["CIL"],
            "cpse_material_code": "CIL-MF-CAS24",
            "description": "Slotted Hex Castle Nut M24 x 3.0 Grade 8 Zinc Plated",
            "unit_of_measure": "NOS",
        },
        {
            "cpse_id": cpse_map["BHEL"],
            "cpse_material_code": "BHEL-F-EYE20",
            "description": "Eye Bolt M20 Carbon Steel Forged DIN 580 SWL 1200KG",
            "unit_of_measure": "EA",
        },
        {
            "cpse_id": cpse_map["ONGC"],
            "cpse_material_code": "ONGC-FST-ROD16",
            "description": "Threaded Rod M16 x 1000mm Stainless Steel 316",
            "unit_of_measure": "NOS",
        },
        {
            "cpse_id": cpse_map["SAIL"],
            "cpse_material_code": "SAIL-8100650",
            "description": "SPLIT COTTER PIN 6.3 X 50 MM IS:549 MILD STEEL",
            "unit_of_measure": "PC",
        },
        {
            "cpse_id": cpse_map["NTPC"],
            "cpse_material_code": "NTPC-FS-FLG10",
            "description": "Hex Flange Bolt M10 x 30mm Grade 8.8 Serrated",
            "unit_of_measure": "NUM",
        },
        {
            "cpse_id": cpse_map["CIL"],
            "cpse_material_code": "CIL-MF-CSK08",
            "description": "Counter Sunk Screw M8 x 25mm Phillips SS304 DIN 7991",
            "unit_of_measure": "NOS",
        },
    ]
    return materials


def seed_materials():
    """Insert exactly 100 sample materials into the database directly."""
    db: Session = SessionLocal()
    try:
        print("=" * 65)
        print("SEEDING 100 SAMPLE MATERIALS ACROSS CPSES (NUMM PLATFORM)")
        print("=" * 65)

        # 1. Resolve CPSE IDs
        cpses = db.query(CPSE).all()
        if not cpses:
            print("[!] No CPSEs found in database. Please run seed.py first.", file=sys.stderr)
            sys.exit(1)

        cpse_map = {c.code: c.id for c in cpses}
        print(f"[+] Found {len(cpse_map)} CPSEs: {list(cpse_map.keys())}")

        # 2. Build material items
        materials = get_sample_materials(cpse_map)
        print(f"[+] Total materials prepared: {len(materials)} items")
        assert len(materials) == 100, f"Expected 100 materials, got {len(materials)}"

        # 3. Clean existing materials if re-seeding to maintain exact 100
        existing_count = db.query(Material).count()
        if existing_count > 0:
            print(f"[-] Clearing {existing_count} existing materials for clean 100-item dataset...")
            db.query(Material).delete()
            db.commit()

        # 4. Insert 100 materials directly
        for idx, item in enumerate(materials, start=1):
            mat = Material(
                cpse_id=item["cpse_id"],
                cpse_material_code=item["cpse_material_code"],
                description=item["description"],
                unit_of_measure=item["unit_of_measure"],
            )
            db.add(mat)

        db.commit()

        # 5. Confirmation & Breakdown
        final_count = db.query(Material).count()
        print("-" * 65)
        print(f"DATABASE VERIFICATION: {final_count} Materials Inserted Successfully!")
        print("-" * 65)

        # Breakdown by CPSE
        print("Breakdown by CPSE:")
        for code, c_id in cpse_map.items():
            count = db.query(Material).filter(Material.cpse_id == c_id).count()
            print(f"  • {code:<10}: {count} materials")

        # Duplicate Groups Display
        print("\nVerified 10 Duplicate Groups Created Across CPSEs:")
        duplicate_groups = [
            ("Group 1 (Bearings)", ["Ball Bearing 6205 ZZ", "BEARING,BALL,6205-2Z", "DG Ball Brg 6205zz"]),
            ("Group 2 (Valves)", ["Gate Valve 2 Inch CI", 'GATE VLV 2" CAST IRON', "Valve Gate CI 50mm"]),
            ("Group 3 (Bearings)", ["ROLLER BRG SPHERICAL 22220EK", "Bearing Sph Roller 22220 EK/C3", "SPH ROLLER BEARING 22220-E1-K"]),
            ("Group 4 (Pipes)", ['CS PIPE SMLS 4" SCH 40 ASTM A106-B', "PIPE,CARBON STEEL,SEAMLESS,100NB,SCH40", "Seamless Pipe 4 Inch Sch 40 CS A106B"]),
            ("Group 5 (Valves)", ['Ball Valve 1" SS316 Class 150 RF Flanged', "VLV BALL 25MM SS316 150# FLGD", "BALL VALVE 1 INCH FLANGED SS 316"]),
            ("Group 6 (Motors)", ["3-PH IND MOTOR 15KW 4P 415V 50HZ B3 IE3", "Motor Induction 15 KW 1440 RPM 415V Foot", "15KW 4POLE 415V AC SQUIRREL CAGE IND MOTOR"]),
            ("Group 7 (Pipes)", ["GI PIPE ERW 50 NB MEDIUM CLASS", 'Galvanised Pipe 2" Class B ERW', "PIPE GI 2 INCH MED IS:1239"]),
            ("Group 8 (Fasteners)", ["Hex Bolt M16x65 HT Gr 8.8 with Nut", "BOLT HEX HD M16 X 65MM GRADE 8.8", "HT HEX BOLT M16X65 8.8 GALV"]),
            ("Group 9 (Valves)", ['Check Valve Swing 3" CS Class 300 RF', "NRV SWING TYPE 80 NB CS 300#", "Non Return Valve 3 Inch CS 300 LBS"]),
            ("Group 10 (Fasteners)", ["Stud Bolt M20x120mm SS304 w/ 2 Heavy Hex Nuts", "STUD SS304 M20 X 120 MM WITH 2 NUTS", "M20X120 SS STUD BOLT COMPLETE WITH NUTS"]),
        ]
        for name, items in duplicate_groups:
            print(f"  {name}:")
            for desc in items:
                mat = db.query(Material).filter(Material.description == desc).first()
                cpse_name = [k for k, v in cpse_map.items() if v == mat.cpse_id][0] if mat else "Unknown"
                print(f"    - [{cpse_name}] {desc} ({mat.cpse_material_code if mat else ''})")

        print("=" * 65)
        print("SEEDING COMPLETED SUCCESSFULLY: EXACTLY 100 MATERIALS")
        print("=" * 65)

    except Exception as e:
        db.rollback()
        print(f"Error during material seeding: {e}", file=sys.stderr)
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_materials()
