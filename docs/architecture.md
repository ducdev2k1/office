# OneMail Docs Architecture

## Current Scope

This repository now focuses on a single web Docs product, not the full Office suite.

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

When moving beyond local MVP, add only the Docs backend needed for:

1. OneMail SSO session mapping.
2. Document metadata and permissions.
3. Document snapshot persistence.
4. Optional realtime collaboration with Yjs/Hocuspocus.
5. Export pipeline for `.docx` and PDF.
