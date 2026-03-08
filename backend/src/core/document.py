import fitz  # PyMuPDF
from typing import List


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract full text from PDF bytes."""
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    full_text = ""
    for page in doc:
        full_text += page.get_text() + "\n"
    doc.close()
    return full_text.strip()


def sliding_window_chunking(
    text: str,
    window_size: int = 400,
    step_size: int = 200
) -> List[str]:
    """
    Sliding window chunking on word level.
    window_size: number of words per chunk
    step_size: how many words to slide forward each step (overlap = window_size - step_size)
    """
    words = text.split()
    chunks = []

    if len(words) <= window_size:
        return [text.strip()]

    i = 0
    while i < len(words):
        chunk_words = words[i: i + window_size]
        chunk = " ".join(chunk_words).strip()
        if chunk:
            chunks.append(chunk)
        if i + window_size >= len(words):
            break
        i += step_size

    return chunks