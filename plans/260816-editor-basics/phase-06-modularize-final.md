# Phase 6: Modularize + Hoan thien phim tat + Help menu + Verify

## Overview

- **Priority**: P1 | **Status**: pending | **Effort**: 3h
- Muc tieu: tach App.tsx (207 dong ban dau → sau 5 phase co the 600-700 dong) thanh module theo convention AGENTS.md (arrow function, const, ES7+), hoan thien phim tat con lai (Ctrl+H da o Phase 3, Ctrl+Enter o Phase 4), them Help menu hien thi bang phim tat, chay typecheck + build + lint verify toan bo.

## Requirements

1. Cau truc file cuoi (khop `docs/brainstorm-editor-basics.md`):
   ```text
   apps/web/src/
     App.tsx                          # shell: header, sidebar, toolbar, find bar, statusbar, page viewport
     types.ts                         # (da tao Phase 4)
     storage.ts                       # (da tao Phase 4)
     editor/use-docs-editor.ts        # hook: useEditor + toan bo extensions + keyboardShortcuts
     editor/extensions/page-break.ts  # (da tao Phase 4)
     editor/extensions/search-replace.ts  # (da tao Phase 3)
     editor/pagination.ts             # (da tao Phase 5)
     components/Toolbar.tsx           # tach Toolbar + font/size pickers + table controls
     components/ToolbarButton.tsx     # tach ToolbarButton
     components/FindReplaceBar.tsx    # tach tu Phase 3
     components/PageSetupPanel.tsx    # (da tao Phase 4)
     components/DocsSidebar.tsx       # tach sidebar + outline
   ```
2. Phim tat cuoi: Ctrl+Shift+F focus font picker (focus qua ref tu Toolbar), Ctrl+Alt+7 focus color picker (da o Phase 1), Ctrl+H (Phase 3), Ctrl+Enter (Phase 4) — tong hop lai thanh bang Help.
3. Help menu: nut "Help" o menu-row → modal/panel liet ke phim tat (StarterKit co san + phim tat them).
4. Verify: `pnpm typecheck`, `pnpm build`, manual smoke test toan bo tinh nang, kiem tra khong console error.

## Architecture

- **use-docs-editor.ts** — hook nhan `content`, `onUpdate`, tra ve `editor`. Toan bo extensions (StarterKit, TextStyle, Color, Highlight, FontFamily, FontSize, Sub, Sup, Image, Table+Row/Cell/Header, Underline, Link, TextAlign, Placeholder, PageBreak, searchReplace, pagination, keyboardShortcuts) tap trung o day. `keyboardShortcuts` gop chung 1 extension.
- **Components**: props-driven, khong giu editor state; nhan `editor` + callbacks tu App.
- **App.tsx** sau khi tach chi giu: state docs/activeId/query/sidebar/findOpen/saveState/viewMode, cac useEffect (autosave, editor sync, Ctrl+H, pagination schedule), layout JSX.

## Implementation Steps

1. **use-docs-editor.ts**:
   ```ts
   export const useDocsEditor = (content: string, onUpdate: (html: string) => void) => {
     return useEditor({
       extensions: [StarterKit, ..., pageBreak, searchReplace, pagination, keyboardShortcuts],
       content,
       editorProps: { attributes: { class: "doc-editor" } },
       onUpdate: ({ editor }) => onUpdate(editor.getHTML()),
     });
   };
   ```
   (Giu `activeDocRef` pattern: App truyen `onUpdate` khop voi activeDoc hien tai.)
2. **Toolbar.tsx**: nhan props `{ editor, onSetLink, onExportHtml, onExportText, onPrint, onDelete, canDelete, onToggleFind, onInsertImage, onInsertTable, onPageSetup, onViewModeChange, viewMode, fontPickerRef, colorPickerRef }`. Chia nhom nut: history / paragraph-heading / inline format (+ strike, sub, sup, color, highlight) / font pickers / lists-align / insert (image, table, HR, page break) / table controls (khi isActive("table")) / export-print / view toggle / find.
3. **ToolbarButton.tsx**: giu nguyen interface cu + them `children` optional.
4. **FindReplaceBar.tsx**: tach tu code Phase 3; props `{ open, query, setQuery, replacement, setReplacement, count, onPrev, onNext, onReplace, onReplaceAll, onClose, findRef }`.
5. **DocsSidebar.tsx**: tach tu App: `{ docs, activeId, query, onQueryChange, onSelect, onAdd, outline, sidebarOpen, onClose }`.
6. **PageSetupPanel.tsx**: giu tu Phase 4 (chuyen vao components/).
7. **Help menu**: state `helpOpen`; modal liệt ke phim tat:
   - Co san (StarterKit): Ctrl+B/I, Ctrl+Z, Ctrl+Y, Ctrl+Shift+7/8, Ctrl+Alt+1/2/3, Ctrl+K, Ctrl+`, Tab/Shift+Tab.
   - Them: Ctrl+Shift+X, Ctrl+Shift+Z, Ctrl+H, Ctrl+Shift+>/<, Ctrl+Shift+5/6, Ctrl+Enter, Ctrl+Alt+7, Ctrl+Shift+F, Ctrl+P.
8. **CSS**: styles cho Help modal (`.help-modal`, `.help-grid` 2 cot), FindReplaceBar, page controls (view toggle button active state).
9. **Verify**:
   ```bash
   pnpm typecheck
   pnpm build
   ```
   Smoke test checklist: tao doc moi → format day du → chen anh/bang → find&replace → page setup → page view toggle → page break → print preview → undo/redo → reload giu du lieu → xoa doc.

## Todo List

- [ ] use-docs-editor.ts (gom extensions + keyboardShortcuts)
- [ ] ToolbarButton.tsx (tach)
- [ ] Toolbar.tsx (tach + pickers + table controls + view toggle)
- [ ] FindReplaceBar.tsx (tach)
- [ ] DocsSidebar.tsx (tach + outline)
- [ ] PageSetupPanel.tsx (di chuyen vao components/)
- [ ] App.tsx giam xuong < 200 dong
- [ ] Ctrl+Shift+F focus font picker (ref xuyen Toolbar)
- [ ] Help modal + bang phim tat
- [ ] CSS help modal + view toggle
- [ ] pnpm typecheck + build pass
- [ ] Smoke test toan bo

## Success Criteria

- App.tsx < 200 dong; moi file < 200 dong (tru pagination.ts ~150-200).
- Khong import vong (App → components → editor modules, mot chieu).
- Typecheck + build pass, khong loi console.
- Help menu liet ke day du phim tat; moi phim tat hoat dong.
- Toan bo tinh nang cac phase truoc van hoat dong sau refactor (khong regression).

## Risk Assessment

| Risk                                       | Mitigation                                                            |
| ------------------------------------------ | --------------------------------------------------------------------- |
| Refactor gay regression                    | Lam tu tu tung component, typecheck sau moi lan tach; smoke test cuoi |
| Props drilling phuc tap giua App ↔ Toolbar | Gom props theo nhom (editor, handlers, pickers refs)                  |
| Quen import extension sau khi gom          | use-docs-editor la noi duy nhat khai bao extensions                   |

## Next Steps

- Cap nhat `README.md` + `docs/architecture.md`: tinh nang moi, cau truc file, ghi chu gioi han MVP (base64 ≤1MB, page view ≤50 trang, table/image khong split).
- Xem xet: backend luu anh/file thay base64; line spacing (cau hoi chua chot o brainstorm).
