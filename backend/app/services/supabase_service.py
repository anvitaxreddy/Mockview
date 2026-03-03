from supabase import create_client, Client
from app.config import get_settings

_client: Client | None = None


def get_supabase() -> Client:
    global _client
    if _client is None:
        settings = get_settings()
        _client = create_client(settings.supabase_url, settings.supabase_service_role_key)
    return _client


def save_session(
    session_id: str,
    user_id: str,
    role: str,
    job_description: str,
    qualifications: str,
    resume_text: str,
) -> None:
    get_supabase().table("interview_sessions").insert({
        "id": session_id,
        "user_id": user_id,
        "role": role,
        "job_description": job_description,
        "qualifications": qualifications,
        "resume_text": resume_text,
        "status": "in_progress",
    }).execute()


def save_evaluation(
    session_id: str,
    user_id: str,
    overall_score: int,
    per_question: list,
    summary: dict,
) -> None:
    get_supabase().table("interview_evaluations").insert({
        "session_id": session_id,
        "user_id": user_id,
        "overall_score": overall_score,
        "per_question": per_question,
        "summary": summary,
    }).execute()

    get_supabase().table("interview_sessions").update({
        "status": "evaluated",
    }).eq("id", session_id).execute()


def get_user_sessions(user_id: str) -> list:
    res = (
        get_supabase()
        .table("interview_sessions")
        .select("id, role, created_at, status, interview_evaluations(overall_score, summary, created_at)")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return res.data
