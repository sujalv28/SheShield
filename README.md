# SafePath (SheShield) 🛡️

> **Social Impact & Women Safety Navigation**  
> Google Maps finds the fastest route. **SafePath** finds the route with the least risk exposure, explains the tradeoff, and lets the user choose their detour limit.

---

## 🌟 Key Features
- **Fastest vs. Safest Route Comparison:** Side-by-side polyline routing, safety scores (0–100), distance, and time deltas.
- **Explainable Factors:** Real-time visibility into street lighting, proximity to open havens/transit/police, and historic incident exposure.
- **Detour Allowance Slider:** User-tunable slider (0% to 50% extra distance) allowing personal control over the safety-distance tradeoff.
- **Time-of-Day Dynamics:** Dynamic scoring for **Day**, **Evening**, and **Night** shifts.
- **Crowdsourced Unsafe Spot Reporting:** Direct nearest-segment penalty with immediate live map rescoring.
- **Curated Demo Presets:** 1-click test scenarios for rapid pitch evaluations.
- **Incident CSV Ingestion:** Support for uploading custom crime/incident point datasets.

---

## 🏗️ Architecture & Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, MapLibre GL, Carto Positron & Dark Matter vector tiles.
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
