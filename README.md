# National Unified Material Master (NUMM) Platform

A unified enterprise data harmonization platform that standardizes material master catalogues across Central Public Sector Enterprises (CPSEs).

## Problem Statement

Central Public Sector Enterprises (CPSEs) across sectors like energy, defense, steel, and infrastructure manage millions of inventory items under disparate codifications, taxonomies, and naming conventions. This fragmentation prevents cross-enterprise inventory visibility, causes redundant buffer stock procurement, and inhibits inter-CPSE material sharing during supply chain shortages. The NUMM platform harmonizes disparate CPSE material records into a unified common code registry using semantic embeddings, fuzzy record linkage, and standardized taxonomy mapping.

## Monorepo Architecture & Folder Structure

```
├── backend/                  # Python 3.11+ FastAPI service
│   ├── app/
│   │   ├── core/
│   │   │   └── config.py     # Application settings via pydantic-settings
│   │   ├── db/
│   │   │   └── session.py    # SQLAlchemy engine, session maker & declarative base
│   │   └── main.py           # FastAPI entrypoint, CORS configuration & health endpoint
│   ├── requirements.txt      # Backend dependencies
│   └── README.md             # Backend setup & architecture guide
│
├── frontend/                 # React 18 + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/       # Left Sidebar, Top Bar, Header
│   │   │   └── ui/           # Reusable enterprise UI primitives
│   │   ├── lib/
│   │   │   └── utils.ts      # Tailwind class merging utilities
│   │   ├── App.tsx           # NUMM enterprise portal shell
│   │   ├── main.tsx          # React application root
│   │   └── index.css         # Enterprise government design system tokens
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── README.md             # Frontend setup & UI guide
│
├── .gitignore                # Root gitignore for Python, Node, and environment files
└── README.md                 # Root project documentation
```

## Quick Start Guide

### 1. Backend Service (Port 8000)

```bash
cd backend
python -m venv .venv
# On Windows PowerShell:
.venv\Scripts\Activate.ps1
# On Linux / macOS:
# source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Health check endpoint: `http://localhost:8000/health` (returns `{"status": "ok"}`)

### 2. Frontend Application (Port 5173)

```bash
cd frontend
npm install
npm run dev
```
Frontend interface: `http://localhost:5173`
