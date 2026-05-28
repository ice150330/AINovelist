# AINovelist Collaboration Notes

AINovelist is a Tauri 2 desktop app. Keep new work aligned with the current stack:

- UI: React + Vite in `src-app/`
- Desktop shell and local commands: Tauri 2 + Rust in `src-tauri/`
- AI generation: Python service in `services/ai/`
- Shared TypeScript contracts: `packages/schema/`
- Domain helpers and tests: `packages/core/`

## Commands

```bash
pnpm dev            # run the Tauri app
pnpm dev:web        # run only Vite
pnpm typecheck      # check app and packages
pnpm test           # run Vitest package tests
pnpm build:web      # build frontend
pnpm tauri:build    # build desktop executable
pnpm build          # full build path
```

Run Rust checks from `src-tauri/`:

```bash
cargo check
```

## Architecture Boundaries

React code must not access local files directly. Use Tauri `invoke` calls and keep filesystem operations in Rust commands. Rust should validate safe IDs, resolve paths under `F:/AINovelistData`, use atomic writes where practical, and avoid exposing arbitrary path access to the UI.

Python AI code is a local service boundary. It accepts JSON on stdin and returns JSON on stdout. LLM configuration comes from environment variables:

```text
AINOVELIST_LLM_API_KEY
AINOVELIST_LLM_BASE_URL
AINOVELIST_LLM_MODEL
OPENAI_API_KEY
```

Never commit `.env`, keys, local workspace data, model files, caches, installers, or `src-tauri/target/`.

## Runtime Data

Runtime data belongs outside the repository:

```text
F:/AINovelistData/workspace
F:/AINovelistData/knowledge_base
F:/AINovelistData/models
F:/AINovelistData/cache
```

Knowledge documents remain Markdown files. Project, chapter, character, memory, and export data are currently persisted by Rust commands using JSON/Markdown files.

## Design Assets

Pencil design files in `pen/` must be accessed through Pencil MCP tooling, not edited as plain text.
