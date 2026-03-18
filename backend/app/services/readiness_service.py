from __future__ import annotations

from fastapi import HTTPException, status

from app.services.health_service import health_service


async def ensure_feature_ready(feature_key: str) -> None:
    snapshot = await health_service.get(force_refresh=True)
    feature = next((item for item in snapshot.features if item.key == feature_key), None)

    if feature is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unknown MediaForge feature.")

    if feature.status == "ready":
        return

    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail=f"{feature.label} is unavailable. {feature.detail}. Check the System panel for missing dependencies.",
    )
