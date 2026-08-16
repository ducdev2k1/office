# Phase 2: Chen anh (base64) + Bang (table)

## Overview

- **Priority**: P1 | **Status**: pending | **Effort**: 3.5h
- Muc tieu: chen anh qua FileReader → base64 data URL (gioi han ≤1MB, nen qua canvas neu vuot), chen bang voi controls them/xoa row/column. Luu y gioi han MVP: localStorage quota ~5MB, anh khong duoc split khi phan trang (Phase 5 se xu ly).

## Requirements

1. Cai `@tiptap/extension-image`, `@tiptap/extension-table`, `table-row`, `table-cell`, `table-header`.
2. Nut Insert Image → file input → validate ≤1MB → FileReader → data URL → `setImage({ src })`.
3. Anh > 1MB: nen qua canvas (giu aspect ratio, chat luong ~0.8 JPEG) truoc khi luu; neu van >1MB → bao loi.
4. Canh bao khi localStorage gan day (est. ~5MB): hien thi trong statusbar.
5. Nut Insert Table (3x3 mac dinh) + controls them/xoa row/column khi con tro trong bang.
6. CSS: `.doc-editor img` max-width 100%, table border collapse, selectedCell highlight.

## Architecture

- Image: node `image` co san trong PM schema, `src` la data URL → khong can upload backend (MVP).
- Table: 4 extensions chinh thuc, commands: `insertTable({ rows, cols, withHeaderRow })`, `addRowAfter`, `deleteRow`, `addColumnAfter`, `deleteColumn`, `deleteTable`.
- Kiem tra trong bang: `editor.isActive("table")`.
- Nen anh: `canvas.toDataURL("image/jpeg", 0.8)` tren 1 canvas tam — khong phu thuoc thu vien ngoai.
- Quota check: `navigator.storage.estimate()` (async) + fallback do `JSON.stringify(docs).length`.

## Related Code Files

- `/home/duc-lta/my-project/office/apps/web/package.json` — **modify**: them 5 packages.
- `/home/duc-lta/my-project/office/apps/web/src/App.tsx` — **modify**: extensions, toolbar (Insert Image/Table), helper `handleImageUpload`, `insertTable`.
- `/home/duc-lta/my-project/office/apps/web/src/styles.css` — **modify**: styles img/table/selectedCell.
- `/home/duc-lta/my-project/office/apps/web/src/App.tsx` — **modify**: statusbar hien thi dung luong dung (KB).

## Implementation Steps

1. **Cai packages**:
   ```bash
   pnpm add @tiptap/extension-image @tiptap/extension-table @tiptap/extension-table-row @tiptap/extension-table-cell @tiptap/extension-table-header
   ```
2. **Extensions**:
   ```ts
   Image.configure({ inline: false, allowBase64: true }),
   Table.configure({ resizable: true }),
   TableRow, TableHeader, TableCell,
   ```
3. **Handle image upload** (arrow function, dung FileReader + canvas):
   ```ts
   const handleImageUpload = (file: File) => {
     if (!file.type.startsWith('image/')) return;
     const reader = new FileReader();
     reader.onload = () => {
       let src = reader.result as string;
       // data URL > ~1MB → nen
       if (src.length > 1_000_000) src = compressImage(src); // canvas → JPEG 0.8
       if (src.length > 1_000_000) {
         alert('Anh qua lon (>1MB) sau khi nen');
         return;
       }
       editor.chain().focus().setImage({ src }).run();
     };
     reader.readAsDataURL(file);
   };
   ```
   `compressImage`: tao Image, `await img.decode()`, canvas scale giu ratio sao cho dien tich giam ~1/2, `canvas.toDataURL("image/jpeg", 0.8)`.
4. **Toolbar**: nut `Insert Image` (ImageIcon) → hidden `<input type="file" accept="image/*">` (ref, `.click()`); nut `Insert Table` (TableIcon) → `insertTable({ rows: 3, cols: 3, withHeaderRow: true })`.
5. **Table controls**: khi `editor.isActive("table")`, hien nhom nut phu: `addRowAfter`, `deleteRow`, `addColumnAfter`, `deleteColumn`, `deleteTable` (icons tu lucide: Rows3, Columns3, Trash2...).
6. **Storage usage indicator**: useMemo tinh `JSON.stringify(docs).length` → hien `~X MB / 5 MB` o statusbar; mau do khi > 4.5MB, kem alert 1 lan khi vuot 4.8MB (ref da bao).
7. **CSS**:
   ```css
   .doc-editor img {
     max-width: 100%;
     height: auto;
     border-radius: 3px;
   }
   .doc-editor table {
     width: 100%;
     border-collapse: collapse;
     margin: 18px 0;
   }
   .doc-editor th,
   .doc-editor td {
     border: 1px solid #c8cacc;
     padding: 8px 10px;
     min-width: 40px;
     vertical-align: top;
   }
   .doc-editor th {
     background: #f8f9fa;
     font-weight: 600;
   }
   .doc-editor .selectedCell::after {
     content: '';
     position: absolute;
     inset: 0;
     background: rgb(26 115 232 / 12%);
     pointer-events: none;
   }
   ```
   (TipTap table node da co class selectedCell rieng.)

## Todo List

- [ ] Cai 5 extension packages
- [ ] Khai extensions (Image allowBase64, Table resizable)
- [ ] handleImageUpload + compressImage (canvas)
- [ ] Toolbar: Insert Image (file input hidden), Insert Table
- [ ] Table controls: add/delete row/column, delete table
- [ ] Statusbar: dung luong localStorage + canh bao quota
- [ ] CSS img + table + selectedCell
- [ ] Test: anh 2MB → tu nen; bang them/xoa row; reload giu du lieu

## Success Criteria

- Chen anh ≤1MB thanh cong, reload trang anh con (base64 trong content).
- Anh >1MB tu dong nen hoac bao loi ro rang.
- Bang tao/xoa row/column dung, content trong cell giu duoc format.
- Data luu localStorage khong crash khi day (chi canh bao).

## Risk Assessment

| Risk                                | Mitigation                                                  |
| ----------------------------------- | ----------------------------------------------------------- |
| Data URL lam localStorage day nhanh | Gioi han 1MB/anh + indicator + canh bao 4.5MB               |
| `compressImage` async phuc tap      | Dung `await img.decode()` + try/catch, fallback giu anh goc |
| Table xung dot pagination (Phase 5) | Da ghi nhan: table la atomic block, khong split             |

## Next Steps

- Phase 3 (find & replace) — doc lap, co the bat dau song song.
