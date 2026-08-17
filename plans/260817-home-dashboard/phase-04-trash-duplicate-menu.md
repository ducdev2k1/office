# Phase 4: Trash + Duplicate + FileRowMenu + ConfirmDialog + Rename inline

## Overview

- **Priority**: P1 | **Status**: done | **Effort**: 4h
- Muc tieu: day du dong doi thanh thao truyen thong: menu ⋮ tren moi file (Base UI Menu), rename inline, duplicate, chuyen thung rac (soft-delete), khoi phuc, xoa vinh vien co dialog xac nhan (thay `window.confirm`).

## Requirements

1. `FileRowMenu.tsx` — Base UI Menu; menu khac nhau theo context:
   - Tab thuong: Đổi tên | Tạo bản sao | ⭐/Bỏ ghim | Chuyển vào thùng rác.
   - Tab Trash: Khôi phục | Xóa vĩnh viễn.
2. `ConfirmDialog.tsx` — Base UI Dialog xac nhan destructive (xoa vinh vien): tieu de + noi dung + nut Hủy/Xóa. Focus quản lý (trap), Esc dong.
3. **Rename inline**: click ten (hoac qua menu) -> input trong o ten, Enter luu / Esc huy / blur luu.
4. **Duplicate**: `onDuplicate(id)` -> id moi, title "Bản sao của <title>", giu content + pageSetup + starred=false, o lai home (khong navigate), hien thi dau danh sach (sort theo updated).
5. **Trash**: `onTrash(id)` -> set deletedAt, file bien mat khoi tab thuong, xuat hien tab Trash. Restore -> deletedAt=null. DeleteForever -> xoa that khoi IndexedDB.
6. Hover/focus hien ⭐ + ⋮ (desktop); a11y: focus cung hien action.

## Architecture

- **actions** o FileHome da co tu Phase 3 — Phase 4 chi noi menu/confirm/dialog vao FileList/FileGrid rows.
- **ConfirmDialog** dung chung trong file-home, trigger qua state `{ id, title }` o FileList (khong duyet toan bo props xuong tu FileHome — row tu quan ly menu cua no, goi actions goi len).
- **Rename inline** state o row: `editing: boolean`, `draft: string`.

## Implementation Steps

1. FileRowMenu.tsx (Base UI Menu, menu theo tab).
2. ConfirmDialog.tsx (Base UI Dialog + focus trap).
3. FileList.tsx: them star button + ⋮ menu + rename inline + open (onClick row goi onOpen + markOpened).
4. FileGrid.tsx: them ⋮ menu tren card (star hien dau card).
5. useDocs: hoan thien trash/restore/deleteForever/duplicate (duplicate can copy content + pageSetup).
6. Tab Trash: render file deletedAt != null, row actions Restore/DeleteForever.
7. Xoa dong code `window.confirm` trong deleteDoc cu (EditorPage dung ConfirmDialog hoac giu confirm don gian — xac nhan chung).
8. Verify: typecheck + build + manual full flow.

## Todo List

- [x] FileRowMenu (2 context menu)
- [x] ConfirmDialog + focus trap
- [x] Rename inline
- [x] Duplicate
- [x] Trash/Restore/DeleteForever trong useDocs
- [x] Tab Trash render + actions
- [x] Thay window.confirm
- [x] typecheck + build + smoke

## Success Criteria

- Duplicate tao file moi dung noi dung, "Bản sao của" prefix.
- Trash: file vao tab Trash, restore ve dung vi tri, deleteForever xoa khoi IndexedDB + co confirm.
- Rename inline: Enter luu, Esc huy, blur luu — khong mat focus vao editor.
- Khong con `window.confirm` trong flow xoa file.

## Risk Assessment

| Risk | Mitigation |
| --- | --- |
| Base UI Menu a11y/trap loi | Dung pattern khuyen nghi cua Base UI; kiem tra keyboard (arrow, Esc) |
| Rename blur vs Enter dua event | Xu ly keydown truoc blur (flag), giu draft state |

## Next Steps

- Phase 5: polish (skeleton/relative time/empty), storage estimate, demo sheets route, verify toan bo.
