# OneMail Docs Architecture

## Current Scope

This repository targets a full web Office suite (Docs, Sheets, Slides). See `roadmap-web-office.md` for the phased plan, architecture decisions, and MVP scope contract.

**Currently implemented: Docs only.** Sheets and Slides start after the Docs MVP (day 90). The sections below describe what exists today.

The current app is a browser-first Docs editor:

- React + Vite frontend (`apps/docs`).
- TipTap/ProseMirror rich text editor.
- **Home dashboard** (`/`) + editor (`/edit/:id`), routing via `react-router-dom`.
- Multi-document sidebar.
- Local autosave for MVP workflow validation (IndexedDB via `@office/storage-adapter`).
- HTML and TXT export.

## Home dashboard

A Google-Workspace-style file manager home, shipped as two reusable packages so Sheets and Slides mount it unchanged:

- `packages/app-shell` — TopBar (product switcher, search, theme toggle, avatar) + `ShellLayout`.
- `packages/file-home` — `FileHome` component: template strip, stats cards, tabs (Gần đây / Có gắn dấu sao / Thùng rác), list/grid views, sort, search, inline rename, duplicate, soft-delete Trash with restore and permanent delete (confirm dialog).

**Reuse contract**: each product provides a `ProductConfig` (`kind`, labels, `editorPath(id)`, `accentVar`, templates) plus a `FileHomeActions` object. See `packages/file-home/src/types.ts`. Dev-only demo route `/demo/sheets` mounts `FileHome` with a Sheets config to prove reuse (`import.meta.env.DEV` guard).

Kind accent tokens: `--o-kind-docs`, `--o-kind-sheets`, `--o-kind-slides` (light + dark) defined in `packages/ui-kit/src/tokens.css` and mapped into Tailwind v4 theme in each app's `styles.css` (`@theme inline`, `@source "../../../packages"`).

## Monorepo layout

```
apps/docs             Docs editor (TipTap) + home dashboard
packages/
  ooxml-core          byte-preserving OOXML unpack/repack, part registry
  docx-io             docx ↔ TipTap (T1 preserve-and-patch)
  xlsx-io             xlsx ↔ Univer (ExcelJS) — Phase 6
  pptx-io             wrapper around pptx-viewer fork — Phase 7
  storage-adapter     DocumentStore drivers: IndexedDB | FileSystemAccess | Drive
  app-shell           shared shell: TopBar + ProductSwitcher + ShellLayout
  file-home           shared file-manager home (FileHome, list/grid, trash)
  i18n                shared i18n: locale dictionaries + formatters (relative time, etc.)
  collab-core         Y.Doc + provider switching — Phase 3
  auth-sdk            OneMail SSO — Phase 4
  ui-kit              shared design tokens + components (Base UI + shadcn-style)
  fidelity-harness    round-trip quality harness, runs in CI
```

Note: `apps/sheets`, `apps/slides`, `apps/shell` and `services/api` are created in their respective phases (6, 7, 8, 4). `apps/shell` from the roadmap is superseded by the shared `@office/app-shell` package approach (each product app mounts the shell at its own `/`; 3 apps deploy independently).

### Conventions for shared packages

Shared packages ship TypeScript source via `exports` (e.g. `"./src/index.ts"`) so Vite consumes them directly. Import within a package must use **relative paths** (never the `@/` alias), because a consumer's `tsconfig` resolves `@/*` to its own `src` — the alias only works inside the package that declares it.

## Implemented Editor Features

- Create and delete documents (delete = soft-delete to Trash; restore available).
- Duplicate documents ("Bản sao của <title>").
- Rename documents inline.
- Star/unstar documents; filter by Gần đây / Có gắn dấu sao / Thùng rác.
- Search documents.
- List and grid views (preference persisted to `localStorage`).
- Rich text formatting: paragraph, heading 1, heading 2, bold, italic, underline, link, bullet list, ordered list, text alignment.
- Autosave to `IndexedDB` (`localStorage` in earlier iterations; see `@office/storage-adapter`).
- Word and character counters.

## Next Backend Boundary

MVP (day 90) needs **no backend** — offline-first, IndexedDB, files opened from disk.

From month 4, add **one** NestJS app with clear module boundaries (not microservices):

1. OneMail SSO session mapping.
2. Document metadata and permissions.
3. Pre-signed URL minting for Drive/S3 — file bytes go browser↔S3 directly, never through the server.
4. Realtime collaboration via Hocuspocus (Yjs).

`.docx` read/write runs entirely client-side in `packages/docx-io`; there is no server-side export pipeline.
