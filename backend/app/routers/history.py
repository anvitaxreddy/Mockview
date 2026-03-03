from fastapi import APIRouter, Depends
from app.middleware.auth import get_current_user
from app.services.supabase_service import get_user_sessions

router = APIRouter(prefix="/api", tags=["history"])


@router.get("/history")
async def get_history(user_id: str = Depends(get_current_user)):
    """Return all past interview sessions for the authenticated user."""
    sessions = get_user_sessions(user_id)
    return {"sessions": sessions}
