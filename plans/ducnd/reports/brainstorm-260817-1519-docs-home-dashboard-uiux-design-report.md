# Biên bản brainstorm — Home Dashboard cho Docs (tái dùng Sheets/Slides)

| | |
|---|---|
| Ngày | 17/08/2026 |
| Phiên | `/brainstorm` — UI/UX home dashboard |
| Trạng thái | Đã chốt thiết kế, chưa triển khai |
| Đầu ra | Report này · kế hoạch triển khai (nếu chốt `/ck:plan`) |

## Vấn đề

Repo `onemail-docs` (Docs TipTap đã chạy) thiếu trang home quản lý file kiểu Google Docs. Sidebar "Document tabs" hiện tại chỉ là danh sách file tối giản trong editor. Cần 1 dashboard chuẩn UI/UX, **tái dùng được cho Sheets, Slides** — yêu cầu cốt lõi vì lộ trình sẽ thêm 2 app nữa.

## Yêu cầu (đã chốt với người dùng)

| # | Quyết định |
|---|---|
| R1 | Dashboard = **file home + thẻ thống kê nhỏ** ("Cả hai") |
| R2 | **Kéo shell lên sớm** nhưng dưới dạng **package dùng chung** (`@office/app-shell` + `@office/file-home`), không phải deployable thứ 4 — giữ C5 (3 app deploy độc lập) |
| R3 | MVP **đầy đủ kiểu Google**: template strip, tabs, search, sort, list/grid toggle, starred, **Trash (soft-delete)**, duplicate, rename inline |
| R4 | Ngôn ngữ thiết kế: **chuẩn Google Workspace home + token iNET One Seri** |
| R5 | Router: **react-router-dom** (`/` = home, `/edit/:id` = editor) |
| R6 | Kỹ thuật: **shadcn/ui + Base UI + Tailwind** (đã chốt Q11 trước đó) |

## Đánh giá các hướng (đã cân nhắc)

### Vị trí kiến trúc
| Hướng | Ưu | Nhược |
|---|---|---|
| **A. Package chung (CHỐT)** `@office/app-shell` + `@office/file-home`, mỗi app mount ở `/` | Đúng C5, không thêm infra, sheets/slides mount y hệt, apps/shell Phase 8 chỉ là app rỗng nhúng package | Chưa có "1 điểm vào drive-like" (không cần MVP) |
| B. apps/shell deployable ngay | UX 1 cửa kiểu Google Drive | 4 app deploy, cần app-registry/routing infra, sai thứ tự (chưa có app để shell) |
| C. Chỉ trong apps/docs | Nhanh nhất | Phải viết lại khi sheets/slides — phá hoại DRY |

### Mức độ MVP
| Hướng | Ưu | Nhược |
|---|---|---|
| **A. Đầy đủ + Trash (CHỐT)** | Đúng mental model Google, ít phải bổ sung sau | Model/storage phình nhẹ (soft-delete flag) — chấp nhận được |
| B. Trash lùi | Model gọn | Chưa trọn trải nghiệm, phải làm sau |

## Thiết kế UI/UX chốt

### Bố cục trang Home (`/`)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ TopBar: [☰] [Docs ▾] [Tìm kiếm trong tài liệu.......] [☾] [⋮] [D]      │ ← @office/app-shell
├─────────────────────────────────────────────────────────────────────────┤
│ "Bắt đầu một tài liệu mới"                          [+ Thư viện mẫu]      │
│ [ ☐ Tài liệu trống + ] [ Mẫu báo cáo ] [ Mẫu CV ] [ ... ]  → TemplateStrip│
├─────────────────────────────────────────────────────────────────────────┤
│ Thống kê: [📄 12 file] [💾 1.2 MB] [⭐ 3 ghim] [🕓 2 phút trước]        │ ← StatsCards
├─────────────────────────────────────────────────────────────────────────┤
│ [ Gần đây | Đã ghim | Thùng rác ]            [Sắp xếp ▾] [☰/▦ toggle]   │ ← FileTabs + FileToolbar
├─────────────────────────────────────────────────────────────────────────┤
│  ⊞ Tên tài liệu          | Sửa lần cuối | Mở gần nhất | ⭐ | ⋮          │
│  ⊞ Roadmap Docs MVP      | Hôm nay     | 2 phút trước | ☆ | ⋮          │
│  ⊞ Spec tích hợp Auth    | Hôm qua     | 3 giờ trước  | ☆ | ⋮          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Nguyên tắc UX (Google Workspace home + best practices)

1. **Default tab = Gần đây** (sắp theo `lastOpenedAt`). Đếm "N tài liệu" cạnh tab.
2. **Create 1-click**: card "Trống" trong template strip tạo file + điều hướng `/edit/:id`. Template mẫu để trống khung (dựng sau).
3. **Search**: lọc client-side ngay, áp trong tab đang active; kết quả rỗng → empty state có nút "Xóa tìm kiếm". Vị trí: TopBar (như Google).
4. **Sort**: Mở gần nhất (default) | Sửa gần nhất | Tên A-Z. Dropdown Base UI.
5. **List/Grid toggle**: list = bảng (default, scan nhiều file), grid = card ảnh thu nhỏ. Lưu preference `localStorage`.
6. **Row actions**: hover/focus hiện ⭐ + ⋮. Menu ⋮ (Base UI Menu): Đổi tên | Tạo bản sao | ⭐/bỏ ⭐ | Chuyển vào thùng rác. Trong tab Trash: Khôi phục | Xóa vĩnh viễn.
7. **Rename**: inline trên ô tên (double-click hoặc qua menu), Enter lưu / Esc hủy.
8. **Duplicate**: `id` mới, title = "Bản sao của <title>", giữ nguyên content/pageSetup, ở lại home.
9. **Delete**: soft-delete (`deletedAt`), file về tab Trash. Xóa vĩnh viễn → **Base UI Dialog xác nhận** (thay `window.confirm` hiện tại).
10. **Empty states**: chưa có file → CTA lớn; thùng rác rỗng → dòng nhạt "Thùng rác trống".
11. **Time relative**: "2 phút trước", "Hôm qua" — `Intl.RelativeTimeFormat('vi-VN')`.
12. **Loading**: skeleton rows khi IndexedDB đọc async.
13. **A11y**: `role=tablist/tab`, bảng dùng `grid` roles, row keyboard focus + Enter mở, focus quản lý trong dialog. WCAG AA.
14. **StatsCards** nhỏ gọn, không lấn nội dung: tổng file, dung lượng đã dùng, số ghim, sửa gần nhất. Đọc storage qua `navigator.storage.estimate()` (IndexedDB thật, không phải `JSON.stringify` như code cũ).

### Màu phân biệt loại file (token mở rộng)

Google: docs=xanh, sheets=lục, slides=cam. iNET chỉ có green (brand) + orange. Đề xuất thêm 3 token semantic trong `packages/ui-kit/src/tokens.css`:

```
--o-kind-docs:   var(--o-primary);  /* xanh iNET */
--o-kind-sheets: var(--info);       /* #0582d4 xanh dương — tách khỏi docs */
--o-kind-slides: var(--o-accent);   /* cam */
```

`kind` gắn `accentVar` để list/grid có icon màu phân biệt — cần thiết khi mixed list (drive-like sau này), tránh phải đổi token về sau. Chi phí: 3 dòng CSS.

## Kiến trúc component (package dùng chung — lõi tái dùng)

```
packages/app-shell/src/            ← mới
  ShellLayout.tsx                  khung: TopBar + children
  TopBar.tsx                       hamburger, logo + product switcher, search, theme, avatar
  ProductSwitcher.tsx              Docs/Sheets/Slides dropdown (app chưa có → disabled)

packages/file-home/src/            ← mới
  FileHome.tsx                     trang ghép: TemplateStrip + StatsCards + FileTabs
                                   + FileToolbar + FileList/Grid + empty states
  TemplateStrip.tsx                "Bắt đầu một ..." + card Trống/template
  StatsCards.tsx
  FileTabs.tsx                     Gần đây | Đã ghim | Thùng rác
  FileToolbar.tsx                  sort + view toggle
  FileList.tsx / FileGrid.tsx
  FileRowMenu.tsx                  Base UI Menu: rename/duplicate/star/trash/restore/delete
  ConfirmDialog.tsx                Base UI Dialog xác nhận destructive
  EmptyStates.tsx
  types.ts                         FileRecord · ProductConfig · FileSort · FileView

packages/ui-kit/src/               ← mở rộng
  tokens.css                       3 token --o-kind-* (trên)
  icons.tsx                        icon theo kind (FileText/Spreadsheet/Presentation)
```

### Hợp đồng tái dùng (`ProductConfig`)

```ts
interface ProductConfig {
  kind: 'docs' | 'sheets' | 'slides';
  name: string;                        // "Docs"
  createLabel: string;                 // "Tạo tài liệu mới"
  startLabel: string;                  // "Bắt đầu một tài liệu mới"
  blankLabel: string;                  // "Tài liệu trống"
  editorPath: (id: string) => string;  // `/edit/${id}`
  accentVar: string;                   // 'var(--o-kind-docs)'
  templates: { id: string; label: string }[];
}
```

Sheets/Slides sau này chỉ cần truyền config + store riêng — FileHome 100% kind-agnostic. Đây là câu trả lời DRY cho yêu cầu "tái dùng".

## Thay đổi ở apps/docs

1. **Model `DocRecord`** (types.ts) thêm: `kind: 'docs'` (mặc định, để sẵn cho tương lai), `createdAt`, `lastOpenedAt`, `starred: boolean`, `deletedAt: string | null`. Migration: storage.ts default `starred=false, deletedAt=null, createdAt=lastOpenedAt=updatedAt, kind='docs'`.
2. **Router**: thêm `react-router-dom`. `App.tsx` tách:
   - `HomePage` — mount `<FileHome kind="docs" .../>`
   - `EditorPage` — chuyển nội dung App hiện tại, route `/edit/:id`, mở file set `lastOpenedAt`.
3. **`useDocs`** mở rộng action: `star(id)`, `rename(id,title)`, `duplicate(id)`, `trash(id)`, `restore(id)`, `deleteForever(id)`, `markOpened(id)`; expose `files` cho home.
4. **Back button** trong editor quay về `/` (thay sidebar "‹"). Giữ sidebar "Document tabs" cho đa-tài-liệu trong editor — không bỏ, chỉ thêm lối vào home.
5. **Storage stats**: chuyển sang `navigator.storage.estimate()`.

## Cân nhắc triển khai & rủi ro

| Rủi ro | Mitigate |
|---|---|
| **Tailwind + package workspace**: Vite phải quét CSS của `packages/` để gen utility class | Cấu hình Tailwind v4 (`@tailwindcss/vite`) `@source` trỏ `../../packages` — kiểm tra ngay spike đầu |
| **Migration dữ liệu cũ** thiếu field mới | Default an toàn khi map trong storage.ts; không phá content cũ |
| **Editor đang SCSS/tiptap-ui-primitive**, home Tailwind — lệch style nhất thời | Q11 đã lên kế hoạch migrate M1; home viết Tailwind native ngay, editor migrate sau, cả 2 dùng chung token `--o-*` nên không lệch màu |
| Refactor App.tsx → router gây regression editor | Giữ nguyên EditorPage logic; chỉ thay đổi lớp mount. Chạy lại typecheck + lint |
| Quota 5MB localStorage (code cũ) | IndexedDB đã có (storage-adapter); dashboard đọc storage thật, thẻ quota dùng estimate |
| Việt hóa chưa nhất quán (bỏ dấu rải rác trong code) | Text UI mới viết có dấu chuẩn; không làm mới văn bản editor cũ (ngoài phạm vi) |

## Tiêu chí nghiệm thu

1. Từ home mở file ≤ 2 click (mở /edit/:id đúng, `lastOpenedAt` cập nhật).
2. Editor không regression: tạo/sửa/đổi tên/xóa vẫn chạy, typecheck + lint pass.
3. Search + sort + tabs (Gần đây/Đã ghim/Thùng rác) lọc đúng dữ liệu IndexedDB.
4. Trash: soft-delete → khôi phục → xóa vĩnh viễn đúng; confirm dialog thay `window.confirm`.
5. `ProductConfig` thứ hai (vd kind demo 'sheets') mount được vào 1 route test → chứng minh tái dùng, render đúng icon/màu/label.
6. 100 file render < 100ms lọc client-side; skeleton hiện khi load.
7. A11y: tablist/tab, focus quản lý dialog, keyboard mở file — WCAG AA.

## Bước tiếp

1. `/ck:plan` cho giai đoạn này (Home Dashboard) nếu anh muốn triển khai — đính kèm report này làm context.
2. Spike nhỏ trước: Tailwind `@source` quét `packages/` + Base UI Menu/Dialog trong package — xác nhận build trước khi viết hàng loạt.
3. Triển khai thứ tự: tokens → `app-shell` TopBar → `file-home` (model + tabs + list) → Router tách Home/Editor → Trash + duplicate → stats → test.

Phạm vi ngoài: template gallery thật (mẫu nội dung), mixed-kind drive view, cloud sync, apps/shell deployable — làm ở Phase 8 khi có sheets/slides.
