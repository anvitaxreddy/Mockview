# 🎯 Mockview — AI Mock Interview Platform

An AI-powered mock interview app that generates tailored questions based on your resume and job description, conducts voice-based interviews, and provides detailed scoring and feedback.

## Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion
- **Backend**: FastAPI, Google Gemini API (free tier)
- **Voice**: Web Speech API (TTS + STT — both free, browser-native)

## Quick Start

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate        # macOS/Linux
# venv\Scripts\activate          # Windows

pip install -r requirements.txt
cp .env.example .env
# Edit .env with your Gemini API key
```

### 2. Frontend Setup
```bash
cd frontend
npm install
```

### 3. Get Your FREE Gemini API Key
1. Go to https://aistudio.google.com/apikey
2. Sign in with your Google account
3. Click "Create API Key" → choose "Create in new project"
4. Copy the key

Edit `backend/.env`:
```
GEMINI_API_KEY=your-key-here
```

### 4. Run
```bash
# Terminal 1 — Backend
cd backend
uvicorn app.main:app --reload --port 8000

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Open http://localhost:5173

## How It Works
1. **Setup** → Enter role, paste JD, list qualifications, upload resume PDF
2. **Interview** → AI asks tailored questions via voice, you respond by speaking
3. **Results** → Each answer scored 0-100 across 4 dimensions, with detailed feedback

## Scoring Rubric
| Dimension | Max | Description |
|---|---|---|
| Relevance | 25 | Does the answer address the question? |
| Depth & Detail | 25 | STAR method, specific examples, thoroughness |
| Communication | 25 | Clarity, structure, conciseness |
| Technical Accuracy | 25 | Correctness of technical concepts |

## Project Structure
```
mockview/
├── frontend/          # React + Vite
│   ├── src/
│   │   ├── pages/     # Landing, Setup, Interview, Results
│   │   ├── hooks/     # Voice recording, TTS, session management
│   │   ├── services/  # API client
│   │   └── context/   # Global state
│   └── ...
├── backend/           # FastAPI
│   ├── app/
│   │   ├── routers/   # API endpoints
│   │   ├── services/  # Claude, Whisper, resume parser
│   │   └── models/    # Schemas, prompts
│   └── ...
└── MOCKVIEW_BLUEPRINT.md  # Full project context document
```

---
Built by Anvi • 2026
