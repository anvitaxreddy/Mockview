from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum
import uuid


# ─── Enums ───────────────────────────────────────────────

class QuestionType(str, Enum):
    BEHAVIORAL = "behavioral"
    SITUATIONAL = "situational"
    TECHNICAL = "technical"
    ROLE_SPECIFIC = "role_specific"
    CLOSING = "closing"


class Difficulty(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


# ─── Setup ───────────────────────────────────────────────

class InterviewSetupRequest(BaseModel):
    role: str = Field(..., min_length=2, max_length=200, description="Target job role")
    job_description: str = Field(..., min_length=20, description="Full job description")
    qualifications: str = Field(..., min_length=10, description="Required qualifications")
    resume_text: Optional[str] = Field(None, description="Parsed resume text (if sent as text)")


class InterviewSetupResponse(BaseModel):
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    parsed_resume: str
    question_count: int
    message: str


# ─── Questions ───────────────────────────────────────────

class InterviewQuestion(BaseModel):
    id: str
    question: str
    type: QuestionType
    difficulty: Difficulty
    what_it_tests: str


class QuestionsResponse(BaseModel):
    session_id: str
    questions: list[InterviewQuestion]
    total_count: int
    estimated_duration_minutes: int


# ─── Transcription ───────────────────────────────────────

class TranscriptionResponse(BaseModel):
    transcription: str
    confidence: float


# ─── Follow-up ───────────────────────────────────────────

class FollowUpRequest(BaseModel):
    question_id: str
    question_text: str
    user_answer: str


class FollowUpResponse(BaseModel):
    follow_up_question: Optional[str] = None
    should_move_on: bool = True


# ─── Evaluation ──────────────────────────────────────────

class AnswerEntry(BaseModel):
    question_id: str
    question_text: str
    question_type: str
    user_answer: str


class EvaluateRequest(BaseModel):
    session_id: str
    role: str
    job_description: str
    answers: list[AnswerEntry]


class ScoreBreakdown(BaseModel):
    relevance: int = Field(..., ge=0, le=25)
    depth: int = Field(..., ge=0, le=25)
    communication: int = Field(..., ge=0, le=25)
    technical_accuracy: int = Field(..., ge=0, le=25)


class QuestionEvaluation(BaseModel):
    question_id: str
    question_text: str
    user_answer: str
    score: int = Field(..., ge=0, le=100)
    breakdown: ScoreBreakdown
    feedback: str
    suggested_answer: str
    key_missing_points: list[str]


class EvaluationSummary(BaseModel):
    strengths: list[str]
    improvements: list[str]
    overall_feedback: str


class EvaluateResponse(BaseModel):
    session_id: str
    overall_score: int = Field(..., ge=0, le=100)
    per_question: list[QuestionEvaluation]
    summary: EvaluationSummary
