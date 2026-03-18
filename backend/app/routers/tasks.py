from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect

from app.models.task import Task
from app.services.task_manager import task_manager

router = APIRouter(tags=["tasks"])


@router.get("/api/tasks")
async def list_tasks() -> dict[str, list[dict]]:
    tasks = await task_manager.list_tasks()
    return {"tasks": [task.model_dump(mode="json") for task in tasks]}


@router.get("/api/tasks/{task_id}", response_model=Task)
async def get_task(task_id: str) -> Task:
    task = await task_manager.get_task(task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    return task


@router.post("/api/tasks/{task_id}/cancel", response_model=Task)
async def cancel_task(task_id: str) -> Task:
    task = await task_manager.cancel(task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    refreshed = await task_manager.get_task(task_id)
    if refreshed is None:
        raise HTTPException(status_code=404, detail="Task not found")

    return refreshed


@router.websocket("/ws/progress/{task_id}")
async def task_progress(task_id: str, websocket: WebSocket) -> None:
    await task_manager.connect(task_id, websocket)

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        task_manager.disconnect(task_id, websocket)
