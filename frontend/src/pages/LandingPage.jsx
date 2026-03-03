import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mic, Brain, BarChart3, ArrowRight, Sparkles, Target, MessageSquare, History, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" },
  }),
};

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-surface-dark relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-accent/8 blur-[100px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <span className="font-display text-xl font-semibold tracking-tight">
            Mock<span className="text-primary-light">view</span>
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          {user ? (
            <>
              <button
                onClick={() => navigate("/history")}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-text-secondary text-sm hover:text-text-primary transition-colors"
              >
                <History className="w-4 h-4" />
                My Interviews
              </button>
              <button
                onClick={() => navigate("/setup")}
                className="px-5 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary-light text-sm font-medium hover:bg-primary/20 transition-all"
              >
                Start Interview
              </button>
              <button
                onClick={async () => { await signOut(); }}
                className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign out
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate("/auth")}
              className="px-5 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary-light text-sm font-medium hover:bg-primary/20 transition-all"
            >
              Log In / Sign Up
            </button>
          )}
        </motion.div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-32">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-text-secondary mb-8"
          >
            <Sparkles className="w-4 h-4 text-accent" />
            AI-Powered Interview Preparation
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="font-display text-5xl md:text-7xl font-bold leading-tight tracking-tight mb-6"
          >
            Ace your next
            <br />
            <span className="text-gradient">interview</span> with AI
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="text-lg text-text-secondary max-w-xl mx-auto mb-10 leading-relaxed"
          >
            Upload your resume, paste the job description, and get a realistic
            mock interview powered by AI. Get scored, get feedback, get hired.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
            className="flex items-center justify-center gap-4"
          >
            <button
              onClick={() => navigate("/setup")}
              className="group px-8 py-4 rounded-2xl bg-gradient-primary text-white font-semibold text-lg flex items-center gap-3 hover:shadow-[0_0_40px_rgba(108,60,225,0.4)] transition-all duration-300"
            >
              Start Mock Interview
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 max-w-6xl mx-auto px-8 pb-32">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="font-display text-3xl font-semibold text-center mb-16"
        >
          How it works
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Brain,
              step: "01",
              title: "Set the stage",
              desc: "Enter your target role, paste the job description, and upload your resume. Our AI analyzes the gaps and tailors questions specifically for you.",
              color: "primary",
            },
            {
              icon: Mic,
              step: "02",
              title: "Interview by voice",
              desc: "An AI interviewer asks you questions naturally — just like a real interview. Respond by speaking. It listens, follows up, and keeps the conversation flowing.",
              color: "accent",
            },
            {
              icon: BarChart3,
              step: "03",
              title: "Get your score",
              desc: "Each answer is scored 0-100 across relevance, depth, communication, and accuracy. Get detailed feedback and suggested stronger answers.",
              color: "primary",
            },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="glass rounded-2xl p-8 hover:border-primary/30 transition-all group"
            >
              <div className="flex items-center gap-4 mb-5">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    item.color === "primary"
                      ? "bg-primary/15 text-primary-light"
                      : "bg-accent/15 text-accent"
                  }`}
                >
                  <item.icon className="w-6 h-6" />
                </div>
                <span className="font-mono text-sm text-text-muted">
                  {item.step}
                </span>
              </div>
              <h3 className="font-display text-xl font-semibold mb-3">
                {item.title}
              </h3>
              <p className="text-text-secondary leading-relaxed text-sm">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section className="relative z-10 max-w-6xl mx-auto px-8 pb-32">
        <div className="glass rounded-3xl p-10 md:p-14">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="font-display text-3xl font-semibold mb-6">
                Not just questions.
                <br />
                <span className="text-gradient">Real feedback.</span>
              </h2>
              <div className="space-y-4">
                {[
                  "Tailored questions based on YOUR resume gaps",
                  "Natural follow-up questions like a real interviewer",
                  "4-dimension scoring: relevance, depth, communication, accuracy",
                  "Suggested stronger answers for every question",
                ].map((feat, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-accent" />
                    </div>
                    <span className="text-text-secondary text-sm">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Score preview mockup */}
            <div className="glass-light rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-text-secondary">Overall Score</span>
                <span className="text-sm font-mono text-accent">Strong</span>
              </div>
              <div className="text-6xl font-display font-bold text-gradient mb-6">
                82
              </div>
              <div className="space-y-3">
                {[
                  { label: "Relevance", score: 21, max: 25 },
                  { label: "Depth", score: 19, max: 25 },
                  { label: "Communication", score: 22, max: 25 },
                  { label: "Technical", score: 20, max: 25 },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs text-text-secondary mb-1">
                      <span>{item.label}</span>
                      <span>{item.score}/{item.max}</span>
                    </div>
                    <div className="h-1.5 bg-surface-dark rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                        style={{ width: `${(item.score / item.max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-8 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-4xl font-bold mb-4">
            Ready to practice?
          </h2>
          <p className="text-text-secondary mb-8">
            Your next interview could be the one. Make sure you're ready.
          </p>
          <button
            onClick={() => navigate("/setup")}
            className="group px-10 py-4 rounded-2xl bg-gradient-primary text-white font-semibold text-lg inline-flex items-center gap-3 hover:shadow-[0_0_40px_rgba(108,60,225,0.4)] transition-all duration-300"
          >
            <MessageSquare className="w-5 h-5" />
            Start Now
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between text-sm text-text-muted">
          <span>© 2026 Mockview. Built with AI.</span>
          <span className="font-mono text-xs">v1.0</span>
        </div>
      </footer>
    </div>
  );
}
