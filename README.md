# OneMail Docs

Bo Office web (Docs, Sheets, Slides) thay the Collabora Online. Hien tai da trien khai Docs; Sheets va Slides bat dau sau moc Docs MVP.

Tai lieu lo trinh:

- **[Ban chot cho lanh dao](docs/roadmap-web-office-tom-tat.md)** — 1 trang, doc 5 phut.
- [Ban chi tiet](docs/roadmap-web-office.md) — de tra loi khi bi hoi sau.
- [Ban trinh bay HTML](docs/roadmap-web-office.html) — mo bang trinh duyet khi hop.

## Stack

- Web: React 19 + Vite + TypeScript
- Routing: react-router-dom (`/` home, `/edit/:id` editor)
- Editor: TipTap/ProseMirror
- UI: Base UI + shadcn-style components (`@office/ui-kit`)
- Icons: lucide-react
- Storage MVP: IndexedDB autosave (`@office/storage-adapter`)

## Chay local

```bash
pnpm install
pnpm dev:docs
```

## Cau truc

```text
apps/
  docs/             React Docs editor (TipTap) + home dashboard
packages/
  ooxml-core/       giai nen/nen giu nguyen byte OOXML, so dang ky phan
  docx-io/          docx <-> TipTap (T1 — preserve-and-patch)
  xlsx-io/          xlsx <-> Univer (ExcelJS) — Giai doan 6
  pptx-io/          bao quanh ban fork pptx-viewer — Giai doan 7
  storage-adapter/  driver: IndexedDB | FileSystemAccess | Drive
  app-shell/        shell dung chung: TopBar + ProductSwitcher + ShellLayout
  file-home/        home quan ly file dung chung (FileHome, list/grid, trash)
  i18n/             i18n dung chung: tu dien locale + formatter
  collab-core/      Y.Doc + doi provider — Giai doan 3
  auth-sdk/         OneMail SSO — Giai doan 4
  ui-kit/           design token + component dung chung
  fidelity-harness/ bo do chat luong round-trip, chay trong CI
docs/
  architecture.md   Architecture notes
```

## Home dashboard (Docs, tai dung cho Sheets/Slides)

Trang `/` la home kieu Google Workspace: template strip, thong ke, tabs (Gần đây / Có gắn dấu sao / Thùng rác), list/grid, sort, tim kiem, rename inline, duplicate, trash soft-delete + xoa vinh vien (dialog xac nhan). Dong goi thanh `@office/app-shell` + `@office/file-home`; Sheets/Slides chi can truyen `ProductConfig` (xem `docs/architecture.md`). Route demo dev-only: `/demo/sheets`.

## Tinh nang hien co

- Trang home quan ly file: tao, xoa (soft-delete -> Thung rac), khoi phuc, xoa vinh vien, duplicate, doi ten inline, gan dau sao.
- Tim kiem tai lieu; che do xem list/grid; loc Gần đây / Có gắn dấu sao / Thùng rác.
- Editor rich text bang TipTap.
- Toolbar: paragraph, heading, bold, italic, underline, link, bullet list, numbered list, align left/center/right.
- Autosave IndexedDB.
- Word count, character count.
- Export HTML va TXT.

## Viec tiep theo — M1 (ngay 1-30): Docs offline chay duoc

1. ~~Doi ten `apps/web` thanh `apps/docs`, tach `packages/`.~~ Da xong.
2. `storage-adapter` + IndexedDB thay localStorage (quota 5MB la chan cung).
3. File System Access API: mo/luu file truc tiep tu may.
4. PWA: cai duoc nhu ung dung, mat mang van soan thao.
5. Quan ly file cuc bo, export HTML/TXT/Markdown/PDF.
6. **Khoi dong ngay tu tuan 1:** thu thap 50-100 file `.docx` that (da an danh) — phu thuoc nguoi khac nen khong cho duoc.

**Moc M2 (ngay 60):** trinh xem `.docx` dung `docx-preview`, mo file that xem chuan xac, luu lai giong het tung byte. Day la moc trien khai that duoc dau tien.

**Luu y quan trong:** `fidelity-harness` phai phat ra khac biet may doc duoc (XPath phan tu lech, thuoc tinh, gia tri mong doi vs thuc te) — khong chi mot con so phan tram. Day la dieu kien de vong lap go loi o M3/M4 chay duoc bang agentic AI, dang gia 1.5-2 thang tien do.
