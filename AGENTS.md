# Repository Guidelines

## Project Structure & Module Organization

AINovelist is a Tauri 2 desktop app with a React + Vite frontend, a Rust command layer, and a Python AI service. `src-app/` contains the desktop UI (`main.tsx`, `types.ts`, `styles.css`). `src-tauri/` contains Tauri configuration, capabilities, icons, and Rust commands for project files, chapters, characters, knowledge, memory, export, and AI invocation. `services/ai/` contains the Python LLM bridge. Shared TypeScript schemas and reusable domain helpers live in `packages/schema/` and `packages/core/`.

Project documentation is in `docs/` and `plan/`. Pencil design assets live in `pen/`; access `.pen` files through Pencil tooling. Runtime data defaults to `F:/AINovelistData` and must stay outside source control.

## Build, Test, and Development Commands

- `pnpm install` installs workspace dependencies from `pnpm-lock.yaml`.
- `pnpm dev` starts the Tauri development app.
- `pnpm dev:web` starts only the Vite frontend on `127.0.0.1`.
- `pnpm typecheck` checks the React app and TypeScript packages.
- `pnpm test` runs Vitest suites under `packages/**/*.test.ts`.
- `pnpm build:web` builds the frontend into `dist/`.
- `pnpm tauri:build` builds the desktop executable.
- `pnpm build` runs type checks, web build, and Tauri build.

## Coding Style & Naming Conventions

Use TypeScript modules with two-space indentation, single quotes, and no semicolons. React components use PascalCase; hooks use `useX`; tests use `*.test.ts`. Keep browser UI code free of direct filesystem access. Local capabilities should flow through Tauri `invoke` commands and Rust-side validation.

Rust commands should validate IDs and resolve paths inside the configured data root before reading or writing. Python service code should stay dependency-light and return structured JSON over stdin/stdout.

## Testing Guidelines

Vitest covers shared schemas and domain helpers. Add focused tests in `packages/**/src/*.test.ts` for validation, path-safe IDs, and serialization behavior. Run `pnpm typecheck` and `pnpm test` before submitting. For Rust command changes, also run `cargo check` from `src-tauri/`.

## Commit & Pull Request Guidelines

History uses brief Conventional Commit-style subjects such as `feat: ...`, `fix: ...`, and `docs: ...`; keep that pattern. Pull requests should describe the behavior change, list verification commands, link related issues or plan items, and include screenshots for UI changes.

## Security & Configuration Tips

Do not commit `.env`, API keys, local workspace data, model files, caches, backups, installers, or `src-tauri/target/`. Use `.env.example` for non-secret configuration names. Keep LLM keys in the local environment only.
