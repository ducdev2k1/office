# OneMail Docs

Bo Office web (Docs, Sheets, Slides) thay the Collabora Online. Hien tai da trien khai Docs; Sheets va Slides bat dau sau moc Docs MVP.

Tai lieu lo trinh:

- **[Ban chot cho lanh dao](docs/roadmap-web-office-tom-tat.md)** — 1 trang, doc 5 phut.
- [Ban chi tiet](docs/roadmap-web-office.md) — de tra loi khi bi hoi sau.
- [Ban trinh bay HTML](docs/roadmap-web-office.html) — mo bang trinh duyet khi hop.

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

## Viec tiep theo — M1 (ngay 1-30): Docs offline chay duoc

1. Doi ten `apps/web` thanh `apps/docs`, tach `packages/`.
2. `storage-adapter` + IndexedDB thay localStorage (quota 5MB la chan cung).
3. File System Access API: mo/luu file truc tiep tu may.
4. PWA: cai duoc nhu ung dung, mat mang van soan thao.
5. Quan ly file cuc bo, export HTML/TXT/Markdown/PDF.
6. **Khoi dong ngay tu tuan 1:** thu thap 50-100 file `.docx` that (da an danh) — phu thuoc nguoi khac nen khong cho duoc.

**Moc M2 (ngay 60):** trinh xem `.docx` dung `docx-preview`, mo file that xem chuan xac, luu lai giong het tung byte. Day la moc trien khai that duoc dau tien.

**Luu y quan trong:** `fidelity-harness` phai phat ra khac biet may doc duoc (XPath phan tu lech, thuoc tinh, gia tri mong doi vs thuc te) — khong chi mot con so phan tram. Day la dieu kien de vong lap go loi o M3/M4 chay duoc bang agentic AI, dang gia 1.5-2 thang tien do.
