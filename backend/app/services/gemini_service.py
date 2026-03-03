import json
from google import genai
from app.config import get_settings


class GeminiService:
    def __init__(self):
        settings = get_settings()
        self.client = genai.Client(api_key=settings.gemini_api_key)
        self.model = "gemini-2.5-flash"  # Free tier model — fast and capable

    async def generate(self, prompt: str) -> str:
        """Send a prompt to Gemini and return the text response."""
        response = self.client.models.generate_content(
            model=self.model,
            contents=prompt,
            config={
                "temperature": 0.7,
                "max_output_tokens": 8192,
            },
        )
        return response.text

    async def generate_json(self, prompt: str) -> dict | list:
        """Send a prompt to Gemini and parse JSON response, using JSON mode."""
        response = self.client.models.generate_content(
            model=self.model,
            contents=prompt,
            config={
                "temperature": 0.7,
                "max_output_tokens": 8192,
                "response_mime_type": "application/json",
            },
        )
        return json.loads(response.text)


# Singleton
gemini_service = GeminiService()
