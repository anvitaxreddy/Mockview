from fastapi import Header, HTTPException
from app.services.supabase_service import get_supabase


async def get_current_user(authorization: str = Header(...)) -> str:
    """Extract and verify Supabase JWT, returning the user_id."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header.")

    token = authorization.removeprefix("Bearer ")
    try:
        response = get_supabase().auth.get_user(token)
        user = response.user
        if not user:
            raise HTTPException(status_code=401, detail="Invalid or expired token.")
        return user.id
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")
