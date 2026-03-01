import pdfplumber
import io


class ResumeParser:
    @staticmethod
    async def parse_pdf(file_bytes: bytes) -> str:
        """Extract text content from a PDF resume."""
        text_parts = []
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)

        full_text = "\n".join(text_parts).strip()

        if not full_text:
            raise ValueError("Could not extract text from the PDF. Please ensure it's not a scanned image.")

        return full_text

    @staticmethod
    def clean_resume_text(text: str) -> str:
        """Clean up extracted resume text."""
        import re
        # Remove excessive whitespace
        text = re.sub(r'\n{3,}', '\n\n', text)
        text = re.sub(r' {2,}', ' ', text)
        # Remove common PDF artifacts
        text = re.sub(r'[\x00-\x08\x0b-\x0c\x0e-\x1f]', '', text)
        return text.strip()


resume_parser = ResumeParser()
