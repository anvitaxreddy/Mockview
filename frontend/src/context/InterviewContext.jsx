import { createContext, useContext, useReducer } from "react";

const InterviewContext = createContext(null);

const initialState = {
  // Setup
  sessionId: null,
  role: "",
  jobDescription: "",
  qualifications: "",
  resumeFile: null,
  parsedResume: "",

  // Questions
  questions: [],
  currentQuestionIndex: 0,

  // Answers
  answers: [], // { questionId, questionText, questionType, userAnswer, audioBlob }

  // Interview state
  interviewStatus: "idle", // idle | generating | ready | in-progress | completed | evaluating
  isRecording: false,
  isSpeaking: false,

  // Results
  evaluation: null,
};

function interviewReducer(state, action) {
  switch (action.type) {
    case "SET_SETUP":
      return { ...state, ...action.payload };

    case "SET_SESSION":
      return { ...state, sessionId: action.payload.sessionId, parsedResume: action.payload.parsedResume };

    case "SET_QUESTIONS":
      return { ...state, questions: action.payload, interviewStatus: "ready" };

    case "START_INTERVIEW":
      return { ...state, interviewStatus: "in-progress", currentQuestionIndex: 0 };

    case "SET_RECORDING":
      return { ...state, isRecording: action.payload };

    case "SET_SPEAKING":
      return { ...state, isSpeaking: action.payload };

    case "SAVE_ANSWER":
      return {
        ...state,
        answers: [...state.answers, action.payload],
      };

    case "NEXT_QUESTION":
      const nextIndex = state.currentQuestionIndex + 1;
      if (nextIndex >= state.questions.length) {
        return { ...state, interviewStatus: "completed" };
      }
      return { ...state, currentQuestionIndex: nextIndex };

    case "SET_STATUS":
      return { ...state, interviewStatus: action.payload };

    case "SET_EVALUATION":
      return { ...state, evaluation: action.payload, interviewStatus: "evaluated" };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}

export function InterviewProvider({ children }) {
  const [state, dispatch] = useReducer(interviewReducer, initialState);

  return (
    <InterviewContext.Provider value={{ state, dispatch }}>
      {children}
    </InterviewContext.Provider>
  );
}

export function useInterview() {
  const context = useContext(InterviewContext);
  if (!context) {
    throw new Error("useInterview must be used within InterviewProvider");
  }
  return context;
}
