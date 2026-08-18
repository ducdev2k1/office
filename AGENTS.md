# Project & Coding Rules

## 1. Cấu trúc Dự án (Monorepo Layout)

Dự án được tổ chức theo mô hình **Turborepo + pnpm workspace**:

```text
├── apps/
│   ├── docs/                 # Ứng dụng Docs Web (React 19 + Vite + TipTap + Tailwind CSS)
│   ├── sheets/               # Ứng dụng Sheets Web (Giai đoạn 6)
│   └── slides/               # Ứng dụng Slides Web (Giai đoạn 7)
│
├── packages/
│   ├── app-shell/            # Shell dùng chung: TopBar, ProductSwitcher, ShellLayout
│   ├── auth-sdk/             # OneMail SSO integration (Giai đoạn 4)
│   ├── collab-core/          # Y.Doc & Realtime Collaboration (Giai đoạn 3)
│   ├── docx-io/              # docx ↔ TipTap converter (preserve-and-patch)
│   ├── fidelity-harness/     # Bộ đo chất lượng round-trip OOXML, chạy trong CI
│   ├── file-home/            # File Manager Home dùng chung (FileHome, list/grid, trash, stats)
│   ├── i18n/                 # Đa ngôn ngữ (JSON locales VI/EN, I18nProvider, useTranslation, formatters)
│   ├── ooxml-core/           # Byte-preserving OOXML unpack/repack & part registry
│   ├── pptx-io/              # Fork pptx-viewer wrapper (Giai đoạn 7)
│   ├── storage-adapter/      # Storage driver abstraction (IndexedDB, FileSystemAccess, Drive)
│   ├── ui-kit/               # Design tokens, Icons (iNET), Base UI + shadcn components (Button, Skeleton, Dialog...)
│   └── xlsx-io/              # xlsx ↔ Univer converter qua ExcelJS (Giai đoạn 6)
│
├── docs/                     # Tài liệu kiến trúc, roadmap, báo cáo kỹ thuật
└── plans/                    # Kế hoạch phát triển, implementation plans
```

### Quy tắc Import & Path Alias

- **Trong `apps/docs` (và các apps khác)**:
  - **Bắt buộc dùng Path Alias `@/*`** (trỏ tới `apps/<app-name>/src/*`).
  - **Tuyệt đối không dùng relative import** (`./`, `../`) trong tầng `apps/`.
  - Ví dụ: `import { Header } from '@/components/Header';`, `import type { DocRecord } from '@/types';`.
- **Trong `packages/*`**:
  - Dùng **relative import nội bộ** (`./`, `../`) bên trong mỗi package nhằm đảm bảo tính độc lập và tương thích đa ứng dụng khi các app import source trực tiếp qua workspace exports.

---

## 2. Ngôn ngữ & Cú pháp

- Code viết theo chuẩn **ES7** (ECMAScript 2016) trở lên, sử dụng các tính năng hiện đại: `async/await`, spread/rest operator, destructuring, template literals, optional chaining (`?.`), nullish coalescing (`??`).

---

## 3. Hàm (Functions)

- **Bắt buộc dùng arrow function `() => {}`** cho tất cả các hàm (bao gồm React component, callback, hàm trong object, helper utils).
- **Cấm dùng `function` keyword** trừ khi bất khả kháng (ví dụ: generator function hoặc cần hoist / `this` binding đặc thù).
- Arrow function không có logic phức tạp ưu tiên dạng ngắn gọn: `const fn = () => value;`.

```ts
// Đúng
export const DocumentList = () => {
  const handleClick = () => console.log('clicked');
  return <div onClick={handleClick} />;
};

// Sai
export function DocumentList() {
  function handleClick() {
    console.log('clicked');
  }
  return <div onClick={handleClick} />;
}
```

---

## 4. Tính Bất biến (Immutability)

- Luôn khai báo biến bằng `const`. Không dùng `let` khi không có nhu cầu gán lại giá trị.
- Không mutate trực tiếp object/array, sử dụng immutability update pattern (`...spread`, `map`, `filter`).

---

## 5. UI Components & Design System

- **Ưu tiên sử dụng Shadcn UI & Base UI Primitives**: Tận dụng tối đa các UI component có sẵn từ `@office/ui-kit` (Button, Dialog, Dropdown Menu, Tooltip, Popover, Input, Switch, Tabs, Card, ScrollArea, v.v.).
- **Hạn chế viết lại từ đầu**: Không tự code HTML/CSS thô khi đã có component tương đương từ design system.
- **Tùy biến linh hoạt**: Tùy biến style component qua `className`, `cva` (Class Variance Authority), Tailwind/SCSS tokens mà vẫn giữ nguyên cấu trúc chuẩn và headless logic.
- **Icons**: Sử dụng icon chuẩn iNET Design System (`<Icon name="..." />` từ `@office/ui-kit`) hoặc `lucide-react` cho các app shell controls.

---

## 6. Trạng thái Loading & Skeleton UI

- **Bắt buộc ưu tiên sử dụng Skeleton loader**:
  - Đối với tất cả các trạng thái tải dữ liệu bất đồng bộ (data fetch, danh sách tài liệu, bảng dữ liệu, card preview, sidebar, modal content, panel chi tiết...), **bắt buộc ưu tiên sử dụng Skeleton loader** thay vì dùng spinner tròn hoặc để màn hình trống.
  - Sử dụng component `Skeleton` có sẵn từ `@office/ui-kit` (chuẩn shadcn/ui + Tailwind `animate-pulse`).
  - Skeleton phải mô phỏng chính xác cấu trúc layout, chiều cao (`h-*`), chiều rộng (`w-*`) và khoảng cách (`gap-*`, `padding`) của giao diện thực tế nhằm loại bỏ hiện tượng giật giật/dịch chuyển bố cục (Cumulative Layout Shift - CLS).

---

## 7. Đa ngôn ngữ & i18n

- **Package dùng chung**: Sử dụng `@office/i18n` cho toàn bộ các text giao diện.
- **Dữ liệu dịch**: Lưu dưới dạng file JSON thuần theo namespace (`common.json`, `docs.json`, `app-shell.json`) trong `packages/i18n/src/locales/vi/` và `en/`.
- **Tự động suy diễn type**: Type schema suy diễn trực tiếp 100% từ cấu trúc JSON; đảm bảo mọi key mới thêm vào file Tiếng Việt (`vi`) bắt buộc phải có mặt tương ứng ở Tiếng Anh (`en`).
- **Sử dụng Hook**: Dùng `const { t } = useTranslation('namespace')` trong các React component.

---

## 8. Giới hạn Kích thước File (File Length Limit)

- **Mỗi file code tối đa không vượt quá 400 dòng**:
  - Không viết các file quá dài/monolithic.
  - Khi một file có xu hướng vượt quá 400 dòng, bắt buộc phải tách nhỏ (modularize) thành các sub-components, custom hooks, helper utils hoặc file constants/types riêng biệt.
  - Tuân thủ nguyên tắc Single Responsibility Principle (SRP), KISS và DRY.

---

## 9. Phân tách Tầng Giao diện & Logic & Quy ước Đặt tên File (File Suffix Convention)

- **File `.tsx` chỉ đảm nhiệm vai trò UI (Presentational Component)**:
  - Chỉ chứa cấu trúc JSX, styling, gắn kết event handlers từ props/custom hooks và hiển thị dữ liệu.
  - Tuyệt đối không nhồi nhét logic xử lý tính toán nặng, business state cồng kềnh hoặc API/storage calls trực tiếp trong component `.tsx`.
- **Quy ước đặt tên file theo hậu tố (Suffix Naming)**:
  - Bắt buộc đặt tên file kèm hậu tố đại diện cho thư mục chức năng để nhìn vào tên file là nhận diện được ngay vai trò:

```text
src/
├── components/                 # Component UI (.tsx)
│   ├── UserProfile.tsx
│   ├── Header.tsx
│   └── DocumentList.tsx
│
├── hooks/                      # Custom hooks (.ts) - bắt đầu bằng 'use'
│   ├── useAuth.ts
│   ├── useUser.ts
│   └── useProduct.ts
│
├── services/                   # API / Storage services - hậu tố '.service.ts'
│   ├── auth.service.ts
│   ├── user.service.ts
│   └── product.service.ts
│
├── types/                      # TypeScript types & interfaces - hậu tố '.types.ts'
│   ├── auth.types.ts
│   ├── user.types.ts
│   └── product.types.ts
│
├── utils/                      # Helper functions thuần túy - hậu tố '.utils.ts'
│   ├── format.utils.ts
│   ├── validate.utils.ts
│   ├── storage.utils.ts
│   └── date.utils.ts
│
├── constants/                  # Hằng số, config cố định - hậu tố '.constants.ts'
│   ├── routes.constants.ts
│   └── config.constants.ts
│
└── store/                      # State stores (nếu dùng) - hậu tố '.store.ts'
    ├── auth.store.ts
    └── user.store.ts
```

---

## 10. Chiến lược Styling (Tailwind CSS v4 + Shadcn UI Utility Classes)

- **Trực tiếp dùng Utility Classes Tailwind trong `.tsx`**:
  - Toàn bộ component UI sử dụng trực tiếp các class Tailwind kết hợp helper `cn(...)` từ `@office/ui-kit`.
  - Tận dụng đầy đủ các trạng thái linh hoạt: hover (`hover:...`), focus (`focus:...`), dark mode (`dark:...`), responsive (`sm:...`, `md:...`), flex/grid, spacing, color tokens.
  - Đảm bảo tính nhất quán, không xung đột CSS selector và tối ưu hóa runtime/bundle size.

---

## 11. Cấu trúc Thư mục Assets & Styles (`src/assets/`)

Toàn bộ static assets và styles chuyên biệt được lưu tập trung vào thư mục `src/assets/`:

```text
src/assets/
├── images/                       # Chứa hình ảnh tĩnh, logos, icons (nếu có)
└── styles/                       # Stylesheet chuyên biệt
    └── styles.css                # Tokens import, @theme inline, TipTap editor styles, page canvas, print & animations
```

- **Quy tắc Stylesheet (`styles.css`)**:
  - Chỉ chứa các định nghĩa CSS đặc thù không thuận tiện viết inline trong JSX như: Google Fonts, import Tokens Design System (`@office/ui-kit/tokens.css`), cấu hình `@theme inline`, typography của nội dung ProseMirror TipTap editor (`.doc-editor`, `.tiptap`, bảng table, blockquote), ruler canvas, và `@media print`.
  - Mọi giao diện khác (Header, Menu, Toolbar, Sidebar, Dialog, Modal, Statusbar...) đều dùng utility classes Tailwind trực tiếp trên JSX.
