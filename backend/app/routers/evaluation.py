from fastapi import APIRouter, HTTPException
from app.services.answer_evaluator import answer_evaluator
from app.models.schemas import (
    EvaluateRequest,
    EvaluateResponse,
    FollowUpRequest,
    FollowUpResponse,
)
from app.routers.interview import get_session_store

router = APIRouter(prefix="/api/interview", tags=["evaluation"])


@router.post("/{session_id}/evaluate", response_model=EvaluateResponse)
async def evaluate_interview(session_id: str, request: EvaluateRequest):
    """Evaluate all answers and return scores + feedback."""
    sessions = get_session_store()

    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found.")

    session = sessions[session_id]

    try:
        result = await answer_evaluator.evaluate_full_interview(
            session_id=session_id,
            role=session["role"],
            job_description=session["job_description"],
            answers=request.answers,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")

    return result


@router.post("/{session_id}/follow-up", response_model=FollowUpResponse)
async def get_follow_up(session_id: str, request: FollowUpRequest):
    """Get a follow-up question based on the user's answer."""
    sessions = get_session_store()

    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found.")

    try:
        result = await answer_evaluator.get_follow_up(
            question_text=request.question_text,
            user_answer=request.user_answer,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Follow-up generation failed: {str(e)}")

    return result
