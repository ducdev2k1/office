# Phase 5: Page view phan trang tren man hinh (pagination engine)

## Overview

- **Priority**: P1 | **Status**: pending | **Effort**: 6h — **phase kho nhat**
- Muc tieu: hien thi kieu Google Docs — content tu dong xuong trang moi khi vuot chieu cao trang, nen trang giay (A4/A5/Letter, co lề) xep doc. Phuong an A (DIY): do `offsetHeight` tung top-level block qua `nodeDOM()`, tinh diem cat, ve vach ngat trang bang ProseMirror decorations, content chay tren nen cac khoi `.page`. Toggle view: **Paged** | **Continuous**.

## Requirements

1. Container: wrapper `position: relative`; N khoi `.page` background trang (box-shadow, dung kho giay + le) xep doc phia sau; ProseMirror content absolute phia tren.
2. Pagination engine (module `editor/pagination.ts`):
   - Input: editor view, pageSetup (CSS px), doc.
   - Do chieu cao MỖI top-level block: `view.nodeDOM(pos)` → `(el as HTMLElement).offsetHeight`.
   - Usable height = page height - margin top - margin bottom.
   - Tich luy: block nao vuot remaining → cat truoc block do (block KHONG bi split).
   - Table/image/block > usable height → overflow (dat trang rieng, khong loop vo han).
   - PageBreak node (Phase 4) = diem cat cuong buc.
3. Ve vach ngat: decoration `Decoration.node(pos, pos + node.nodeSize, { class: "page-break-marker" })` — CSS vach ngang + shadow do.
4. Debounce 150ms sau khi go/phai tinh lai; chi tinh lai khi docChanged hoac pageSetup/viewMode doi.
5. Toggle view: nut Paged/Continuous o toolbar (hoac statusbar). Paged mode: batch container co class `is-paged`.
6. Giới han MVP: doc ≤ ~50 trang; table/anh khong split (day nguyen khoi).

## Architecture

- **Cau truc DOM**:
  ```html
  <div class="page-viewport">
    <!-- overflow:auto, position:relative -->
    <div class="page-stack">
      <!-- absolute inset-0, cac .page xep doc -->
      <div class="page"></div>
      x N
    </div>
    <EditorContent />
    <!-- ProseMirror content, absolute top-0 -->
  </div>
  ```
  Content khong can dich chuyen — chi can `.doc-editor` width dung kho giay + padding dung lề; vach ngat trang ve de che dau content trao.
- **Pagination algo** (module tach biet, pure-ish):
  ```ts
  export interface PageBreakInfo {
    from: number;
    to: number;
  } // block range moi trang
  export const computePageBreaks = (
    view: EditorView,
    setup: PageSetup,
  ): { breaks: number[]; pages: PageBreakInfo[] } => {
    const doc = view.state.doc;
    const { usable, pageH } = computeMetrics(setup); // px, tu CSS variables cua .doc-editor
    let remaining = usable;
    const breaks: number[] = [];
    doc.forEach((node, offset) => {
      const dom = view.nodeDOM(offset); // chi top-level
      if (!dom) return;
      const h = (dom as HTMLElement).offsetHeight;
      if (node.type.name === 'pageBreak') {
        remaining = usable;
        breaks.push(offset);
        return;
      }
      if (h > pageH) {
        remaining = usable;
        breaks.push(offset);
        return;
      } // overflow block
      if (h > remaining) {
        breaks.push(offset);
        remaining = usable - h;
      } else remaining -= h;
    });
    return { breaks };
  };
  ```
- **Decoration plugin** (trong `pagination.ts`, dang ky qua Extension `addProseMirrorPlugins`):
  ```ts
  const key = new PluginKey('pagination');
  new Plugin({
    key,
    state: {
      init: () => ({ breaks: [] }),
      apply(tr, value) {
        if (!tr.docChanged) return value;
        // debounce: meta "paginationTick" tu setTimeout trong view update
        return tr.getMeta('paginationBreaks') ?? value;
      },
    },
    props: {
      decorations(state) {
        const { breaks } = key.getState(state);
        const decos = breaks.map((pos) =>
          Decoration.node(pos, pos + 1, { class: 'page-break-marker' }),
        );
        return DecorationSet.create(state.doc, decos);
      },
    },
  });
  ```
  (Break pos tro vao block dau trang moi; decoration keo dai ca block node — luu y dùng `Decoration.node`.)
- **Trigger re-measure**: `editor.on("transaction", ...)` + `setTimeout 150ms` → goi `computePageBreaks` → `view.dispatch(tr.setMeta("paginationBreaks", breaks))`. Neu trang thai ko doi thi khong dispatch (tranh loop).
- **pageSetup doi** (panel Ap dung): goi lai compute ngay lap tuc (khong debounce).
- **Cac page backgrounds**: React state `pageCount` (tu `breaks.length + 1`), render `.page` voi style width/height bang `.doc-editor` minus padding — dung chung CSS variables.

## Related Code Files

- `/home/duc-lta/my-project/office/apps/web/src/editor/pagination.ts` — **create**: computePageBreaks + plugin + Extension `pagination`.
- `/home/duc-lta/my-project/office/apps/web/src/App.tsx` — **modify**: wrapper DOM (`page-viewport` + `page-stack`), view mode state, dang ky pagination extension, debounce hook.
- `/home/duc-lta/my-project/office/apps/web/src/styles.css` — **modify**: `.page-viewport`, `.page-stack`, `.page`, `.page-break-marker`, `is-paged` rules, scroll behavior.

## Implementation Steps

1. **Tao pagination.ts** voi `computePageBreaks` (pseudocode tren) — unit-test nhanh bang console log voi doc mau.
2. **Extension pagination** trong cung file:
   ```ts
   export const pagination = Extension.create({
     name: 'pagination',
     addProseMirrorPlugins() {
       return [paginationPlugin];
     },
   });
   ```
3. **App.tsx**: state `viewMode: "paged" | "continuous"` (default "continuous" de khong pha UX hien tai), `pageCount`, `breaksRef`.
   - Effect theo `[editor, activeDoc.pageSetup, viewMode]` → `schedulePagination()`.
   - `schedulePagination`: `clearTimeout(timer); timer = setTimeout(() => { const { breaks } = computePageBreaks(view, setup); view.dispatch(view.state.tr.setMeta("paginationBreaks", breaks)); setPageCount(breaks.length + 1); }, 150)`.
4. **DOM wrapper**: `paper-wrap` giu nguyen; ben trong:
   ```tsx
   <div className={`page-viewport ${viewMode === 'paged' ? 'is-paged' : ''}`}>
     {viewMode === 'paged' && (
       <div className="page-stack">
         {Array.from({ length: pageCount }).map((_, i) => (
           <div className="page" key={i} />
         ))}
       </div>
     )}
     <EditorContent editor={editor} />
   </div>
   ```
5. **CSS**:
   ```css
   .page-viewport {
     position: relative;
     min-height: 100%;
   }
   .page-stack {
     position: absolute;
     inset: 0;
     display: grid;
     align-content: start;
     gap: 24px;
     padding: 24px 0;
   }
   .page {
     background: #fff;
     box-shadow:
       0 1px 3px rgb(60 64 67 / 20%),
       0 6px 18px rgb(60 64 67 / 12%);
   }
   .is-paged .doc-editor {
     margin: 0 auto;
     position: relative;
     z-index: 1;
     background: transparent;
     border: 0;
     box-shadow: none;
   }
   .is-paged .page-break {
     display: none;
   } /* vach that do decoration ve */
   .page-break-marker {
     display: block;
     height: 0;
     border-top: 2px dashed #1a73e8;
     position: relative;
   }
   .page-break-marker::after {
     content: 'Page break';
     position: absolute;
     top: -8px;
     left: 0;
     font-size: 10px;
     color: #1a73e8;
     background: #fff;
     padding: 0 4px;
   }
   .is-paged .page-stack .page {
     width: var(--paper-w);
     height: var(--paper-h);
     margin: 0 auto;
   }
   ```
   (`.page` dung cac CSS variables da set o Phase 4 — `--paper-w/h` = kho giay px; le da nam trong padding `.doc-editor`.)
6. **Xu ly doc chuyen doi & khoi luong lon**: khi `activeDoc` doi → reset breaks, pageCount=1, schedule lai. Neu block > usable height: dat break truoc block (overflow) — khong loop.
7. **Gioi han 50 trang**: neu `breaks.length > 49` → dung tinh toan, hien banner "Tai lieu qua dai cho page view MVP".

## Todo List

- [ ] pagination.ts: computePageBreaks + metrics (px tu pageSetup)
- [ ] Plugin decorations (page-break-marker) + Extension
- [ ] App.tsx: page-viewport/page-stack DOM + pageCount state
- [ ] Debounce 150ms + trigger khi docChanged/pageSetup doi
- [ ] View toggle Paged | Continuous (nut o statusbar/toolbar)
- [ ] CSS .page/.page-stack/.page-break-marker/is-paged
- [ ] Xu ly table/image overflow + PageBreak cuong buc
- [ ] Banner gioi han 50 trang
- [ ] Test: go nhieu doan → tu dong xuong trang; chen anh lon → day sang trang sau; doi kho giay → reflow

## Success Criteria

- Content tu dong ngat trang dung theo usable height (khong tran, khong cach thua).
- Table/anh khong bi cat giua; PageBreak cuong buc dung vi tri.
- Paged/Continuous toggle khong mat cursor position, khong flicker khi go lien tuc.
- Undo/redo van hoat dong (decorations khong anh huong schema).
- In ra PDF dung phan trang (kiem chung Chrome).

## Risk Assessment

| Risk                                                 | Mitigation                                                                |
| ---------------------------------------------------- | ------------------------------------------------------------------------- |
| **Flicker/loop khi dispatch meta trong transaction** | Chi dispatch khi breaks doi (so sanh mang); debounce 150ms                |
| offsetHeight khong on dinh khi font chua load        | Kiem tra `document.fonts.ready` truoc lan do dau                          |
| Table/anh > trang                                    | Overflow co break truoc block — da ghi nhan gioi han                      |
| Performance doc lon                                  | Chi do top-level blocks; gioi han 50 trang                                |
| Scrollbar nhay khi page-stack doi cao                | `.page-stack` absolute khong anh huong layout height cua viewport content |

## Next Steps

- Phase 6 (modularize + phim tat cuoi + Help + verify) — don dep toan bo, check typecheck/build.
