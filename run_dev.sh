#!/usr/bin/env bash
set -e

echo "=== Starting SafePath (SheShield) Development Environment ==="

# Trap INT and TERM to clean up background processes
trap 'kill $(jobs -p) 2>/dev/null || true' EXIT

# 1. Start Backend FastAPI
echo "[Backend] Starting FastAPI server on http://localhost:8000..."
source .venv/bin/activate
cd backend
uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

# 2. Start Frontend Vite
echo "[Frontend] Starting Vite dev server on http://localhost:5173..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "SafePath running! Open http://localhost:5173 in your browser."
wait
