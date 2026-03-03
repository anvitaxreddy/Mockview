import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import SetupPage from "./pages/SetupPage";
import InterviewPage from "./pages/InterviewPage";
import ResultsPage from "./pages/ResultsPage";
import AuthPage from "./pages/AuthPage";
import HistoryPage from "./pages/HistoryPage";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <div className="min-h-screen bg-surface-dark">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/setup"
          element={<ProtectedRoute><SetupPage /></ProtectedRoute>}
        />
        <Route
          path="/interview"
          element={<ProtectedRoute><InterviewPage /></ProtectedRoute>}
        />
        <Route
          path="/results"
          element={<ProtectedRoute><ResultsPage /></ProtectedRoute>}
        />
        <Route
          path="/history"
          element={<ProtectedRoute><HistoryPage /></ProtectedRoute>}
        />
      </Routes>
    </div>
  );
}
