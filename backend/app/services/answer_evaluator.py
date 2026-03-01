from app.services.claude_service import claude_service
from app.models.prompts import ANSWER_EVALUATION_PROMPT, FOLLOW_UP_PROMPT, OVERALL_EVALUATION_PROMPT
from app.models.schemas import (
    AnswerEntry,
    EvaluateResponse,
    QuestionEvaluation,
    ScoreBreakdown,
    EvaluationSummary,
    FollowUpResponse,
)


class AnswerEvaluator:
    async def evaluate_single_answer(
        self,
        role: str,
        job_description: str,
        question_text: str,
        question_type: str,
        user_answer: str,
    ) -> dict:
        """Evaluate a single answer using Claude."""
        prompt = ANSWER_EVALUATION_PROMPT.format(
            role=role,
            job_description=job_description,
            question_text=question_text,
            question_type=question_type,
            user_answer=user_answer,
        )
        return await claude_service.generate_json(prompt)

    async def get_follow_up(
        self, question_text: str, user_answer: str
    ) -> FollowUpResponse:
        """Determine if a follow-up question should be asked."""
        prompt = FOLLOW_UP_PROMPT.format(
            question_text=question_text,
            user_answer=user_answer,
        )
        result = await claude_service.generate_json(prompt)
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
        """Evaluate all answers and produce a complete interview assessment."""

        per_question_results = []

        for answer in answers:
            eval_data = await self.evaluate_single_answer(
                role=role,
                job_description=job_description,
                question_text=answer.question_text,
                question_type=answer.question_type,
                user_answer=answer.user_answer,
            )

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

        # Calculate overall score
        if per_question_results:
            overall_score = round(
                sum(q.score for q in per_question_results) / len(per_question_results)
            )
        else:
            overall_score = 0

        # Generate overall summary
        scores_summary = "\n".join(
            f"- Q{i+1} ({r.question_id}): {r.score}/100 — {r.feedback[:80]}..."
            for i, r in enumerate(per_question_results)
        )

        summary_prompt = OVERALL_EVALUATION_PROMPT.format(
            role=role,
            scores_summary=scores_summary,
            average_score=overall_score,
        )
        summary_data = await claude_service.generate_json(summary_prompt)

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
