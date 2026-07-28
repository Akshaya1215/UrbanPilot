"""FastAPI application entrypoint for UrbanPilot AI backend routes."""

from fastapi import FastAPI

from backend.routes.environment_routes import router as environment_router

app = FastAPI(title="UrbanPilot AI Backend")
app.include_router(environment_router)


@app.get("/health")
async def health() -> dict[str, str]:
    """Return service health for load balancers and local checks."""
    return {"status": "ok"}
