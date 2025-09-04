# Repository Guidelines

## Project Structure & Module Organization
- `src/`: React UI (entry: `src/main.jsx`), components under `src/components/`, styles in `src/index.css` and `src/main.css`.
- `public/`: Static assets bundled by Vite, including `public/plugin.json` and `public/preload/services.js` for uTools. Copied to `dist/` on build.
- `plugin.json` (root): Plugin metadata for packaged builds targeting `dist/`.
- `vite.config.js`: Build config (outputs to `dist/`).
- `97Panso/`: Prebuilt/plugin snapshot. Do not edit; not used for local dev.

## Build, Test, and Development Commands
- `npm install`: Install dependencies.
- `npm run dev`: Start Vite dev server at `http://localhost:5173`. uTools reads `development.main` from `public/plugin.json` for live preview.
- `npm run build`: Create production bundle in `dist/` (copies `public` files, emits assets under `dist/assets`).
- `npm run preview`: Preview the production build locally.
- Load in uTools: Import the `dist/` folder as a local plugin for production-like testing.

## Coding Style & Naming Conventions
- Indentation: 2 spaces; use semicolons consistently.
- React: Functional components with hooks; component files in `PascalCase` (e.g., `SearchBar.jsx`), helpers in `camelCase`.
- CSS: Keep component-specific styles close to components when practical; prefer class names in `kebab-case`.
- Imports: Use relative paths within `src/`; keep public APIs small at component boundaries.

## Testing Guidelines
- No formal test suite configured yet. Prefer targeted manual verification in uTools (search flow, copy/open link, filters, pagination).
- If adding tests, use Vitest + React Testing Library; place files as `ComponentName.test.jsx` adjacent to the component.

## Commit & Pull Request Guidelines
- Commits: Prefer Conventional Commits (e.g., `feat: add ResourceTypeFilter`, `fix: prevent empty search`). One logical change per commit.
- PRs: Include a clear description, steps to reproduce/verify, and screenshots or short clips for UI changes. Reference related issues.

## Security & Configuration Tips
- Preload scripts expose only safe Node APIs (`window.customApis`/`window.services`); avoid adding network calls there.
- Keep plugin IDs/feature codes consistent with `plugin.json`. Validate any new IPC or clipboard operations inside uTools.
