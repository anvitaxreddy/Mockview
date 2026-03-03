from app.services.gemini_service import gemini_service
from app.models.prompts import BATCH_EVALUATION_PROMPT, FOLLOW_UP_PROMPT
from app.models.schemas import (
    AnswerEntry,
    EvaluateResponse,
    QuestionEvaluation,
    ScoreBreakdown,
    EvaluationSummary,
    FollowUpResponse,
)


class AnswerEvaluator:
    async def get_follow_up(
        self, question_text: str, user_answer: str
    ) -> FollowUpResponse:
        """Determine if a follow-up question should be asked."""
        prompt = FOLLOW_UP_PROMPT.format(
            question_text=question_text,
            user_answer=user_answer,
        )
        result = await gemini_service.generate_json(prompt)
        return FollowUpResponse(
            follow_up_question=result.get("follow_up_question"),
            should_move_on=result.get("should_move_on", True),
        )

    async def evaluate_full_interview(
        self,
        session_id: str,
        role: str,
        job_description: str,
        answers: list[AnswerEntry],
    ) -> EvaluateResponse:
        """Evaluate all answers in a single Gemini call to stay within rate limits."""

        # Build the answers block for the batch prompt
        answers_block = "\n\n".join(
            f"Answer {i+1} (id={a.question_id}, type={a.question_type}):\n"
            f"Question: {a.question_text}\n"
            f"Candidate's answer: {a.user_answer}"
            for i, a in enumerate(answers)
        )

        prompt = BATCH_EVALUATION_PROMPT.format(
            role=role,
            job_description=job_description,
            answers_block=answers_block,
        )

        data = await gemini_service.generate_json(prompt)

        per_question_results = []
        for i, (answer, eval_data) in enumerate(zip(answers, data["evaluations"])):
            scores = eval_data["scores"]
            breakdown = ScoreBreakdown(
                relevance=scores["relevance"],
                depth=scores["depth"],
                communication=scores["communication"],
                technical_accuracy=scores["technical_accuracy"],
            )
            per_question_results.append(
                QuestionEvaluation(
                    question_id=answer.question_id,
                    question_text=answer.question_text,
                    user_answer=answer.user_answer,
                    score=eval_data["total_score"],
                    breakdown=breakdown,
                    feedback=eval_data["feedback"],
                    suggested_answer=eval_data["suggested_answer"],
                    key_missing_points=eval_data.get("key_missing_points", []),
                )
            )

        overall_score = round(
            sum(q.score for q in per_question_results) / len(per_question_results)
        ) if per_question_results else 0

        summary_data = data.get("summary", {})
        summary = EvaluationSummary(
            strengths=summary_data.get("strengths", []),
            improvements=summary_data.get("improvements", []),
            overall_feedback=summary_data.get("overall_feedback", ""),
        )

        return EvaluateResponse(
            session_id=session_id,
            overall_score=overall_score,
            per_question=per_question_results,
            summary=summary,
        )


answer_evaluator = AnswerEvaluator()
