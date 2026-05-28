# AINovelist

AINovelist / NovelCraft is a local-first desktop writing workbench for long-form fiction. The current implementation has been migrated to Tauri 2 + React + Vite, with Rust commands for local persistence and a Python service for LLM-assisted generation.

## Current Capabilities

- Tauri 2 desktop shell with React workspace UI.
- Local project creation, listing, and opening.
- Chapter creation, reading, Markdown editing, and saving.
- Character creation, listing, and deletion.
- Knowledge-base Markdown scanning and keyword search.
- Hard memory constraints for continuity control.
- Python-backed AI generation with OpenAI-compatible LLM support and local fallback output.
- Markdown/TXT project export.

## Architecture

```text
D:/AINovelist
├── src-app/              # React + Vite desktop UI
├── src-tauri/            # Tauri config, Rust commands, capabilities, icons
├── services/ai/          # Python LLM service invoked by the Tauri app
├── packages/schema/      # Shared TypeScript/Zod schemas
├── packages/core/        # Reusable domain helpers and tests
├── docs/                 # Reports and project documents
├── plan/                 # Product and iteration plans
└── pen/                  # Pencil design assets
```

Default runtime data is stored outside the repository:

```text
F:/AINovelistData/workspace
F:/AINovelistData/knowledge_base
F:/AINovelistData/models
F:/AINovelistData/cache
```

## Development Commands

```bash
pnpm install        # install dependencies
pnpm dev            # run the Tauri desktop app
pnpm dev:web        # run only the Vite frontend
pnpm typecheck      # check React app and TS packages
pnpm test           # run Vitest package tests
pnpm build:web      # build frontend assets
pnpm tauri:build    # build desktop executable
pnpm build          # full verification build
```

For Rust-only checks:

```bash
cd src-tauri
cargo check
```

For Python AI service setup:

```bash
pip install -r services/ai/requirements.txt
```

## LLM Configuration

The AI service reads environment variables and falls back to deterministic local draft text when no API key is present.

```text
AINOVELIST_LLM_API_KEY=...
AINOVELIST_LLM_BASE_URL=https://api.openai.com/v1
AINOVELIST_LLM_MODEL=gpt-4.1-mini
```

`OPENAI_API_KEY` is also accepted as a fallback key name. Do not commit local `.env` files or secrets.

## Implementation Notes

The frontend calls Rust commands through Tauri `invoke`. Rust owns local file access, ID validation, path containment, atomic writes, and backup handling. The Python AI service is invoked as a local child process and communicates with JSON over stdin/stdout.

The current Tauri bundle setting builds a release executable without producing an installer. MSI packaging can be re-enabled after WiX toolchain verification.
