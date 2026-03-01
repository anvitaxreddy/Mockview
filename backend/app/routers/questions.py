from fastapi import APIRouter, HTTPException
from app.services.question_generator import question_generator
from app.models.schemas import QuestionsResponse
from app.routers.interview import get_session_store

router = APIRouter(prefix="/api/interview", tags=["questions"])


@router.get("/{session_id}/questions", response_model=QuestionsResponse)
async def generate_questions(session_id: str, num_questions: int = 10):
    """Generate tailored interview questions for the session."""
    sessions = get_session_store()

    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found.")

    session = sessions[session_id]

    # Return cached questions if already generated
    if session["questions"] is not None:
        return session["questions"]

    try:
        result = await question_generator.generate_questions(
            session_id=session_id,
            role=session["role"],
            job_description=session["job_description"],
            qualifications=session["qualifications"],
            resume_text=session["resume_text"],
            num_questions=num_questions,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Question generation failed: {str(e)}")

    # Cache in session
    session["questions"] = result
    return result
