# Phase 3: file-home core — model, useDocs mở rộng, TemplateStrip + Stats + Tabs + List/Grid

## Overview

- **Priority**: P1 | **Status**: done | **Effort**: 5h
- Muc tieu: dinh nghia FileRecord + ProductConfig (hop dong tai dung), mo rong `DocRecord` va `useDocs` (star/rename/duplicate/trash/restore/deleteForever/markOpened), dung FileHome: TemplateStrip, StatsCards, FileTabs, FileToolbar, FileList/Grid, EmptyStates, search + sort client-side.

## Requirements

1. `@office/file-home/src/types.ts`:
   ```ts
   type FileKind = 'docs' | 'sheets' | 'slides';
   interface FileRecord {
     id: string; title: string; kind: FileKind;
     createdAt: string; updatedAt: string; lastOpenedAt: string;
     starred: boolean; deletedAt: string | null;
   }
   interface ProductConfig { kind, name, createLabel, startLabel, blankLabel,
     editorPath(id): string, accentVar: string, templates: {id,label}[] }
   type FileSort = 'lastOpened' | 'updated' | 'name';
   type FileView = 'list' | 'grid';
   ```
2. `apps/docs/src/types.ts` DocRecord: them `kind: 'docs'`, `createdAt`, `lastOpenedAt`, `starred`, `deletedAt`.
3. `apps/docs/src/storage.ts`: migration default cho du lieu cu (map bo sung field thieu); `createBlankDoc` set du metadata moi.
4. `useDocs` them: `star(id)`, `rename(id,title)`, `duplicate(id)`, `trash(id)`, `restore(id)`, `deleteForever(id)`, `markOpened(id)` (set lastOpenedAt khi open tu home); giu `addDoc` + tu dong navigate.
5. `@office/file-home` components (Tailwind + Base UI):
   - `FileHome.tsx` — nhan `{ config, files, actions }`, query state noi tai, lua chon view, to hop component con.
   - `TemplateStrip.tsx` — "Bắt đầu một tài liệu mới" + card Trống (button +, `--o-kind-*` icon) + `templates` (placeholder, du phong sau).
   - `StatsCards.tsx` — tong file, dung luong (prop), so ghim, sua gan nhat.
   - `FileTabs.tsx` — Base UI Tabs: Gần đây | Đã ghim | Thùng rác; dem "N tài liệu".
   - `FileToolbar.tsx` — sort dropdown + view toggle (luu localStorage).
   - `FileList.tsx` / `FileGrid.tsx` — table (icon mau theo kind, tên, sửa lần cuối, mở gần nhất, ⭐) / grid card.
   - `EmptyStates.tsx` — chua co file / ket qua rong / thung rac rong.
6. Logic loc: active tab + search query + sort ap dung client-side trong FileHome.

## Architecture

- **FileHome** la noi duy nhat giu view state (tab, query, sort, view) — con lai deu presentational.
- **actions**: `{ onCreate, onOpen(id), onStar(id), onRename(id,title), onDuplicate(id), onTrash(id), onRestore(id), onDeleteForever(id) }` — apps/docs implement bang useDocs, sheets/slides sau nay bang store rieng.
- **Sort** trong bảng: lastOpened (default) | updated | name. Loc: deletedAt==null (tru tab Trash), starred filter.

## Implementation Steps

1. file-home types.ts (FileRecord, ProductConfig, FileSort, FileView).
2. apps/docs types.ts + storage.ts migration + createBlankDoc.
3. useDocs: them 6 action + markOpened; addDoc tra ve id moi (de navigate).
4. FileHome + TemplateStrip + StatsCards + FileTabs + FileToolbar + FileList/Grid + EmptyStates.
5. HomePage: cau hinh `config` docs (icon FileText, accentVar --o-kind-docs, editorPath `/edit/`), gan actions tu useDocs.
6. Search TopBar (Phase 2) noi vao query cua FileHome.
7. Verify: typecheck + build; manual create/open/search/sort/toggle tab.

## Todo List

- [ ] types.ts file-home (FileRecord/ProductConfig)
- [ ] DocRecord + migration + createBlankDoc
- [ ] useDocs actions
- [ ] FileHome assemble
- [ ] TemplateStrip + StatsCards
- [ ] FileTabs + FileToolbar
- [ ] FileList + FileGrid
- [ ] EmptyStates
- [ ] HomePage config docs
- [ ] Search noi TopBar
- [ ] typecheck + build + smoke

## Success Criteria

- Tu home: create -> vao /edit/:id; mo file -> markOpened; search/sort/tab loc dung.
- DocRecord cu (IndexedDB) load khong crash, field moi co default.
- Sheet/Slides chi can truyen config + actions khac — FileHome khong hard-code "Docs".

## Risk Assessment

| Risk | Mitigation |
| --- | --- |
| Migration dung du lieu cu | Map default an toan, khong mutate object goc |
| Props phong to (actions) | Gom `actions` object thanh 1 prop; component con nhan tung callback can thiet |
| IndexedDB async -> loading | FileHome nhan files da load (useDocs dang async), HomePage render skeleton khi chua co |

## Next Steps

- Phase 4: FileRowMenu (⋮) + Trash restore/delete + ConfirmDialog + rename inline + duplicate.
