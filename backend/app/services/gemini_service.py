from google import genai
import json
from app.config import get_settings


class GeminiService:
    def __init__(self):
        settings = get_settings()
        self.client = genai.Client(api_key=settings.gemini_api_key)
        self.model = "gemini-2.0-flash"  # Free tier model — fast and capable

    async def generate(self, prompt: str) -> str:
        """Send a prompt to Gemini and return the text response."""
        response = self.client.models.generate_content(
            model=self.model,
            contents=prompt,
            config={
                "temperature": 0.7,
                "max_output_tokens": 4096,
            },
        )
        return response.text

    async def generate_json(self, prompt: str) -> dict | list:
        """Send a prompt to Gemini and parse JSON response."""
        raw = await self.generate(prompt)
        # Strip markdown code fences if present
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()
        if cleaned.startswith("json"):
            cleaned = cleaned[4:].strip()
        return json.loads(cleaned)


# Singleton
gemini_service = GeminiService()
