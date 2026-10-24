"""Main FastAPI application entrypoint."""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import DEFAULT_CENTER, GRAPH_FILE
from .api import routes, risk, report, upload

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("safepath")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing SafePath Routing Engine...")
    # Initialize in-memory dynamic report storage
    app.state.reports = []
    app.state.dynamic_edge_penalties = {}  # edge_key -> extra penalty
    
    # Load scored graph if available
    if GRAPH_FILE.exists():
        logger.info(f"Loading precomputed graph from {GRAPH_FILE}...")
        try:
            import pickle
            with open(GRAPH_FILE, "rb") as f:
                app.state.graph = pickle.load(f)
            logger.info("Graph loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to load graph: {e}")
            app.state.graph = None
    else:
        logger.warning(f"Graph file not found at {GRAPH_FILE}. Run scripts/build_graph.py to generate.")
        app.state.graph = None

    yield
    logger.info("SafePath API shutting down...")

app = FastAPI(
    title="SafePath Navigation API",
    description="Risk-weighted personal safety routing engine for urban navigation",
    version="1.0.0",
    lifespan=lifespan
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(routes.router, prefix="/api", tags=["Routing"])
app.include_router(risk.router, prefix="/api", tags=["Risk Overlay"])
app.include_router(report.router, prefix="/api", tags=["Reports"])
app.include_router(upload.router, prefix="/api", tags=["Data Upload"])

@app.get("/health")
def healthcheck():
    return {
        "status": "healthy",
        "service": "safepath-api",
        "has_graph": app.state.graph is not None,
        "active_reports": len(app.state.reports)
    }

@app.get("/api/config")
def get_config():
    return {
        "city": "Chicago",
        "center": DEFAULT_CENTER,
        "has_graph": app.state.graph is not None
    }
