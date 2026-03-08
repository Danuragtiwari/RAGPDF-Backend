import os
from groq import Groq
from typing import List, Optional
from dotenv import load_dotenv

load_dotenv()

_client = None


def get_groq_client() -> Groq:
    global _client
    if _client is None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY not set in environment variables")
        _client = Groq(api_key=api_key)
    return _client


def chat_with_rag(query: str, context_chunks: List[str], chat_history: List[dict]) -> str:
    """
    Answer user query using RAG context from PDF.
    """
    client = get_groq_client()

    context = "\n\n---\n\n".join(context_chunks)

    system_prompt = f"""You are a helpful AI assistant that answers questions based on the provided PDF document context.

CONTEXT FROM PDF:
{context}

Instructions:
- Answer ONLY based on the provided context above
- If the answer is not in the context, say "I couldn't find this information in the uploaded PDF."
- Be concise and accurate
- Quote relevant parts of the document when helpful"""

    messages = [{"role": "system", "content": system_prompt}]

    # Add last 6 messages of chat history for context
    for msg in chat_history[-6:]:
        messages.append({"role": msg["role"], "content": msg["content"]})

    messages.append({"role": "user", "content": query})

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=messages,
        max_tokens=1024,
        temperature=0.3,
    )

    return response.choices[0].message.content


def chat_without_rag(query: str, chat_history: List[dict]) -> str:
    """
    Normal chat without any PDF context - used when no PDF is uploaded.
    """
    client = get_groq_client()

    system_prompt = """You are a helpful, friendly AI assistant. Answer questions clearly and helpfully.
No PDF is currently uploaded, so answer from your general knowledge."""

    messages = [{"role": "system", "content": system_prompt}]

    for msg in chat_history[-6:]:
        messages.append({"role": msg["role"], "content": msg["content"]})

    messages.append({"role": "user", "content": query})

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=messages,
        max_tokens=1024,
        temperature=0.7,
    )

    return response.choices[0].message.content
