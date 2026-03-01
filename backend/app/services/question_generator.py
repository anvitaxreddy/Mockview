from app.services.claude_service import claude_service
from app.models.prompts import QUESTION_GENERATION_PROMPT
from app.models.schemas import InterviewQuestion, QuestionsResponse


class QuestionGenerator:
    async def generate_questions(
        self,
        session_id: str,
        role: str,
        job_description: str,
        qualifications: str,
        resume_text: str,
        num_questions: int = 10,
    ) -> QuestionsResponse:
        """Generate tailored interview questions using Claude."""

        prompt = QUESTION_GENERATION_PROMPT.format(
            role=role,
            job_description=job_description,
            qualifications=qualifications,
            resume_text=resume_text,
            num_questions=num_questions,
        )

        raw_questions = await claude_service.generate_json(prompt)

        questions = []
        for q in raw_questions:
            questions.append(
                InterviewQuestion(
                    id=q["id"],
                    question=q["question"],
                    type=q["type"],
                    difficulty=q["difficulty"],
                    what_it_tests=q["what_it_tests"],
                )
            )

        # Estimate ~3 minutes per question
        estimated_duration = len(questions) * 3

        return QuestionsResponse(
            session_id=session_id,
            questions=questions,
            total_count=len(questions),
            estimated_duration_minutes=estimated_duration,
        )


question_generator = QuestionGenerator()
