from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.speech_service import speech_service
from app.models.schemas import TranscriptionResponse

router = APIRouter(prefix="/api/speech", tags=["speech"])


@router.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(audio: UploadFile = File(...)):
    """Transcribe user's voice recording to text using Whisper."""

    allowed_types = [
        "audio/webm", "audio/wav", "audio/mp3", "audio/mpeg",
        "audio/ogg", "audio/mp4", "audio/m4a", "video/webm",
    ]

    # Read the audio
    audio_bytes = await audio.read()

    if len(audio_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty audio file.")

    if len(audio_bytes) > 25 * 1024 * 1024:  # 25MB limit
        raise HTTPException(status_code=400, detail="Audio file too large. Max 25MB.")

    try:
        result = await speech_service.transcribe_audio(
            audio_bytes=audio_bytes,
            filename=audio.filename or "recording.webm",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")

    return result
