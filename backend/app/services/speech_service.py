import io
import openai
from app.config import get_settings
from app.models.schemas import TranscriptionResponse


class SpeechService:
    def __init__(self):
        settings = get_settings()
        self.client = openai.OpenAI(api_key=settings.openai_api_key)

    async def transcribe_audio(self, audio_bytes: bytes, filename: str = "audio.webm") -> TranscriptionResponse:
        """Transcribe audio using OpenAI Whisper API."""
        audio_file = io.BytesIO(audio_bytes)
        audio_file.name = filename

        transcript = self.client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file,
            response_format="verbose_json",
        )

        # Extract confidence from segments if available
        confidence = 0.95  # Default high confidence
        if hasattr(transcript, "segments") and transcript.segments:
            avg_logprob = sum(
                seg.get("avg_logprob", -0.3) for seg in transcript.segments
            ) / len(transcript.segments)
            # Convert log probability to a 0-1 confidence
            import math
            confidence = round(min(1.0, math.exp(avg_logprob) * 2), 2)

        return TranscriptionResponse(
            transcription=transcript.text,
            confidence=confidence,
        )


speech_service = SpeechService()
