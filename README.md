# OneMail Docs

Web Docs editor MVP. Pham vi hien tai chi tap trung vao Docs, khong build Sheets/Slides.

## Stack

- Web: React 19 + Vite + TypeScript
- Editor: TipTap/ProseMirror
- Icons: lucide-react
- Storage MVP: localStorage autosave

## Chay local

```bash
pnpm install
pnpm dev:web
```

## Cau truc

```text
apps/
  web/             React Docs editor
docs/
  architecture.md  Docs-only architecture notes
```

## Tinh nang hien co

- Tao / xoa tai lieu.
- Doi ten tai lieu.
- Tim kiem tai lieu.
- Editor rich text bang TipTap.
- Toolbar: paragraph, heading, bold, italic, underline, link, bullet list, numbered list, align left/center/right.
- Autosave local.
- Word count, character count.
- Export HTML va TXT.

## Viec tiep theo

1. Luu document len backend thay localStorage.
2. Tich hop OneMail SSO.
3. Them version history.
4. Them export `.docx` va PDF.
5. Neu can realtime: them Yjs/Hocuspocus.
