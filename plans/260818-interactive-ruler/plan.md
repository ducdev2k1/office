# Kế hoạch Triển khai: Hệ thống Thước kẻ Tương tác (Interactive Ruler) chuẩn Google Docs & Sửa lỗi Console

## 1. Mục tiêu
1. **Sửa dứt điểm 2 lỗi console**:
   - Vòng lặp re-render vô hạn (`Maximum update depth exceeded` tại `EditorPage.tsx:95` do thiếu `useCallback` trong `useDocs.ts`).
   - Cảnh báo trùng lặp extension TipTap (`Duplicate extension names found: ['link', 'underline']` trong `useDocsEditor.ts`).
2. **Xây dựng hệ thống Thước kẻ Tương tác Đa năng (Horizontal & Vertical Rulers)** chuẩn 100% trải nghiệm Google Docs:
   - **Thước ngang (Horizontal Ruler)**: Kéo đổi lề trái/phải trang giấy + 3 con trỏ kéo thụt lề đoạn (First Line Indent, Left Indent, Right Indent).
   - **Thước dọc (Vertical Ruler)**: Đặt bên trái trang giấy trong Paged View, kéo đổi lề trên/dưới (Top/Bottom Margins).
   - **Đường gióng dẫn hướng (Guide Lines)** + Tooltip hiển thị số đo chính xác theo thời gian thực khi kéo.
   - **Chuyển đổi đơn vị đo**: Hỗ trợ linh hoạt Centimet (cm) và Inch (in).
   - Đồng bộ dữ liệu realtime với `DocRecord.pageSetup.margins` và TipTap Node Attributes.

---

## 2. Phân chia các Giai đoạn (Phases)

### 🔹 Phase 0: Khắc phục lỗi Console & Ổn định State Core
- **Nhiệm vụ**:
  - `useDocs.ts`: Bọc toàn bộ các action functions (`setActiveId`, `markOpened`, `updateDoc`, `updateContent`, `updateTitle`, `addDoc`, `deleteDoc`, `star`, `rename`, `duplicate`, `trash`, `restore`, `deleteForever`, `setActiveDocPageSetup`) bằng `useCallback` để đảm bảo ổn định reference, triệt tiêu vòng lặp re-render vô hạn.
  - `useDocsEditor.ts`: Rà soát danh sách TipTap extensions, cấu hình `StarterKit.configure({ ... })` để tránh đăng ký trùng lặp `link` và `underline`.
- **Tiêu chí hoàn thành**:
  - Console sạch 100%, không còn warning hay error `Maximum update depth exceeded`.

---

### 🔹 Phase 1: TipTap Indent Extension & Ruler Geometry Engine
- **Nhiệm vụ**:
  - Tạo TipTap extension `indent.extension.ts`:
    - Thêm các attributes `firstLineIndent`, `leftIndent`, `rightIndent` (đơn vị mm / px) cho các nodes `paragraph`, `heading`, `blockquote`.
    - Hỗ trợ render CSS style tương ứng (ví dụ: `text-indent`, `margin-left`, `margin-right` hoặc `padding-left`).
    - Cung cấp commands `setFirstLineIndent`, `setLeftIndent`, `setRightIndent`, `resetIndent`.
  - Tạo bộ tính toán hình học `ruler.utils.ts`:
    - Hàm chuyển đổi qua lại giữa `mm`, `cm`, `in`, `px` theo DPI chuẩn (96 DPI).
    - Hàm tính toán tọa độ vạch chia (ticks: 1mm, 5mm, 10mm / 1/8in, 1/4in, 1/2in, 1in).
    - Logic snap-to-grid (bước nhảy 1mm hoặc 0.05in) và ràng buộc giới hạn (min/max boundary) để không kéo lề vượt quá khổ giấy.
  - Hook tương tác `useRuler.ts`:
    - Xử lý Pointer Events (`pointerdown`, `pointermove`, `pointerup`, `setPointerCapture`) chống giật lag.
    - Quản lý trạng thái kéo: `draggingTarget` (`left-margin`, `right-margin`, `top-margin`, `bottom-margin`, `first-line-indent`, `left-indent`, `right-indent`), vị trí hiện tại, giá trị hiển thị trên tooltip.
- **Tiêu chí hoàn thành**:
  - Chuyển đổi kích thước và TipTap indent commands hoạt động chuẩn xác.

---

### 🔹 Phase 2: Xây dựng UI Components Thước kẻ Tương tác
- **Nhiệm vụ**:
  - `HorizontalRuler.tsx`:
    - Thước ngang nằm trên đầu trang giấy, căn khớp tuyệt đối với chiều rộng khổ giấy (`paperWidthPx`).
    - Vùng xám 2 bên thể hiện lề trái & lề phải (`leftMargin`, `rightMargin`), ranh giới kéo lề có icon con trỏ `ew-resize`.
    - 3 con trỏ kéo Indent màu xanh dương Google Docs:
      - Hình chữ nhật nhỏ: **First Line Indent**.
      - Hình tam giác trỏ xuống bên dưới: **Left Indent** (kéo sẽ di chuyển đồng thời cả First Line Indent).
      - Hình tam giác trỏ xuống bên phải: **Right Indent**.
  - `VerticalRuler.tsx`:
    - Thước dọc hiển thị dọc theo chiều cao trang giấy (Paged View).
    - Vùng xám trên/dưới thể hiện lề trên & lề dưới (`topMargin`, `bottomMargin`), ranh giới kéo lề có con trỏ `ns-resize`.
  - `RulerGuideLine.tsx`:
    - Đường nét đứt xanh mờ (`GuideLine`) bao trùm toàn trang khi người dùng đang kéo.
    - Tooltip nổi (`RulerTooltip`) đi theo con trỏ chuột thể hiện số đo chính xác (ví dụ `2.5 cm` hoặc `1.0 in`).
  - Tích hợp công tắc đổi đơn vị (`cm` ↔ `in`) và lưu preference vào `localStorage`.
- **Tiêu chí hoàn thành**:
  - Giao diện thước kẻ sắc nét, pixel-perfect, chuẩn styling theo cả Light Mode và Dark Mode.

---

### 🔹 Phase 3: Tích hợp Realtime vào EditorPage & Đồng bộ Phân trang
- **Nhiệm vụ**:
  - Thay thế `div.ruler` tĩnh cũ trong `EditorPage.tsx` bằng bộ `HorizontalRuler` và `VerticalRuler`.
  - Kết nối sự kiện thay đổi lề trang với `setActiveDocPageSetup({ margins: nextMargins })` và kích hoạt `schedulePagination(true)` để trang giấy tự động tính toán lại ngắt trang realtime.
  - Kết nối sự kiện kéo Indent với TipTap editor:
    - Khi selection / con trỏ thay đổi: Ruler tự động đọc indent của paragraph hiện tại và di chuyển các con trỏ xanh về đúng vị trí.
    - Khi kéo con trỏ xanh trên thước: Áp dụng indent trực tiếp vào đoạn văn bản đang được chọn.
- **Tiêu chí hoàn thành**:
  - Kéo thước ngang ➔ lề và thụt dòng thay đổi mượt mà.
  - Kéo thước dọc ➔ lề trên/dưới thay đổi, trang giấy phân trang lại tức thì.

---

### 🔹 Phase 4: Hoàn thiện (Polish), Đa ngôn ngữ (i18n) & Kiểm thử
- **Nhiệm vụ**:
  - Thêm nhãn tooltip đa ngôn ngữ vào từ điển i18n (`vi/docs.json` và `en/docs.json`): `ruler.leftMargin`, `ruler.rightMargin`, `ruler.topMargin`, `ruler.bottomMargin`, `ruler.firstLineIndent`, `ruler.leftIndent`, `ruler.rightIndent`, `ruler.unit`.
  - Kiểm tra `pnpm typecheck`, `pnpm build`, `pnpm format:check`.
  - Kiểm thử tương thích responsive trên các độ phân giải màn hình khác nhau.
- **Tiêu chí hoàn thành**:
  - Toàn bộ 13 packages pass 100%, không còn bất kỳ cảnh báo console nào.

---

## 3. Danh sách Files sẽ tạo & chỉnh sửa

```text
apps/docs/src/
├── hooks/
│   └── useDocs.ts                                    # [Phase 0] Thêm useCallback cho các methods
├── modules/editor/
│   ├── hooks/
│   │   └── useDocsEditor.ts                          # [Phase 0] Tối ưu hóa extensions không bị duplicate
│   └── extensions/
│       └── indent.extension.ts                       # [Phase 1] TipTap Paragraph/Heading Indent Extension
├── components/ruler/
│   ├── HorizontalRuler.tsx                           # [Phase 2] Thước ngang tương tác
│   ├── VerticalRuler.tsx                             # [Phase 2] Thước dọc tương tác
│   ├── RulerGuideLine.tsx                            # [Phase 2] Đường gióng & tooltip
│   ├── ruler.utils.ts                                # [Phase 1] Math, units, ticks & boundary clamping
│   └── useRuler.ts                                   # [Phase 1] PointerCapture hook
├── pages/
│   └── EditorPage.tsx                                # [Phase 3] Tích hợp thước ngang & thước dọc
└── styles/
    └── _ruler.scss (hoặc CSS module / Tailwind)      # [Phase 2] Styling thước kẻ, markers & guidelines
packages/i18n/src/locales/
├── vi/docs.json                                      # [Phase 4] i18n keys cho thước kẻ
└── en/docs.json                                      # [Phase 4] i18n keys cho thước kẻ
```
