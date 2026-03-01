import { useCallback, useState } from "react";
import { useInterview } from "../context/InterviewContext";
import { getFollowUp, evaluateInterview } from "../services/api";

export function useInterviewSession() {
  const { state, dispatch } = useInterview();
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");

  // Save answer directly from browser speech recognition (no backend call!)
  const saveAnswer = useCallback(
    (transcriptText) => {
      const question = state.questions[state.currentQuestionIndex];
      if (!question) return;

      setCurrentTranscript(transcriptText);

      dispatch({
        type: "SAVE_ANSWER",
        payload: {
          questionId: question.id,
          questionText: question.question,
          questionType: question.type,
          userAnswer: transcriptText,
        },
      });

      return transcriptText;
    },
    [state.questions, state.currentQuestionIndex, dispatch]
  );

  const checkFollowUp = useCallback(
    async (questionText, userAnswer) => {
      try {
        const result = await getFollowUp(
          state.sessionId,
          state.questions[state.currentQuestionIndex]?.id,
          questionText,
          userAnswer
        );
        return result;
      } catch {
        return { follow_up_question: null, should_move_on: true };
      }
    },
    [state.sessionId, state.questions, state.currentQuestionIndex]
  );

  const moveToNextQuestion = useCallback(() => {
    dispatch({ type: "NEXT_QUESTION" });
    setCurrentTranscript("");
  }, [dispatch]);

  const submitForEvaluation = useCallback(async () => {
    setIsEvaluating(true);
    dispatch({ type: "SET_STATUS", payload: "evaluating" });

    try {
      const result = await evaluateInterview(
        state.sessionId,
        state.role,
        state.jobDescription,
        state.answers
      );
      dispatch({ type: "SET_EVALUATION", payload: result });
      setIsEvaluating(false);
      return result;
    } catch (err) {
      console.error("Evaluation error:", err);
      setIsEvaluating(false);
      return null;
    }
  }, [state.sessionId, state.role, state.jobDescription, state.answers, dispatch]);

  return {
    currentQuestion: state.questions[state.currentQuestionIndex],
    currentQuestionIndex: state.currentQuestionIndex,
    totalQuestions: state.questions.length,
    isEvaluating,
    currentTranscript,
    saveAnswer,
    checkFollowUp,
    moveToNextQuestion,
    submitForEvaluation,
  };
}
