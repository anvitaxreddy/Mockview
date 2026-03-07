import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Target,
  ChevronDown,
  ChevronUp,
  Trophy,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from "lucide-react";
import { useInterview } from "../context/InterviewContext";

function ScoreRing({ score, size = 140 }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s) => {
    if (s >= 90) return "#00D4AA";
    if (s >= 75) return "#00D4AA";
    if (s >= 60) return "#FFB347";
    if (s >= 40) return "#FF6B6B";
    return "#FF6B6B";
  };

  const getLabel = (s) => {
    if (s >= 90) return "Exceptional";
    if (s >= 75) return "Strong";
    if (s >= 60) return "Average";
    if (s >= 40) return "Below Avg";
    return "Needs Work";
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={8}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor(score)}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="font-display text-4xl font-bold"
          style={{ color: getColor(score) }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {score}
        </motion.span>
        <span className="text-xs text-text-muted">{getLabel(score)}</span>
      </div>
    </div>
  );
}

function DimensionBar({ label, score, max = 25, delay = 0 }) {
  const pct = (score / max) * 100;
  const color =
    pct >= 80 ? "from-accent to-accent-light" :
    pct >= 60 ? "from-primary to-primary-light" :
    "from-warning to-danger";

  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-text-secondary">{label}</span>
        <span className="text-text-primary font-mono text-xs">
          {score}/{max}
        </span>
      </div>
      <div className="h-2 bg-surface-dark rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function QuestionCard({ evaluation, index }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getScoreColor = (s) => {
    if (s >= 75) return "text-accent";
    if (s >= 60) return "text-primary-light";
    if (s >= 40) return "text-warning";
    return "text-danger";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glass rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-4">
          <span className="font-mono text-sm text-text-muted w-6">
            Q{index + 1}
          </span>
          <p className="text-sm text-text-primary text-left line-clamp-1 max-w-md">
            {evaluation.question_text}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className={`font-display text-2xl font-bold ${getScoreColor(evaluation.score)}`}>
            {evaluation.score}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-text-muted" />
          ) : (
            <ChevronDown className="w-4 h-4 text-text-muted" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="px-6 pb-6 border-t border-white/5 pt-5"
        >
          {/* Score breakdown */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <DimensionBar label="Relevance" score={evaluation.breakdown.relevance} delay={0} />
            <DimensionBar label="Depth" score={evaluation.breakdown.depth} delay={0.1} />
            <DimensionBar label="Communication" score={evaluation.breakdown.communication} delay={0.2} />
            <DimensionBar label="Technical" score={evaluation.breakdown.technical_accuracy} delay={0.3} />
          </div>

          {/* Your answer */}
          <div className="mb-5">
            <h4 className="text-xs uppercase tracking-wider text-text-muted mb-2">Your Answer</h4>
            <p className="text-sm text-text-secondary bg-surface-dark/50 rounded-xl p-4 leading-relaxed">
              {evaluation.user_answer || "[No answer provided]"}
            </p>
          </div>

          {/* Feedback */}
          <div className="mb-5">
            <h4 className="text-xs uppercase tracking-wider text-text-muted mb-2 flex items-center gap-1.5">
              <AlertCircle className="w-3 h-3" /> Feedback
            </h4>
            <p className="text-sm text-text-primary leading-relaxed">
              {evaluation.feedback}
            </p>
          </div>

          {/* Missing points */}
          {evaluation.key_missing_points?.length > 0 && (
            <div className="mb-5">
              <h4 className="text-xs uppercase tracking-wider text-text-muted mb-2 flex items-center gap-1.5">
                <XCircle className="w-3 h-3" /> Key Missing Points
              </h4>
              <div className="space-y-1.5">
                {evaluation.key_missing_points.map((point, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                    <span className="text-danger mt-0.5">•</span>
                    {point}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggested answer */}
          <div>
            <h4 className="text-xs uppercase tracking-wider text-text-muted mb-2 flex items-center gap-1.5">
              <Lightbulb className="w-3 h-3 text-accent" /> Stronger Answer
            </h4>
            <p className="text-sm text-accent/80 bg-accent/5 border border-accent/10 rounded-xl p-4 leading-relaxed">
              {evaluation.suggested_answer}
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function ResultsPage() {
  const navigate = useNavigate();
  const { state, dispatch } = useInterview();
  const evaluation = state.evaluation;

  useEffect(() => {
    if (!evaluation) {
      navigate("/setup");
    }
  }, [evaluation, navigate]);

  if (!evaluation) return null;

  return (
    <div className="min-h-screen bg-surface-dark">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] rounded-full bg-accent/5 blur-[100px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-6xl mx-auto">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center">
            <Target className="w-4 h-4 text-white" />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">
            Mock<span className="text-primary-light">view</span>
          </span>
        </button>
        <button
          onClick={() => {
            dispatch({ type: "RESET" });
            navigate("/setup");
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary-light text-sm font-medium hover:bg-primary/20 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          New Interview
        </button>
      </nav>

      <main className="relative z-10 max-w-4xl mx-auto px-8 pb-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-4xl font-bold mb-2">Interview Results</h1>
          <p className="text-text-secondary">{state.role} • {evaluation.per_question?.length} questions</p>
        </motion.div>

        {/* Overall score card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-3xl p-8 md:p-10 mb-10"
        >
          <div className="flex flex-col md:flex-row items-center gap-10">
            <ScoreRing score={evaluation.overall_score} />

            <div className="flex-1">
              <h2 className="font-display text-2xl font-semibold mb-4">
                {evaluation.summary?.overall_feedback?.split(".")[0] || "Interview Complete"}.
              </h2>
              <p className="text-text-secondary leading-relaxed text-sm mb-6">
                {evaluation.summary?.overall_feedback}
              </p>

              {/* Strengths & Improvements */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-medium text-accent mb-3">
                    <CheckCircle2 className="w-4 h-4" /> Strengths
                  </h3>
                  <div className="space-y-2">
                    {evaluation.summary?.strengths?.map((s, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                        <span className="text-accent mt-0.5 flex-shrink-0">✓</span>
                        {s}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="flex items-center gap-2 text-sm font-medium text-warning mb-3">
                    <TrendingUp className="w-4 h-4" /> Areas to Improve
                  </h3>
                  <div className="space-y-2">
                    {evaluation.summary?.improvements?.map((imp, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                        <span className="text-warning mt-0.5 flex-shrink-0">→</span>
                        {imp}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Per-question breakdown */}
        <h2 className="font-display text-2xl font-semibold mb-6 flex items-center gap-3">
          <Trophy className="w-6 h-6 text-primary-light" />
          Question Breakdown
        </h2>

        <div className="space-y-4">
          {evaluation.per_question?.map((q, i) => (
            <QuestionCard key={q.question_id} evaluation={q} index={i} />
          ))}
        </div>

        {/* Try again CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-16"
        >
          <p className="text-text-muted mb-4">Practice makes perfect.</p>
          <button
            onClick={() => {
              dispatch({ type: "RESET" });
              navigate("/setup");
            }}
            className="group px-8 py-4 rounded-2xl bg-gradient-primary text-white font-semibold inline-flex items-center gap-3 hover:shadow-[0_0_40px_rgba(108,60,225,0.4)] transition-all"
          >
            Start Another Interview
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </main>
    </div>
  );
}
