import uvicorn
from app.core.config import get_app_config


if __name__ == "__main__":
    config = get_app_config()
    uvicorn.run(
        "app.main:app",
        host=config.host,
        port=config.port,
        reload=config.reload,
        log_config=None,
    )
