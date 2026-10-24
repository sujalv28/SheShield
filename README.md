# SafePath (SheShield) 🛡️

> **Social Impact & Women Safety Navigation**  
> Google Maps finds the fastest route. **SafePath** finds the route with the least risk exposure, explains the tradeoff, and lets the user choose their detour limit.

---

## 🌟 Key Features
- **Fastest vs. Safest Route Comparison:** Side-by-side polyline routing, safety scores (0–100), distance, and time deltas.
- **Explainable Factors:** Real-time visibility into street lighting, proximity to open havens/transit/police, and historic incident exposure.
- **Detour Allowance Slider:** User-tunable slider (0% to 50% extra distance) allowing personal control over the safety-distance tradeoff.
- **Time-of-Day Dynamics:** Dynamic scoring with dedicated **Day Mode** (well-lit) and official OpenFreeMap **Night Mode** (lighting penalty active).
- **Crowdsourced Unsafe Spot Reporting:** Direct nearest-segment penalty with immediate live map rescoring.
- **Demo Showcase Presets:** User-selectable 1-click scenarios for a repeatable hackathon showcase.
- **Incident CSV Ingestion:** Support for uploading custom crime/incident point datasets.
- **Gemma Data Analysis:** Optional Gemma analysis of uploaded Chicago incident records for coverage, patterns, and scoring limitations; routing remains deterministic.

---

## 🏗️ Architecture & Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, MapLibre GL, OpenFreeMap vector basemaps (Dark & Positron styles, zero API key required).
- **Backend:** Python 3.12, FastAPI, NetworkX, OSMnx, GeoPandas, Shapely, Scikit-learn.
- **Data Source:** Chicago Open Data Portal (Socrata API) + OpenStreetMap (OSM) infrastructure.
- **Routing Engine:** Constrained Multi-Candidate shortest paths (Yen's K-Shortest Paths) with composite safety score optimization.

---

## 🚀 Quickstart (Local Development)

### Prerequisites
- Node.js >= 20
- Python >= 3.12 (managed via `mise` or system)

### Run Both Services Concurrently
```bash
./run_dev.sh
```
- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

To enable Gemma analysis, set the backend `API_KEY` environment variable. The model defaults to `gemma-4-31b-it`; override it with `GEMMA_MODEL` if needed. CSV ingestion continues to work without a key, but the analysis result is marked unavailable.

### Run with Docker Compose
```bash
docker compose up --build
```
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:8000](http://localhost:8000)

---

## 📄 Documentation
- [PRD.md](PRD.md)
- [ARCHITECTURE_SPEC.md](ARCHITECTURE_SPEC.md)
