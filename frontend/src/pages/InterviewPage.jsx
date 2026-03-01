import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  Square,
  SkipForward,
  Loader2,
  Volume2,
  Target,
  Clock,
  MessageSquare,
} from "lucide-react";
import { useInterview } from "../context/InterviewContext";
import { useVoiceRecorder } from "../hooks/useVoiceRecorder";
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis";
import { useInterviewSession } from "../hooks/useInterviewSession";

export default function InterviewPage() {
  const navigate = useNavigate();
  const { state, dispatch } = useInterview();
  const {
    isRecording,
    transcript: voiceTranscript,
    interimTranscript,
    duration,
    error: recError,
    startRecording,
    stopRecording,
    resetRecording,
  } = useVoiceRecorder();
  const { isSpeaking, speak, stop: stopSpeaking } = useSpeechSynthesis();
  const {
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    currentTranscript,
    saveAnswer,
    moveToNextQuestion,
    submitForEvaluation,
    isEvaluating,
  } = useInterviewSession();

  const [phase, setPhase] = useState("intro"); // intro | asking | listening | processing | transition
  const [interviewStarted, setInterviewStarted] = useState(false);

  // Redirect if no questions
  useEffect(() => {
    if (!state.questions || state.questions.length === 0) {
      navigate("/setup");
    }
  }, [state.questions, navigate]);

  // Start the interview with an intro
  const startInterview = useCallback(() => {
    setInterviewStarted(true);
    dispatch({ type: "START_INTERVIEW" });

    const intro = `Hello! Welcome to your mock interview for the ${state.role} position. I'll be asking you ${totalQuestions} questions today. Take your time with each answer, and try to be as specific as possible. Let's begin.`;

    speak(intro, () => {
      setPhase("asking");
      if (state.questions[0]) {
        speak(state.questions[0].question, () => {
          setPhase("listening");
        });
      }
    });
  }, [state.role, totalQuestions, state.questions, speak, dispatch]);

  // When transitioning to next question, speak it
  useEffect(() => {
    if (phase === "transition" && currentQuestion) {
      const transitionPhrases = [
        "Great, let's move on to the next question.",
        "Thank you for that answer. Here's the next one.",
        "Alright, moving on.",
        "Good. Next question.",
        "Thanks. Let me ask you this.",
      ];
      const phrase = transitionPhrases[currentQuestionIndex % transitionPhrases.length];

      speak(`${phrase} ${currentQuestion.question}`, () => {
        setPhase("listening");
      });
      setPhase("asking");
    }
  }, [phase, currentQuestion, currentQuestionIndex, speak]);

  const handleStartRecording = () => {
    stopSpeaking();
    setPhase("listening");
    startRecording();
  };

  const handleStopRecording = () => {
    const finalText = stopRecording(); // Gets transcript from browser STT
    setPhase("processing");

    // Small delay to let final transcript settle
    setTimeout(() => {
      const answerText = finalText || voiceTranscript || "[No speech detected]";
      saveAnswer(answerText);

      // Check if last question
      if (currentQuestionIndex >= totalQuestions - 1) {
        speak(
          "That was the last question. Thank you for completing this interview. Let me evaluate your responses now.",
          () => {
            handleFinishInterview();
          }
        );
      } else {
        moveToNextQuestion();
        resetRecording();
        setPhase("transition");
      }
    }, 500);
  };

  const handleSkipQuestion = () => {
    stopSpeaking();
    if (isRecording) stopRecording();
    resetRecording();

    dispatch({
      type: "SAVE_ANSWER",
      payload: {
        questionId: currentQuestion?.id,
        questionText: currentQuestion?.question,
        questionType: currentQuestion?.type,
        userAnswer: "[Skipped]",
      },
    });

    if (currentQuestionIndex >= totalQuestions - 1) {
      handleFinishInterview();
    } else {
      moveToNextQuestion();
      setPhase("transition");
    }
  };

  const handleFinishInterview = async () => {
    const result = await submitForEvaluation();
    if (result) {
      navigate("/results");
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Build the live display text
  const liveText =
    isRecording
      ? (voiceTranscript ? voiceTranscript + " " : "") + (interimTranscript || "")
      : currentTranscript || voiceTranscript;

  if (!state.questions || state.questions.length === 0) return null;

  return (
    <div className="min-h-screen bg-surface-dark relative overflow-hidden flex flex-col">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className={`absolute top-[20%] left-[30%] w-[400px] h-[400px] rounded-full blur-[120px] transition-colors duration-1000 ${
            isRecording
              ? "bg-danger/10"
              : isSpeaking
              ? "bg-primary/10"
              : "bg-primary/5"
          }`}
        />
      </div>

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-8 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Target className="w-4 h-4 text-white" />
          </div>
          <span className="font-display text-sm font-medium">Mockview</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <MessageSquare className="w-4 h-4" />
            <span>
              {currentQuestionIndex + 1} / {totalQuestions}
            </span>
          </div>

          {isRecording && (
            <div className="flex items-center gap-2 text-sm text-danger">
              <Clock className="w-4 h-4" />
              <span className="font-mono">{formatTime(duration)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main interview area */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 relative z-10">
        {/* Evaluation loading overlay */}
        <AnimatePresence>
          {isEvaluating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-surface-dark/90 backdrop-blur-sm"
            >
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                <p className="text-lg font-medium">Evaluating your interview...</p>
                <p className="text-sm text-text-muted mt-2">
                  AI is reviewing each answer carefully
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pre-interview screen */}
        {!interviewStarted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-lg"
          >
            <div className="w-24 h-24 rounded-3xl bg-primary/15 flex items-center justify-center mx-auto mb-8 animate-glow">
              <Mic className="w-10 h-10 text-primary-light" />
            </div>
            <h1 className="font-display text-3xl font-semibold mb-4">
              Ready for your interview?
            </h1>
            <p className="text-text-secondary mb-3">
              <strong className="text-text-primary">{state.role}</strong> •{" "}
              {totalQuestions} questions • ~{totalQuestions * 3} min
            </p>
            <p className="text-sm text-text-muted mb-8">
              Make sure your microphone is working. The AI interviewer will
              speak each question aloud, then you respond by voice.
            </p>
            <button
              onClick={startInterview}
              className="px-10 py-4 rounded-2xl bg-gradient-primary text-white font-semibold text-lg hover:shadow-[0_0_40px_rgba(108,60,225,0.4)] transition-all"
            >
              Begin Interview
            </button>
          </motion.div>
        )}

        {/* Active interview */}
        {interviewStarted && (
          <div className="w-full max-w-2xl">
            {/* AI Avatar */}
            <div className="flex flex-col items-center mb-10">
              <motion.div
                animate={{
                  scale: isSpeaking ? [1, 1.05, 1] : 1,
                  boxShadow: isSpeaking
                    ? [
                        "0 0 0px rgba(108,60,225,0.3)",
                        "0 0 40px rgba(108,60,225,0.5)",
                        "0 0 0px rgba(108,60,225,0.3)",
                      ]
                    : "0 0 0px rgba(108,60,225,0)",
                }}
                transition={{
                  duration: 1.5,
                  repeat: isSpeaking ? Infinity : 0,
                }}
                className="w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center mb-5"
              >
                {isSpeaking ? (
                  <Volume2 className="w-9 h-9 text-white" />
                ) : (
                  <Target className="w-9 h-9 text-white" />
                )}
              </motion.div>

              <span className="text-sm text-text-muted mb-2">
                {isSpeaking
                  ? "AI Interviewer is speaking..."
                  : isRecording
                  ? "Listening to your answer..."
                  : phase === "processing"
                  ? "Processing..."
                  : "Waiting for your response"}
              </span>

              {/* Waveform */}
              {(isSpeaking || isRecording) && (
                <div className="flex items-end gap-1 h-8 mt-2">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-1 rounded-full ${
                        isRecording ? "bg-danger" : "bg-primary-light"
                      } waveform-bar`}
                      style={{
                        animationDelay: `${i * 0.05}s`,
                        animationDuration: `${0.8 + Math.random() * 0.8}s`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Current question */}
            <AnimatePresence mode="wait">
              {currentQuestion && (
                <motion.div
                  key={currentQuestion.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="glass rounded-2xl p-6 mb-8"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-2.5 py-1 rounded-lg bg-primary/15 text-primary-light text-xs font-medium uppercase">
                      {currentQuestion.type.replace("_", " ")}
                    </span>
                    <span className="text-xs text-text-muted">
                      Question {currentQuestionIndex + 1}
                    </span>
                  </div>
                  <p className="text-lg text-text-primary leading-relaxed">
                    {currentQuestion.question}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Live transcript */}
            {liveText && (
              <div className="glass-light rounded-xl p-4 mb-8 max-h-32 overflow-y-auto">
                <span className="text-xs text-text-muted block mb-1">
                  {isRecording ? "You're saying:" : "Your answer:"}
                </span>
                <p className="text-sm text-text-secondary">
                  {liveText}
                  {isRecording && interimTranscript && (
                    <span className="text-text-muted opacity-60">
                      {" "}{interimTranscript}
                    </span>
                  )}
                </p>
              </div>
            )}

            {/* Error */}
            {recError && (
              <div className="mb-6 p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">
                {recError}
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              {!isRecording &&
                !isSpeaking &&
                phase === "listening" && (
                  <button
                    onClick={handleStartRecording}
                    className="w-16 h-16 rounded-2xl bg-danger flex items-center justify-center hover:bg-danger/80 transition-all hover:shadow-[0_0_30px_rgba(255,107,107,0.3)]"
                  >
                    <Mic className="w-7 h-7 text-white" />
                  </button>
                )}

              {isRecording && (
                <button
                  onClick={handleStopRecording}
                  className="w-16 h-16 rounded-2xl bg-danger flex items-center justify-center animate-pulse hover:animate-none transition-all"
                >
                  <Square className="w-6 h-6 text-white" />
                </button>
              )}

              {!isSpeaking && !isRecording && phase !== "processing" && (
                <button
                  onClick={handleSkipQuestion}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-surface-light text-text-secondary text-sm hover:text-text-primary transition-colors"
                >
                  <SkipForward className="w-4 h-4" />
                  Skip
                </button>
              )}
            </div>

            {/* Recording duration */}
            {isRecording && (
              <p className="text-center text-sm text-danger mt-4 font-mono">
                Recording: {formatTime(duration)}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Progress bar */}
      {interviewStarted && (
        <div className="relative z-10 h-1 bg-surface-light">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent"
            initial={{ width: 0 }}
            animate={{
              width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`,
            }}
            transition={{ duration: 0.5 }}
          />
        </div>
      )}
    </div>
  );
}
