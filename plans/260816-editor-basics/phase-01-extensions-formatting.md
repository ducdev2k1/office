# Phase 1: Extensions dinh dang nang cao + Toolbar + Phim tat co ban

## Overview

- **Priority**: P1 | **Status**: pending | **Effort**: 4h
- Muc tieu: bo sung toan bo formatting extension chinh thuc cua TipTap v3, them buttons toolbar (color, highlight, strike, sub/sup, font pickers), them phim tat bo sung. Day la phase nen, it rui ro, dung extension chinh thuc — khong tu viet.

## Requirements

1. Cai dat extensions: color, highlight, subscript, superscript, text-style, font-family, font-size.
2. Strike, code block, blockquote, HR da co trong StarterKit — chi them toolbar buttons.
3. Toolbar: font family picker, font size picker, text color, highlight color, strike, sub, sup, HR.
4. Phim tat bo sung: Ctrl+Shift+X (strike), Ctrl+Shift+Z (redo), Ctrl+Shift+> / Ctrl+Shift+< (tang/giam font size), Ctrl+Shift+5 (sub), Ctrl+Shift+6 (sup), Ctrl+Alt+7 (mo color picker), Ctrl+Shift+F (focus font picker).
5. Khong pha vo undo/redo, active state dung cho moi button.

## Architecture

- Extensions khai bao trong `useEditor({ extensions: [...] })` tai App.tsx (se tach sang `editor/use-docs-editor.ts` o Phase 6).
- Font family/size/color luu tren mark `textStyle` (PM): `editor.chain().setFontFamily(...)`, `setFontSize(...)`, `setColor(...)`, `toggleHighlight(...)`.
- Phim tat: `Extension.create({ name: "keyboardShortcuts", addKeyboardShortcuts() { return { "Mod-Shift-x": ... } } })` — chen vao extensions array.
- Font picker: `<select>` trong Toolbar, value lay tu `editor.getAttributes("textStyle")`.

## Related Code Files

- `/home/duc-lta/my-project/office/apps/web/package.json` — **modify**: them 7 dependencies.
- `/home/duc-lta/my-project/office/apps/web/src/App.tsx` — **modify**: extensions array, Toolbar JSX.
- `/home/duc-lta/my-project/office/apps/web/src/styles.css` — **modify**: style cho pickers, `.tool-button.active` da co.

## Implementation Steps

1. **Cai dependencies** (arrow chay trong apps/web):
   ```bash
   pnpm add @tiptap/extension-color @tiptap/extension-highlight @tiptap/extension-subscript @tiptap/extension-superscript @tiptap/extension-text-style @tiptap/extension-font-family @tiptap/extension-font-size
   ```
2. **Khai extensions** trong useEditor:
   ```ts
   extensions: [
     StarterKit,
     TextStyle,
     Color,
     Highlight.configure({ multicolor: true }),
     Subscript,
     Superscript,
     FontFamily.configure({ types: ['textStyle'] }),
     FontSize.configure({ types: ['textStyle'] }),
     // ...Underline, Link, TextAlign, Placeholder nhu cu
     keyboardShortcuts,
   ];
   ```
   Luu y: **TextStyle phai co truoc** Color/FontFamily/FontSize trong array.
3. **Toolbar buttons** (arrow function, dung `editor.isActive`):
   - Strike: `editor.chain().focus().toggleStrike().run()`, active `editor.isActive("strike")`.
   - Sub: `toggleSubscript()`; Sup: `toggleSuperscript()`.
   - HR: `editor.chain().focus().setHorizontalRule().run()`.
   - Blockquote: `toggleBlockquote()`; CodeBlock: `toggleCodeBlock()`.
4. **Font family picker**: `<select value={editor.getAttributes("textStyle").fontFamily ?? ""} onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}>` voi options: Arial, Roboto, Times New Roman, Courier New, Georgia, Verdana + "Mac dinh" (unsetFontFamily).
5. **Font size picker**: options 8/10/12/14/16/18/20/24/28/32/36/48; onChange `setFontSize(value + "px")`; "Mac dinh" → `unsetFontSize()`.
6. **Color buttons**: `<input type="color">` an (hidden) trigger `setColor`; highlight tuong tu `toggleHighlight({ color })`. Ctrl+Alt+7 focus color input qua ref.
7. **Phim tat extension**:
   ```ts
   const keyboardShortcuts = Extension.create({
     name: 'keyboardShortcuts',
     addKeyboardShortcuts() {
       return {
         'Mod-Shift-x': () => this.editor.commands.toggleStrike(),
         'Mod-Shift-z': () => this.editor.commands.redo(),
         'Mod-Shift->': () => this.editor.commands.setFontSize(current + 2 + 'px'), // doc current tu getAttributes
         'Mod-Shift-<': () => this.editor.commands.setFontSize(current - 2 + 'px'),
         'Mod-Shift-5': () => this.editor.commands.toggleSubscript(),
         'Mod-Shift-6': () => this.editor.commands.toggleSuperscript(),
       };
     },
   });
   ```
   Ctrl+H, Ctrl+Enter, Ctrl+Shift+F se them o Phase 3/4/6 (tranh overlap).
8. **CSS**: style `.tool-picker` (select) giong .tool-button: height 32px, border-radius 4px; `.color-swatch` button 24x24 voi border.

## Todo List

- [ ] Cai 7 extension packages
- [ ] Khai extensions array (TextStyle truoc Color/Font)
- [ ] Them toolbar: strike, sub, sup, HR, blockquote, code block
- [ ] Font family picker (select + active state)
- [ ] Font size picker (+ tang/giam Ctrl+Shift+> / <)
- [ ] Text color + highlight buttons (input type=color hidden)
- [ ] keyboardShortcuts extension (strike, redo, sub/sup)
- [ ] CSS cho pickers
- [ ] Typecheck + test manual cac toggle

## Success Criteria

- Tat ca buttons co active state dung khi dat con tro vao text da format.
- Undo/redo hoat dong xuyen suot cac thao tac moi.
- Font size tang/giam duoc qua phim tat, value cap nhat trong picker.
- Khong loi console, `pnpm typecheck` pass.

## Risk Assessment

| Risk                                           | Mitigation                                                |
| ---------------------------------------------- | --------------------------------------------------------- |
| FontSize/FontFamily khong hoat dong            | Check da cai TextStyle va cau hinh `types: ["textStyle"]` |
| Phim tat trung (vd Mod-Shift-z vs cua browser) | Khong override Ctrl+Z/Y; chi them Ctrl+Shift+Z            |
| Highlight multicolor phuc tap                  | Dung `multicolor: true` chuan cua extension               |

## Next Steps

- Phase 2 (image + table) — bo sung 2 extension nhom con lai + toolbar buttons.
