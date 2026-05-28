# AINovelist Python AI Service

This service is invoked by the Tauri desktop app for AI writing.

It supports OpenAI-compatible chat completions through environment variables:

- `AINOVELIST_LLM_API_KEY` or `OPENAI_API_KEY`
- `AINOVELIST_LLM_BASE_URL`
- `AINOVELIST_LLM_MODEL`

Without an API key, it returns a deterministic local draft so the desktop app keeps a functional AI loop during development.
