import os

import uvicorn


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=os.environ.get("MEDIAFORGE_HOST", "127.0.0.1"),
        port=int(os.environ.get("MEDIAFORGE_PORT", "8000")),
        reload=os.environ.get("MEDIAFORGE_RELOAD", "0") == "1",
        log_config=None,
    )
