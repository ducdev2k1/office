# OneMail Docs Architecture

## Current Scope

This repository targets a full web Office suite (Docs, Sheets, Slides). See `roadmap-web-office.md` for the phased plan, architecture decisions, and MVP scope contract.

**Currently implemented: Docs only.** Sheets and Slides start after the Docs MVP (day 90). The sections below describe what exists today.

The current app is a browser-first Docs editor:

- React + Vite frontend.
- TipTap/ProseMirror rich text editor.
- Multi-document sidebar.
- Local autosave for MVP workflow validation.
- HTML and TXT export.

## Implemented Editor Features

- Create and delete documents.
- Rename documents inline.
- Search documents.
- Rich text formatting: paragraph, heading 1, heading 2, bold, italic, underline, link, bullet list, ordered list, text alignment.
- Autosave to `localStorage`.
- Word and character counters.

## Next Backend Boundary

MVP (day 90) needs **no backend** — offline-first, IndexedDB, files opened from disk.

From month 4, add **one** NestJS app with clear module boundaries (not microservices):

1. OneMail SSO session mapping.
2. Document metadata and permissions.
3. Pre-signed URL minting for Drive/S3 — file bytes go browser↔S3 directly, never through the server.
4. Realtime collaboration via Hocuspocus (Yjs).

`.docx` read/write runs entirely client-side in `packages/docx-io`; there is no server-side export pipeline.
