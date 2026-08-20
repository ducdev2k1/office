# Báo cáo khảo sát Univer v0.23 OSS — Giai đoạn 6 (Sheets)

Date: 2026-08-19
Status: Hoàn tất khảo sát — chờ duyệt go/no-go
Plan: `plans/260818-sheets-survey/plan.md`

## 1. Tóm tắt điều hành

Prototype `apps/sheets` chạy được trên **Univer v0.23 OSS (Apache-2.0)**, đã xác nhận pipeline **nhập xlsx tự xây bằng ExcelJS → `IWorkbookData` → `univerAPI.createWorkbook`** hoạt động end-to-end với 3 file mẫu (600 → 400K cells). Bundle nặng (1.97 MB gzip chính + 186 KB icons) nhưng có hướng tối ưu rõ. **Khuyến nghị: GO**, với phạm vi MVP giới hạn và hoãn charts/export/print sang phase sau.

## 2. Kết quả Phase 1 — Prototype chạy thật

- `apps/sheets` scaffold đúng pattern `apps/docs` (Vite + React 19 + Tailwind + path alias `@/*`).
- Nhúng app-shell (`ShellLayout` + `TopBar`) + i18n namespace `sheets` (VI/EN) + theme iNET light/dark.
- `pnpm --filter @office/sheets typecheck` ✅, `build` ✅, dev server HTTP 200 ✅.
- Smoke test (Puppeteer + Chrome headless): mở page, chọn file xlsx, **3 sheet render đúng, 0 lỗi console/HTTP**.

### 2.1 Bug dependency phải xử lý

`@univerjs/design@0.23.0` và `@univerjs/ui@0.23.0` đều khai `@univerjs/icons: ^1.2.0` nhưng yêu cầu **hai tập icon khác nhau** (design cần `DropdownIcon` ở 1.2.x–1.15.x; ui cần `EyeOutlineIcon`/`MoreFunctionIcon` chỉ có ở bản mới hơn). Không version nào export đủ toàn bộ nếu resolve `^`.

**Giải pháp đã áp dụng**: pin `pnpm.overrides["@univerjs/icons"] = "1.2.0"` — đã xác minh qua script quét 188 icon import thật từ node_modules rằng 1.2.0 export đủ 100%. (Kịch bản `1.15.0` thiếu `MoreFunctionIcon`; `1.35.0` thiếu `DropdownIcon`.)

> ⚠️ Đây là dấu hiệu **quality gate phát hành lỏng** của Univer — cần ghi vào migration notes, rủi ro khi nâng version.

## 3. Kết quả Phase 2 — Pipeline nhập xlsx (chiều ĐỌC)

Univer OSS **không có chiều đọc xlsx** (Pro-only qua server exchange). Đã xác nhận con đường tự xây khả thi:

```
File .xlsx → ExcelJS (MIT) parse → exceljsToUniver (apps/sheets/src/utils) → IWorkbookData → univerAPI.createWorkbook()
```

Converter map được (kiểm chứng qua output thật):

- **Giá trị ô**: number/string/boolean/formula/richText/error/hyperlink/date → `{v, t, f}` đúng `CellValueType`.
- **Style**: font (bold/italic/size/name/underline/color), fill pattern, border 4 cạnh (map `BorderStyleTypes`), alignment (h/v/wrap), number format → dedup về `styles` map dùng chung (3 style id cho 400K cell file).
- **Merge cells**: parse range string `A1:C1` → `IRange` (chú ý `endRow/endColumn` **exclusive** trong Univer).
- **Row/column size**, nhiều sheet, sheet order.

### 3.1 Hiệu năng pipeline (đo thật bằng Node + ExcelJS)

| File         | Kích thước | Cells | Parse (ms) | Convert (ms) | Tổng (ms) |
| ------------ | ---------- | ----- | ---------- | ------------ | --------- |
| sample-small | 11 KB      | 600   | 28         | 3            | 44        |
| sample-med   | 160 KB     | 30K   | 104        | 35           | 169       |
| sample-large | 1.9 MB     | 400K  | 1223       | 140          | 1363      |

→ Parse ExcelJS chiếm ~90% thời gian; convert (tạo snapshot) rất nhẹ. 400K cells ~1.4s là chấp nhận được cho MVP, có thể thêm progress UI.

### 3.2 Render trong trình duyệt (Puppeteer + Chrome)

- Initial load app: ~800–940 ms, heap ~61–66 MB, 100 resources, ~18 MB transferred (dev, chưa minify).
- Load + render file 30K cells: **≤ 3.5s** (gồm 3s chờ render), heap tăng lên ~100 MB.
- Render theo **viewport (canvas)** — chỉ dựng ô nhìn thấy, không crash với 400K cells.

## 4. Kết quả Phase 3 — Bundle size & checklist gap

### 4.1 Bundle size (build production)

| Chunk                                 | Raw                | Gzip    | Ghi chú                      |
| ------------------------------------- | ------------------ | ------- | ---------------------------- |
| index (Univer core + ExcelJS + React) | 6.94 MB            | 1.97 MB | Chunk chính                  |
| icons                                 | 2.36 MB            | 186 KB  | `@univerjs/icons`            |
| ~50 locale chunks                     | 0.5–765 KB mỗi cái | —       | Univer bundle toàn bộ locale |

Vite cảnh báo chunk >500 KB. **Hướng tối ưu (MVP)**: dynamic import Univer theo route, `manualChunks` tách ExcelJS, giới hạn locale (chỉ EN + VI). Chưa làm trong phạm vi khảo sát.

### 4.2 Checklist gap OSS vs target iNET (đã kiểm chứng trên prototype)

| Nhóm                                                                | Target iNET (giả định MVP) | Univer OSS v0.23 | Kết luận khảo sát                                      |
| ------------------------------------------------------------------- | -------------------------- | ---------------- | ------------------------------------------------------ |
| Edit cơ bản + formula                                               | ✅                         | ✅               | Có formula engine riêng                                |
| Number format, filter/sort, data validation, conditional formatting | ✅                         | ✅               | Có (UI thấy trong toolbar)                             |
| Hyperlink, comment, find & replace, notes, tables                   | ✅                         | ✅               | Có                                                     |
| **Import .xlsx**                                                    | ✅                         | ❌ Pro-only      | **Bắt buộc xlsx-io (ExcelJS)** — đã chứng minh khả thi |
| **Export .xlsx**                                                    | ✅                         | ❌ Pro-only      | Cần `univerAPI.save()` → ExcelJS reverse               |
| **Charts**                                                          | tuỳ phạm vi                | ❌ Pro-only      | Community plugin cũ (2024); **hoãn**                   |
| **Print/PDF**                                                       | tuỳ phạm vi                | ❌ Pro-only      | Hoãn, xét html2canvas sau                              |
| **Collaboration**                                                   | hoãn                       | ❌ Pro-only      | Hoãn (Yjs binding tự làm = 4–6 tuần)                   |
| **Pivot**                                                           | tuỳ phạm vi                | ❌ Pro-only      | Hoãn                                                   |
| i18n                                                                | ✅                         | ✅               | Có locale EN/VI                                        |
| Dark mode                                                           | ✅                         | ✅               | Có                                                     |

## 5. Quyết định & đề xuất phạm vi MVP (Phase 4)

### 5.1 Go/No-Go: **GO** (có điều kiện)

**Lý do GO**:

1. OSS Apache-2.0 đúng ràng buộc R4 (100% bản mở).
2. Pipeline xlsx chiều đọc hoạt động thật, hiệu năng chấp nhận được.
3. UI/UX đầy đủ cho spreadsheet cơ bản, canvas rendering scale tốt.
4. Cộng đồng lớn (14K★), phát triển tích cực, 1.0 đang tiến tới.

**Điều kiện kèm theo**:

- C1: Xác nhận license còn Apache-2.0 ở version mình dùng (khóa v0.23, theo dõi 1.0).
- C2: Pin `@univerjs/icons@1.2.0` (bug dependency) — ghi vào AGENTS.md/migration notes.
- C3: Export xlsx là công việc bắt buộc ngay (chiều ghi), trước khi hứa hẹn tính năng.
- C4: Charts/print/pivot hoãn — không hứa trong MVP.

### 5.2 Phạm vi MVP Sheets đề xuất (phase tiếp theo)

**Trong MVP** (thứ tự ưu tiên):

1. Sheet editor cơ bản (đã có qua Univer OSS).
2. Import .xlsx (xlsx-io: ExcelJS → snapshot) — **đã chứng minh**.
3. Export .xlsx (xlsx-io: snapshot → ExcelJS) — cần xây.
4. Formula cơ bản + number format + filter/sort + data validation (Univer OSS có sẵn).
5. Lưu trữ IndexedDB qua `storage-adapter` (lưu `IWorkbookData` dạng JSON).

**Hoãn sang phase sau**: charts, print/PDF, pivot, collaboration, import/export nâng cao (charts, images).

### 5.3 Rủi ro còn lại

| Rủi ro                                               | Mức        | Giảm thiểu                                                    |
| ---------------------------------------------------- | ---------- | ------------------------------------------------------------- |
| Version drift (1.0-alpha ra nhanh)                   | Trung bình | Khóa v0.23; theo dõi changelog; pin overrides                 |
| Bundle 1.97 MB gzip                                  | Trung bình | Lazy-load Univer, manualChunks, giới hạn locale               |
| Export xlsx phải tự xây (reverse snapshot → ExcelJS) | Trung bình | Ưu tiên làm ngay trong phase sau; format/style đơn giản trước |
| License drift khi lên 1.0                            | Thấp       | Verify trước mỗi upgrade                                      |

## 6. Files sinh ra trong khảo sát

```
apps/sheets/src/
├── components/SheetEditor.tsx      # wrapper Univer
├── hooks/useUniver.ts              # init Univer + createWorkbook
├── hooks/useTheme.ts               # theme light/dark
├── pages/EditorPage.tsx            # app-shell + nút Open XLSX
├── services/xlsx.service.ts        # parseXlsxFile (ExcelJS)
├── utils/exceljsToUniver.utils.ts  # ExcelJS → IWorkbookData
├── constants/sheets.constants.ts
└── types/sheets.types.ts, common.types.ts
public/sample-{small,med,large}.xlsx  # file test
scripts/                            # gen-samples, perf-samples, smoke-test, perf-browser
packages/i18n: namespace "sheets" (vi/en)
```

## 7. Next steps

1. Anh duyệt **GO** → tạo implementation plan MVP (xlsx-io mở rộng: import + export).
2. Thêm `@univerjs/icons@1.2.0` pin + ghi chú vào `AGENTS.md`.
3. Đánh giá community chart plugin (nếu muốn charts sớm).
4. Cleanup: giữ `scripts/` (hữu ích cho regression), xóa nếu không cần.
