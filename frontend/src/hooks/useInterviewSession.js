import { useCallback, useState } from "react";
import { useInterview } from "../context/InterviewContext";
import { transcribeAudio, getFollowUp, evaluateInterview } from "../services/api";

export function useInterviewSession() {
  const { state, dispatch } = useInterview();
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");

  const handleAnswerSubmit = useCallback(
    async (audioBlob) => {
      const question = state.questions[state.currentQuestionIndex];
      if (!question) return;

      setIsTranscribing(true);

      try {
        // Transcribe the audio
        const transcription = await transcribeAudio(audioBlob);
        const answerText = transcription.transcription;
        setCurrentTranscript(answerText);

        // Save the answer
        dispatch({
          type: "SAVE_ANSWER",
          payload: {
            questionId: question.id,
            questionText: question.question,
            questionType: question.type,
            userAnswer: answerText,
            audioBlob,
          },
        });

        setIsTranscribing(false);
        return answerText;
      } catch (err) {
        console.error("Transcription error:", err);
        setIsTranscribing(false);
        return null;
      }
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
    isTranscribing,
    isEvaluating,
    currentTranscript,
    handleAnswerSubmit,
    checkFollowUp,
    moveToNextQuestion,
    submitForEvaluation,
  };
}
