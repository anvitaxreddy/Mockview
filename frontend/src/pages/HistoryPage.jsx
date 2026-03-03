import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  ChevronRight,
  ChevronDown,
  Trophy,
  Calendar,
  LogOut,
  Plus,
  ChevronUp,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getHistory } from "../services/api";

function ScoreRing({ score, size = 64 }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color =
    score >= 90 ? "#22c55e" : score >= 75 ? "#00D4AA" : score >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#ffffff10" strokeWidth={6} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={6}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="50%" textAnchor="middle" dy="0.35em" fill="white" fontSize={size / 5} fontWeight="600">
        {score}
      </text>
    </svg>
  );
}

function SessionCard({ session }) {
  const [expanded, setExpanded] = useState(false);
  const evaluation = session.interview_evaluations?.[0];
  const date = new Date(session.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/3 transition-colors"
      >
        {evaluation ? (
          <ScoreRing score={evaluation.overall_score} size={56} />
        ) : (
          <div className="w-14 h-14 rounded-full bg-surface-light flex items-center justify-center text-text-muted text-xs">
            N/A
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-text-primary truncate">{session.role}</p>
          <div className="flex items-center gap-2 mt-1">
            <Calendar className="w-3 h-3 text-text-muted" />
            <span className="text-xs text-text-muted">{date}</span>
            {session.status === "evaluated" && (
              <span className="px-2 py-0.5 rounded-md bg-accent/15 text-accent text-xs font-medium">
                Evaluated
              </span>
            )}
          </div>
        </div>

        {expanded ? (
          <ChevronUp className="w-4 h-4 text-text-muted flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-text-muted flex-shrink-0" />
        )}
      </button>

      <AnimatePresence>
        {expanded && evaluation && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-white/5 pt-4 space-y-4">
              {/* Summary */}
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Overall Feedback</p>
                <p className="text-sm text-text-secondary">{evaluation.summary?.overall_feedback}</p>
              </div>

              {/* Strengths & Improvements */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Strengths</p>
                  <ul className="space-y-1">
                    {evaluation.summary?.strengths?.map((s, i) => (
                      <li key={i} className="text-xs text-text-secondary flex gap-2">
                        <span className="text-accent mt-0.5">✓</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Improvements</p>
                  <ul className="space-y-1">
                    {evaluation.summary?.improvements?.map((s, i) => (
                      <li key={i} className="text-xs text-text-secondary flex gap-2">
                        <span className="text-primary-light mt-0.5">→</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Per-question scores */}
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Questions</p>
                <div className="space-y-2">
                  {evaluation.per_question?.map((q, i) => (
                    <div key={i} className="flex items-center gap-3 bg-surface-light rounded-xl px-4 py-3">
                      <span className="text-xs text-text-muted w-6">Q{i + 1}</span>
                      <p className="flex-1 text-xs text-text-secondary truncate">{q.question_text}</p>
                      <span
                        className={`text-xs font-semibold ${
                          q.score >= 75
                            ? "text-accent"
                            : q.score >= 50
                            ? "text-yellow-400"
                            : "text-danger"
                        }`}
                      >
                        {q.score}/100
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HistoryPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getHistory()
      .then((data) => setSessions(data.sessions || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-surface-dark">
      {/* Header */}
      <div className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Target className="w-4 h-4 text-white" />
          </div>
          <span className="font-display text-sm font-medium">Mockview</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-text-muted">{user?.email}</span>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-semibold">My Interviews</h1>
            <p className="text-sm text-text-muted mt-1">
              {sessions.length} session{sessions.length !== 1 ? "s" : ""} completed
            </p>
          </div>
          <button
            onClick={() => navigate("/setup")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm font-medium hover:opacity-90 transition-all"
          >
            <Plus className="w-4 h-4" />
            New Interview
          </button>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="glass rounded-2xl p-6 text-center text-danger text-sm">{error}</div>
        )}

        {!loading && !error && sessions.length === 0 && (
          <div className="glass rounded-2xl p-12 text-center">
            <Trophy className="w-10 h-10 text-text-muted mx-auto mb-4" />
            <p className="text-text-secondary mb-2">No interviews yet</p>
            <p className="text-sm text-text-muted mb-6">Complete your first mock interview to see results here.</p>
            <button
              onClick={() => navigate("/setup")}
              className="px-6 py-3 rounded-xl bg-gradient-primary text-white text-sm font-medium hover:opacity-90 transition-all"
            >
              Start Interview
            </button>
          </div>
        )}

        <div className="space-y-4">
          {sessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      </div>
    </div>
  );
}
