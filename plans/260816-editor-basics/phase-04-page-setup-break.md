# Phase 4: Page setup + PageBreak node + CSS print rules

## Overview

- **Priority**: P1 | **Status**: pending | **Effort**: 3h
- Muc tieu: (a) them `pageSetup` vao DocRecord + panel cau hinh kho giay/lề/hướng, CSS variables ap len `.doc-editor`; (b) custom TipTap node PageBreak + nut Insert + Ctrl+Enter; (c) CSS `@page` + print rules de `window.print()` ra PDF phan trang dung.

## Requirements

1. `DocRecord.pageSetup = { paperSize: "a4"|"a5"|"letter", orientation: "portrait"|"landscape", margins: { top, right, bottom, left } }` — don vi mm, default A4 portrait 20/15/20/15.
2. Migration: doc cu (thieu pageSetup) → fill default khi load (storage.ts).
3. Panel UI: select paperSize, select orientation, 4 input margins (mm), preview text "A4 210x297mm", nut Ap dung → set CSS variables.
4. PageBreak node: `Node.create({ name: "pageBreak", group: "block", atom: true, selectable: true, parseHTML: [{ tag: "div[data-type=page-break]" }], renderHTML: () => ["div", { "data-type": "page-break" }] })`.
5. Nut Insert → Page Break + Ctrl+Enter (`setPageBreak()`), xoa duoc bang Backspace (selectable).
6. CSS print: `@page { size: var(--paper); margin: var(--margin); }`, `.page-break { break-after: page; }`, block `break-inside: avoid`.

## Architecture

- Data model: `src/types.ts` (tao o phase nay de dung chung) — `PaperSize`, `Orientation`, `PageMargins`, `PageSetup`, `DocRecord` (them field `pageSetup?: PageSetup`).
- Kich thuoc giay (mm): A4 210x297, A5 148x210, Letter 216x279. Portrait/landscape swap w/h.
- CSS variables tren `.doc-editor` (inline style qua React): `--paper-w`, `--paper-h`, `--margin-t/r/b/l` (px chuyen doi: `mm * 96 / 25.4`). `.doc-editor` doi `width: var(--paper-w); min-height: var(--paper-h); padding: var(--margin-t) var(--margin-r) var(--margin-b) var(--margin-l)`.
- PageBreak: nhan node bang `editor.commands.setPageBreak()` tu custom command `addCommands() { return { setPageBreak: () => ({ chain }) => chain().insertContent({ type: "pageBreak" }).run() } }`.
- Print: `.page-break { break-after: page; }`; `@media print` giu nguyen rules cu + `@page` dung bien tu pageSetup (set qua `document.documentElement.style` o `beforeprint` event).

## Related Code Files

- `/home/duc-lta/my-project/office/apps/web/src/types.ts` — **create**: PageSetup + DocRecord.
- `/home/duc-lta/my-project/office/apps/web/src/storage.ts` — **create**: load/save + migration pageSetup default.
- `/home/duc-lta/my-project/office/apps/web/src/editor/extensions/page-break.ts` — **create**: PageBreak node.
- `/home/duc-lta/my-project/office/apps/web/src/App.tsx` — **modify**: import types/storage, dang ky PageBreak, PageSetupPanel render, Ctrl+Enter.
- `/home/duc-lta/my-project/office/apps/web/src/styles.css` — **modify**: CSS variables, `.page-break`, `@page`, print rules.
- `/home/duc-lta/my-project/office/apps/web/src/components/PageSetupPanel.tsx` — **create**: panel UI.

## Implementation Steps

1. **types.ts**:
   ```ts
   export type PaperSize = 'a4' | 'a5' | 'letter';
   export type Orientation = 'portrait' | 'landscape';
   export interface PageMargins {
     top: number;
     right: number;
     bottom: number;
     left: number;
   }
   export interface PageSetup {
     paperSize: PaperSize;
     orientation: Orientation;
     margins: PageMargins;
   }
   export interface DocRecord {
     id: string;
     title: string;
     content: string;
     updatedAt: string;
     pageSetup?: PageSetup;
   }
   export const PAPER_SIZES: Record<PaperSize, { width: number; height: number }> = {
     a4: { width: 210, height: 297 },
     a5: { width: 148, height: 210 },
     letter: { width: 216, height: 279 },
   };
   export const DEFAULT_PAGE_SETUP = (): PageSetup => ({
     paperSize: 'a4',
     orientation: 'portrait',
     margins: { top: 20, right: 15, bottom: 20, left: 15 },
   });
   ```
2. **storage.ts** (arrow functions, migration):
   ```ts
   export const STORAGE_KEY = 'onemail-docs-web-documents';
   export const loadDocs = (): DocRecord[] => {
     // parse + map: doc.pageSetup ?? DEFAULT_PAGE_SETUP() — migration o day
   };
   export const saveDocs = (docs: DocRecord[]) =>
     localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
   ```
   App.tsx thay the ham local bang storage.ts.
3. **page-break.ts** (dung spec o Requirements, them):
   ```ts
   addCommands() {
     return { setPageBreak: () => ({ chain }) => chain().insertContent({ type: "pageBreak" }).run() };
   },
   addKeyboardShortcuts() {
     return { "Mod-Enter": () => this.editor.commands.setPageBreak() };
   }
   ```
4. **CSS variables** — tinh bang helper `computePageCss(setup)` tra ve object style cho `.doc-editor` (React inline style):
   ```ts
   const mmToPx = (mm: number) => Math.round((mm * 96) / 25.4);
   // style = { width: `${w}px`, minHeight: `${h}px`, padding: `${t}px ${r}px ${b}px ${l}px` }
   ```
   `useMemo` theo activeDoc.pageSetup; bo sung state `setupDraft` trong panel, chi ap dung khi bam "Ap dung" (setDocs cap nhat activeDoc.pageSetup).
5. **PageSetupPanel.tsx**: form nho — 3 select/input groups + preview + Ap dung/Huy. Props: `setup`, `onApply(setup)`. Style float tren toolbar (absolute, shadow).
6. **Print**:
   ```ts
   const handlePrint = () => {
     const s = activeDoc.pageSetup ?? DEFAULT_PAGE_SETUP();
     const root = document.documentElement;
     root.style.setProperty('--print-size', `${w}mm ${h}mm`); // w/h theo orientation
     root.style.setProperty('--print-margin', `${m.top}mm ${m.right}mm ${m.bottom}mm ${m.left}mm`);
     window.print();
   };
   ```
   CSS: `@page { size: var(--print-size); margin: var(--print-margin); }`, `@media print { .page-break { break-after: page; } .doc-editor p, .doc-editor table, .doc-editor img, .doc-editor pre { break-inside: avoid; } }`.
7. **CSS man hinh**: `.page-break { height: 0; break-after: page; }` (man hinh: hien thi vach ngat bang border-bottom mo + `::after` label "Page break" nho) — chi khi o Continuous mode; o Paged mode (Phase 5) vach nay do decoration ve, nen hide `.page-break` khi container co class `is-paged`.

## Todo List

- [ ] types.ts (PageSetup + PAPER_SIZES + DEFAULT_PAGE_SETUP)
- [ ] storage.ts (load/save + migration pageSetup)
- [ ] page-break.ts (node + setPageBreak command + Ctrl+Enter)
- [ ] App.tsx: dung storage.ts, dang ky PageBreak, inline style CSS variables
- [ ] PageSetupPanel.tsx (select size/orientation, 4 margins, ap dung)
- [ ] Print: beforeprint set @page vars + break-inside avoid
- [ ] CSS: .page-break (continuous + paged modes)
- [ ] Test: doi giay → editor doi kich thuoc; chen page break → print PDF dung trang

## Success Criteria

- Doc cu load khong crash, pageSetup tu dong default.
- Doi A4/A5/letter + portrait/landscape + margins → `.doc-editor` cap nhat tuc thi.
- Ctrl+Enter chen page break, xoa duoc, save/reload giu nguyen.
- Print to PDF: page break dung vi tri, khong cat giua table/paragraph.

## Risk Assessment

| Risk                                            | Mitigation                                          |
| ----------------------------------------------- | --------------------------------------------------- |
| @page margin khong dong bo voi padding man hinh | MVP chap nhan sai lech nho; kiem chung Chrome print |
| PageBreak nam giua block gay loi in             | atom node nen luon dung giua cac block              |
| Migration pageSetup thieu o doc da save cu      | Default fill tai loadDocs                           |

## Next Steps

- Phase 5 (page view pagination) — dung pageSetup + PageBreak lam input chinh.
