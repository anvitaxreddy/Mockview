import axios from "axios";
import { supabase } from "../lib/supabase";

const API_BASE = import.meta.env.VITE_API_URL || "";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 120000,
});

// Attach Supabase JWT to every request
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// ─── Setup ──────────────────────────────────

export async function setupInterview(formData) {
  const res = await api.post("/api/interview/setup", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// ─── Questions ──────────────────────────────

export async function getQuestions(sessionId, numQuestions = 6) {
  const res = await api.get(`/api/interview/${sessionId}/questions`, {
    params: { num_questions: numQuestions },
  });
  return res.data;
}

// ─── Follow-up ──────────────────────────────

export async function getFollowUp(sessionId, questionId, questionText, userAnswer) {
  const res = await api.post(`/api/interview/${sessionId}/follow-up`, {
    question_id: questionId,
    question_text: questionText,
    user_answer: userAnswer,
  });
  return res.data;
}

// ─── Evaluation ─────────────────────────────

export async function evaluateInterview(sessionId, role, jobDescription, answers) {
  const res = await api.post(`/api/interview/${sessionId}/evaluate`, {
    session_id: sessionId,
    role,
    job_description: jobDescription,
    answers: answers.map((a) => ({
      question_id: a.questionId,
      question_text: a.questionText,
      question_type: a.questionType,
      user_answer: a.userAnswer,
    })),
  });
  return res.data;
}

// ─── History ────────────────────────────────

export async function getHistory() {
  const res = await api.get("/api/history");
  return res.data;
}

export default api;
