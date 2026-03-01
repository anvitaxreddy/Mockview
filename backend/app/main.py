from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.routers import interview, questions, evaluation, speech

settings = get_settings()

app = FastAPI(
    title="Mockview API",
    description="AI-Powered Mock Interview Platform",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(interview.router)
app.include_router(questions.router)
app.include_router(evaluation.router)
app.include_router(speech.router)


@app.get("/")
async def root():
    return {"message": "Mockview API is running", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
