import anthropic
import json
from app.config import get_settings


class ClaudeService:
    def __init__(self):
        settings = get_settings()
        self.client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
        self.model = "claude-sonnet-4-20250514"

    async def generate(self, prompt: str, max_tokens: int = 4096) -> str:
        """Send a prompt to Claude and return the text response."""
        message = self.client.messages.create(
            model=self.model,
            max_tokens=max_tokens,
            messages=[{"role": "user", "content": prompt}],
        )
        return message.content[0].text

    async def generate_json(self, prompt: str, max_tokens: int = 4096) -> dict | list:
        """Send a prompt to Claude and parse JSON response."""
        raw = await self.generate(prompt, max_tokens)
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
claude_service = ClaudeService()
