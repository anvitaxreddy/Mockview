import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  FileText,
  Award,
  Upload,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Target,
  X,
  Sliders,
  Plus,
  Minus,
  Clock,
} from "lucide-react";
import { useInterview } from "../context/InterviewContext";
import { setupInterview, getQuestions } from "../services/api";
import { GLSLHills } from "../components/ui/glsl-hills";
import { GradientButton } from "../components/ui/gradient-button";

const steps = [
  { id: 1, label: "Role", icon: Briefcase },
  { id: 2, label: "Description", icon: FileText },
  { id: 3, label: "Qualifications", icon: Award },
  { id: 4, label: "Resume", icon: Upload },
  { id: 5, label: "Customize", icon: Sliders },
];

const DURATION_OPTIONS = [15, 30, 45, 60];

const QUESTION_TYPES = [
  { key: "intro", label: "Intro", description: "About yourself & background", min: 0, max: 3, color: "text-blue-400" },
  { key: "technical", label: "Technical", description: "Skills & problem-solving", min: 0, max: 6, color: "text-purple-400" },
  { key: "behavioral", label: "Behavioral", description: "Situations & past experiences", min: 0, max: 6, color: "text-emerald-400" },
  { key: "experience", label: "Experience", description: "Role-specific background", min: 0, max: 6, color: "text-amber-400" },
];

function Counter({ value, min, max, onChange, color }) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="w-8 h-8 rounded-lg bg-surface-light border border-white/5 flex items-center justify-center hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <span className={`w-6 text-center font-mono text-lg font-semibold ${color}`}>{value}</span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-8 h-8 rounded-lg bg-surface-light border border-white/5 flex items-center justify-center hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function SetupPage() {
  const navigate = useNavigate();
  const { dispatch } = useInterview();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    role: "",
    jobDescription: "",
    qualifications: "",
    resumeFile: null,
    questionConfig: {
      intro: 1,
      technical: 2,
      behavioral: 2,
      experience: 1,
      duration: 30,
    },
  });

  const update = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const updateQuestionConfig = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      questionConfig: { ...prev.questionConfig, [key]: value },
    }));
  };

  const totalQuestions =
    formData.questionConfig.intro +
    formData.questionConfig.technical +
    formData.questionConfig.behavioral +
    formData.questionConfig.experience;

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.role.trim().length >= 2;
      case 2: return formData.jobDescription.trim().length >= 20;
      case 3: return formData.qualifications.trim().length >= 10;
      case 4: return formData.resumeFile !== null;
      case 5: return totalQuestions >= 1;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      setLoadingMessage("Parsing your resume...");
      const fd = new FormData();
      fd.append("role", formData.role);
      fd.append("job_description", formData.jobDescription);
      fd.append("qualifications", formData.qualifications);
      fd.append("resume", formData.resumeFile);

      const setupResult = await setupInterview(fd);

      dispatch({
        type: "SET_SETUP",
        payload: {
          role: formData.role,
          jobDescription: formData.jobDescription,
          qualifications: formData.qualifications,
          resumeFile: formData.resumeFile,
        },
      });

      dispatch({
        type: "SET_SESSION",
        payload: {
          sessionId: setupResult.session_id,
          parsedResume: setupResult.parsed_resume,
        },
      });

      setLoadingMessage("AI is crafting your interview questions...");
      const questionsResult = await getQuestions(
        setupResult.session_id,
        totalQuestions,
        formData.questionConfig
      );

      dispatch({
        type: "SET_QUESTIONS",
        payload: questionsResult.questions,
      });

      navigate("/interview");
    } catch (err) {
      console.error("Setup error:", err);
      setError(
        err.response?.data?.detail ||
          "Something went wrong. Please check your API keys and try again."
      );
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 5) {
      handleSubmit();
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  return (
    <div className="min-h-screen bg-surface-dark relative overflow-hidden">
      {/* GLSLHills background */}
      <div className="absolute inset-0 pointer-events-none opacity-15">
        <GLSLHills width="100%" height="100%" />
      </div>
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#0f0f1a]/50 via-transparent to-[#0f0f1a]/50" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-5xl mx-auto">
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
      </nav>

      <main className="relative z-10 max-w-2xl mx-auto px-8 pt-8 pb-20">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  currentStep === step.id
                    ? "bg-primary text-white"
                    : currentStep > step.id
                    ? "bg-accent/20 text-accent"
                    : "bg-surface-light text-text-muted"
                }`}
              >
                {currentStep > step.id ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <step.icon className="w-4 h-4" />
                )}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`w-10 h-0.5 mx-1 rounded-full transition-all ${
                    currentStep > step.id ? "bg-accent/40" : "bg-surface-light"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Loading overlay */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-surface-dark/90 backdrop-blur-sm"
            >
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                <p className="text-lg text-text-primary font-medium">{loadingMessage}</p>
                <p className="text-sm text-text-muted mt-2">This may take 15-30 seconds...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form steps */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 1 && (
              <div>
                <h2 className="font-display text-3xl font-semibold mb-2">
                  What role are you interviewing for?
                </h2>
                <p className="text-text-secondary mb-8">
                  Enter the exact job title you're preparing for.
                </p>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => update("role", e.target.value)}
                  placeholder="e.g. Senior ML Engineer, Product Manager, SWE Intern..."
                  className="w-full px-5 py-4 rounded-xl bg-surface-light border border-white/5 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all text-lg"
                  autoFocus
                />
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <h2 className="font-display text-3xl font-semibold mb-2">
                  Paste the job description
                </h2>
                <p className="text-text-secondary mb-8">
                  Copy the full job description from the posting. The more detail, the better the questions.
                </p>
                <textarea
                  value={formData.jobDescription}
                  onChange={(e) => update("jobDescription", e.target.value)}
                  placeholder="Paste the full job description here..."
                  rows={10}
                  className="w-full px-5 py-4 rounded-xl bg-surface-light border border-white/5 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all resize-none"
                  autoFocus
                />
                <p className="text-xs text-text-muted mt-2">
                  {formData.jobDescription.length} characters
                </p>
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <h2 className="font-display text-3xl font-semibold mb-2">
                  Required qualifications
                </h2>
                <p className="text-text-secondary mb-8">
                  List the key qualifications, skills, and experience required.
                </p>
                <textarea
                  value={formData.qualifications}
                  onChange={(e) => update("qualifications", e.target.value)}
                  placeholder="e.g. 3+ years Python, experience with ML pipelines, strong communication skills..."
                  rows={6}
                  className="w-full px-5 py-4 rounded-xl bg-surface-light border border-white/5 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all resize-none"
                  autoFocus
                />
              </div>
            )}

            {currentStep === 4 && (
              <div>
                <h2 className="font-display text-3xl font-semibold mb-2">
                  Upload your resume
                </h2>
                <p className="text-text-secondary mb-8">
                  Upload a PDF of your resume. We'll analyze it to find gaps and strengths relative to the role.
                </p>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => update("resumeFile", e.target.files[0])}
                />

                {formData.resumeFile ? (
                  <div className="glass rounded-xl p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-accent/15 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <p className="text-text-primary font-medium">
                          {formData.resumeFile.name}
                        </p>
                        <p className="text-xs text-text-muted">
                          {(formData.resumeFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => update("resumeFile", null)}
                      className="p-2 rounded-lg hover:bg-surface-light transition-colors"
                    >
                      <X className="w-4 h-4 text-text-muted" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-16 rounded-xl border-2 border-dashed border-white/10 hover:border-primary/30 transition-all flex flex-col items-center gap-4 group"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all">
                      <Upload className="w-7 h-7 text-primary-light" />
                    </div>
                    <div className="text-center">
                      <p className="text-text-primary font-medium">Click to upload PDF</p>
                      <p className="text-sm text-text-muted mt-1">Max 10MB • PDF only</p>
                    </div>
                  </button>
                )}
              </div>
            )}

            {currentStep === 5 && (
              <div>
                <h2 className="font-display text-3xl font-semibold mb-2">
                  Customize your interview
                </h2>
                <p className="text-text-secondary mb-8">
                  Choose how many questions of each type and your preferred session length.
                </p>

                {/* Question type counters */}
                <div className="space-y-3 mb-8">
                  {QUESTION_TYPES.map((type) => (
                    <div
                      key={type.key}
                      className="glass rounded-xl px-5 py-4 flex items-center justify-between"
                    >
                      <div>
                        <p className={`font-medium text-sm ${type.color}`}>{type.label}</p>
                        <p className="text-xs text-text-muted mt-0.5">{type.description}</p>
                      </div>
                      <Counter
                        value={formData.questionConfig[type.key]}
                        min={type.min}
                        max={type.max}
                        onChange={(v) => updateQuestionConfig(type.key, v)}
                        color={type.color}
                      />
                    </div>
                  ))}
                </div>

                {/* Duration picker */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-text-muted" />
                    <p className="text-sm font-medium text-text-secondary">Session duration</p>
                  </div>
                  <div className="flex gap-3">
                    {DURATION_OPTIONS.map((d) => (
                      <button
                        key={d}
                        onClick={() => updateQuestionConfig("duration", d)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          formData.questionConfig.duration === d
                            ? "bg-primary text-white"
                            : "bg-surface-light text-text-secondary hover:bg-white/10"
                        }`}
                      >
                        {d}m
                      </button>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="glass-light rounded-xl px-5 py-4 flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Total questions</span>
                  <span className="font-mono text-lg font-semibold">
                    {totalQuestions === 0 ? (
                      <span className="text-danger text-sm">Add at least 1</span>
                    ) : (
                      <span className="text-accent">
                        {totalQuestions} questions · {formData.questionConfig.duration} min
                      </span>
                    )}
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Error */}
        {error && (
          <div className="mt-6 p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-10">
          <button
            onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-text-secondary hover:text-text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <GradientButton
            onClick={handleNext}
            disabled={!canProceed() || isLoading}
            className="flex items-center gap-2 min-w-0 px-7 py-3 text-sm rounded-xl"
          >
            {currentStep === 5 ? "Generate Questions" : "Continue"}
            <ArrowRight className="w-4 h-4" />
          </GradientButton>
        </div>
      </main>
    </div>
  );
}
