# Brainstorm: Khảo sát Univer cho Giai đoạn 6 (Sheets)

Date: 2026-08-18
Status: Chốt — chờ duyệt tạo implementation plan

## 1. Problem statement

`apps/sheets` đang trống hoàn toàn, `packages/xlsx-io` mới là placeholder. Roadmap Giai đoạn 6 (Tháng 11–15) chốt nền tảng là **Univer OSS + xlsx-io (ExcelJS) + echarts**, nhưng kèm điều kiện bắt buộc: **tuần 1 khảo sát** đo khoảng cách giữa Univer bản mở vs bản Pro trước khi đầu tư sâu (rủi ro R4, quyết định mục 12 roadmap).

Mục tiêu giai đoạn này: **không code sản phẩm**, chỉ khảo sát + prototype chạy thật + báo cáo go/no-go + đề xuất phạm vi MVP Sheets.

## 2. Requirements (đã chốt với anh)

| #   | Yêu cầu                                                                          | Giá trị               |
| --- | -------------------------------------------------------------------------------- | --------------------- |
| R1  | Chỉ khảo sát Univer trước, không implement sản phẩm                              | Anh chọn              |
| R2  | Khảo sát trên **v0.23.0 stable** + ngó 1.0-alpha.7 để chuẩn bị migration         | Anh chọn              |
| R3  | Mức độ sâu: **prototype chạy thật + report** (không chỉ đọc docs)                | Anh chọn              |
| R4  | Ràng buộc **cứng**: bản mở 100%, không Pro, không AGPL                           | Anh chọn + roadmap C2 |
| R5  | Cộng tác Yjs: chỉ đánh giá khả năng ràng buộc, không implement                   | Anh chọn              |
| R6  | Lưu trữ MVP sau này: `storage-adapter` + IndexedDB (đã có driver)                | Anh chọn              |
| R7  | Giao diện: dùng UI Univer mặc định, chỉ nhúng app-shell + theme iNET cơ bản      | Anh chọn              |
| R8  | Đầu ra: report khoảng cách tính năng + quyết định go/no-go + đề xuất phạm vi MVP | Anh chọn              |

## 3. Phát hiện chính từ research (08/2026)

### 3.1 Univer OSS vs Pro — đường phân chia rất rõ

Bản OSS (Apache-2.0, repo `dream-num/univer`, 14K★) có:

- Sheets core: workbook/worksheet/ranges/selection, formula engine, number formatting, filter/sort, data validation, conditional formatting, notes, hyperlinks, comments, find & replace, tables, drawing.
- Plugin-first, presets (`@univerjs/preset-sheets-*`), Facade API, canvas rendering, headless Node.js, dark mode, theming.

**Pro-only** (cần Univer server + Univer Commercial License):

- **Import/export xlsx** (qua server exchange API) — bản mở không có chiều nào.
- **Charts** (bản Pro dùng echarts bên trong), pivot tables, sparklines, outlines, shapes, in-cell graphics, data connectors.
- **Collaboration thời gian thực** (OT, 200+ users), edit history, server-side calculation.

### 3.2 Version

- Hiện tại `v0.23.0` (05/2026) — bản chính thức, presets đầy đủ.
- `1.0.0-alpha.7` (07/2026) — đang tiến tới 1.0, **chưa stable**. Không dùng cho production.
- Kết luận khảo sát: dùng v0.23, theo dõi changelog 1.0.

### 3.3 Charts

- Pro dùng echarts (Apache-2.0) — xác nhận hướng roadmap dùng echarts thay thế.
- Community có `xxs3315/univer-chart-plugin` (echarts-based, float chart) nhưng cũ (2024), chưa migrate sang sheets-drawing-ui → **cần đánh giá trong khảo sát**, không dùng mù.

### 3.4 Collaboration

- Không có binding Yjs OSS công khai cho Univer Sheets. Chỉ có `@univerjs-pro/collaboration*` (commercial).
- Tự ràng buộc Yjs vào Univer = dự án lớn (phải translate changeset → Y.Doc). → **Xác nhận hoãn**, roadmap đúng.

### 3.5 Xác nhận quan trọng

- `xlsx-io` tự xây bằng **ExcelJS** (MIT) là bắt buộc, không có lựa chọn — Univer OSS không import/export xlsx.
- HyperFormula: roadmap ghi cần kiểm chứng license — xếp vào khảo sát, nhưng formula engine OSS của Univer đã mạnh (v0.23 giảm 15.7% thời gian tính 500K formula), khả năng **không cần**.

## 4. Các phương án đã cân nhắc

### 4.1 Phạm vi giai đoạn này

| Phương án                                                         | Pros                                                                                                           | Cons                                           | Kết luận    |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ----------- |
| **A. Khảo sát + prototype chạy thật**                             | Có dữ liệu thật (bundle, load time, gap tính năng); quyết định go/no-go có căn cứ; giống tuần khảo sát roadmap | Tốn ~5–8 ngày                                  | ✅ **Chọn** |
| B. Chỉ đọc docs + bảng so sánh                                    | Nhanh nhất                                                                                                     | Không đo được hiệu năng/UX thật; rủi ro bỏ sót | ❌          |
| C. So sánh nhiều engine (Luckysheet, Handsontable, x-spreadsheet) | Toàn diện                                                                                                      | Roadmap đã chốt Univer; lãng phí thời gian     | ❌          |

### 4.2 Cộng tác

| Phương án                        | Pros                              | Cons                                                                      | Kết luận    |
| -------------------------------- | --------------------------------- | ------------------------------------------------------------------------- | ----------- |
| Hoãn Yjs (chỉ đánh giá khả năng) | Đúng roadmap, tránh phình phạm vi | Chưa giải quyết được từ giờ                                               | ✅ **Chọn** |
| Làm Yjs ngay                     | —                                 | Không có binding sẵn, ràng buộc changeset → Y.Doc là dự án 4–6 tuần riêng | ❌          |

### 4.3 Giao diện

| Phương án                                          | Pros                      | Cons                                    | Kết luận            |
| -------------------------------------------------- | ------------------------- | --------------------------------------- | ------------------- |
| UI Univer mặc định + app-shell + theme iNET cơ bản | Nhanh, MVP đúng trọng tâm | R9 (thống nhất giao diện) chưa trọn vẹn | ✅ **Chọn cho MVP** |
| Ghi đè sâu theme Univer                            | Thống nhất ngay           | Tốn thời gian lớn, chưa cần             | ❌ (để sau)         |

## 5. Giải pháp đề xuất (final)

**Tuần khảo sát Univer — 5 bước, ~5–8 ngày:**

1. **Dựng prototype `apps/sheets`** trên Univer v0.23 (preset sheets-core + sheets-ui), đăng ký vào app-shell, theme iNET cơ bản. Verify typecheck/build chạy được.
2. **Thử chiều ĐỌC**: import file xlsx thật qua `@univerjs/sheets-...`? (bản mở) — nếu bản mở không có chiều đọc, đánh giá con đường ExcelJS → snapshot → `univerAPI.loadSnapshot`. **Đây là gap lớn nhất cần đo.**
3. **Đo hiệu năng**: bundle size, thời gian khởi động, load workbook 1k/10k/100k cells, scroll mượt không.
4. **Đánh giá gap tính năng** theo bảng checklist (mục 6) đối chiếu target MVP iNET.
5. **Viết report** + đề xuất phạm vi MVP phase tiếp theo + quyết định go/no-go.

### Checklist khảo sát (đo gap OSS vs target)

| Nhóm                                                                | Target iNET (giả định MVP) | Univer OSS v0.23      | Kết luận khảo sát              |
| ------------------------------------------------------------------- | -------------------------- | --------------------- | ------------------------------ |
| Edit cơ bản + formula                                               | ✅                         | ✅ Có                 | Cần kiểm chứng loại formula    |
| Number format, filter/sort, data validation, conditional formatting | ✅                         | ✅ Có                 | —                              |
| Hyperlink, comment, find & replace, notes, tables                   | ✅                         | ✅ Có                 | —                              |
| **Import/export .xlsx**                                             | ✅                         | ❌ **Pro-only**       | **Bắt buộc xlsx-io (ExcelJS)** |
| **Charts**                                                          | ✅                         | ❌ Pro-only (echarts) | Community plugin hoặc tự build |
| **Print/PDF**                                                       | tuỳ phạm vi                | ❌ Pro-only           | Quyết lại scope                |
| **Collaboration**                                                   | hoãn                       | ❌ Pro-only           | Hoãn, không khảo sát sâu       |
| **Pivot**                                                           | tuỳ phạm vi                | ❌ Pro-only           | Quyết lại scope                |
| i18n                                                                | ✅                         | ✅ Có locale          | Kiểm chứng VN/EN               |
| Dark mode                                                           | ✅                         | ✅ Có                 | —                              |

## 6. Implementation considerations & risks

- **Rủi ro lớn nhất: chiều đọc xlsx của bản mở.** Nếu bản mở không nhập được xlsx trực tiếp, phải xây pipeline `ExcelJS → Univer snapshot` từ sớm — chính là `xlsx-io`, phải xác nhận format snapshot `IWorkbookData` của Univer tương thích.
- **Bundle size**: Univer presets nặng (canvas engine + core). Cần đo, xét lazy-load/chunks.
- **Version drift**: 1.0-alpha đang ra nhanh. Khóa v0.23 cho prototype; theo dõi changelog, ghi migration notes.
- **Cộng đồng chart plugin cũ** → không chốt charts vào MVP nếu plugin không ổn định; đề xuất hoãn charts sang phase sau.
- Tuân thủ AGENTS.md: prototype trong `apps/sheets` dùng path alias `@/*`, file suffix convention, arrow function, ≤400 dòng/file.
- `xlsx-io` hiện chỉ là placeholder — prototype sẽ chạm tới, xác định phạm vi tối thiểu cần mở rộng.

## 7. Success metrics & validation criteria

- Prototype `apps/sheets` chạy được: tạo workbook, nhập 10k cells, scroll mượt, `pnpm --filter @office/sheets typecheck && build` pass.
- Bảng gap tính năng hoàn tất, mỗi mục có trạng thái rõ (OSS có / phải tự làm / hoãn).
- Có quyết định go/no-go cho Univer OSS + lý do.
- Có phạm vi MVP Sheets đề xuất (tính năng nào trong, nào hoãn, thứ tự ưu tiên).
- Đánh giá chiều đọc xlsx: xác nhận con đường `ExcelJS → snapshot → load` khả thi.

## 8. Next steps & dependencies

- **Dependency**: cài `@univerjs/core` `@univerjs/sheets` `@univerjs/sheets-ui` + presets (v0.23); `exceljs`; `@office/app-shell`, `@office/i18n`, `@office/storage-adapter` đã có.
- **Chặng 1**: dựng prototype sheets (0.5–1 ngày).
- **Chặng 2**: khảo sát chiều đọc xlsx + pipeline ExcelJS (1–2 ngày).
- **Chặng 3**: đo hiệu năng + checklist gap (1–2 ngày).
- **Chặng 4**: report + đề xuất MVP + go/no-go (1 ngày).
- **Sau khi anh duyệt**: tạo implementation plan chi tiết (phases, effort) trong `plans/260818-sheets-survey/plan.md`.
