from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from app.services.resume_parser import resume_parser
from app.services.supabase_service import save_session
from app.middleware.auth import get_current_user
from app.models.schemas import InterviewSetupResponse
import uuid

router = APIRouter(prefix="/api/interview", tags=["interview"])

# In-memory store for active session state (questions, answers during interview)
sessions: dict = {}


@router.post("/setup", response_model=InterviewSetupResponse)
async def setup_interview(
    role: str = Form(...),
    job_description: str = Form(...),
    qualifications: str = Form(...),
    resume: UploadFile = File(...),
    user_id: str = Depends(get_current_user),
):
    """Set up a new interview session: parse resume and prepare for question generation."""

    if not resume.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF resumes are supported.")

    file_bytes = await resume.read()
    try:
        resume_text = await resume_parser.parse_pdf(file_bytes)
        resume_text = resume_parser.clean_resume_text(resume_text)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    session_id = str(uuid.uuid4())
    sessions[session_id] = {
        "role": role,
        "job_description": job_description,
        "qualifications": qualifications,
        "resume_text": resume_text,
        "questions": None,
        "answers": [],
        "user_id": user_id,
    }

    # Persist to Supabase
    save_session(
        session_id=session_id,
        user_id=user_id,
        role=role,
        job_description=job_description,
        qualifications=qualifications,
        resume_text=resume_text,
    )

    return InterviewSetupResponse(
        session_id=session_id,
        parsed_resume=resume_text[:500] + "..." if len(resume_text) > 500 else resume_text,
        question_count=6,
        message="Interview session created. Ready to generate questions.",
    )


@router.get("/session/{session_id}")
async def get_session(session_id: str, user_id: str = Depends(get_current_user)):
    """Get session details."""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found.")
    session = sessions[session_id]
    return {
        "session_id": session_id,
        "role": session["role"],
        "has_questions": session["questions"] is not None,
        "answer_count": len(session["answers"]),
    }


def get_session_store():
    return sessions
