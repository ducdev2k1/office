# Phase 3: Do hieu nang + Checklist gap tinh nang

## Overview

- **Priority**: P1 | **Status**: completed | **Effort**: 12h
- Muc tieu: do bundle size, load time, scroll performance tren prototype Univer, va dien day checklist gap tinh nang OSS vs target MVP iNET. Day la du lieu quyet dinh go/no-go.

## Requirements

1. Do bundle size (vite build production) cua `apps/sheets` voi Univer v0.23.
2. Do thoi gian khoi tao Univer instance den khi workbook hien thi.
3. Do scroll performance voi workbook lon (1k/10k/100k cells).
4. Dien day checklist gap tinh nang (oss co / phai tu lam / hoan).
5. Danh gia community chart plugin (`xxs3315/univer-chart-plugin`) — co kha thi khong.
6. Danh gia theme Dark Mode cua Univer OSS — co ho tro khong, kha nang custom.

## Checklist gap tinh nang

### Sheets core

| #   | Tinh nang                                  | Target MVP | Univer OSS v0.23 | Trang thai |
| --- | ------------------------------------------ | ---------- | ---------------- | ---------- |
| 1   | Tao workbook moi                           | ✅         | ✅               | —          |
| 2   | Edit cell (text, so, formula)              | ✅         | ✅               | —          |
| 3   | Copy/paste, undo/redo                      | ✅         | ✅               | —          |
| 4   | Format so (tien te, %, ngay, so thap phan) | ✅         | ✅               | —          |
| 5   | Conditional formatting                     | ✅         | ✅               | —          |
| 6   | Data validation (dropdown, rule)           | ✅         | ✅               | —          |
| 7   | Filter + Sort                              | ✅         | ✅               | —          |
| 8   | Insert/delete rows/columns                 | ✅         | ✅               | —          |
| 9   | Merge cells                                | ✅         | ✅               | —          |
| 10  | Column width / row height resize           | ✅         | ✅               | —          |
| 11  | Hyperlink                                  | ✅         | ✅               | —          |
| 12  | Comment/note                               | ✅         | ✅               | —          |
| 13  | Find & Replace                             | ✅         | ✅               | —          |
| 14  | Tables                                     | ✅         | ✅               | —          |
| 15  | Drawing (insert image)                     | ✅         | ✅               | —          |
| 16  | Multi-sheet (add/rename/delete sheet)      | ✅         | ✅               | —          |

### Tinh nang can tu lam (gap)

| #   | Tinh nang               | Phuong an                                     | Do phuc tap | Ghi chu                  |
| --- | ----------------------- | --------------------------------------------- | ----------- | ------------------------ |
| 17  | **Import .xlsx**        | ExcelJS → snapshot (Phase 2)                  | Trung binh  | Bat buoc                 |
| 18  | **Export .xlsx**        | Univer snapshot → ExcelJS.writeFile           | Trung binh  | Bat buoc                 |
| 19  | **Charts**              | echarts + custom plugin hoac community plugin | Cao         | Danh gia trong phase nay |
| 20  | **Print/PDF**           | html2canvas hoac Univer print (Pro)           | Trung binh  | Quyết lai scope          |
| 21  | **Collaboration (Yjs)** | Tu rang buoc Yjs vao Univer changeset         | Rat cao     | Hoan                     |
| 22  | **Pivot tables**        | Hoan                                          | —           | Quyết lai scope          |
| 23  | **Sparklines**          | Hoan                                          | —           | —                        |

### Do hieu nang

| Muc do      | Phuong phap                                                   | Muc tieu                         |
| ----------- | ------------------------------------------------------------- | -------------------------------- |
| Bundle size | `vite build --mode production` + `npx vite-bundle-visualizer` | Ghi nhan tong size, chunk Univer |
| Load time   | Performance.now() trong useUniver: start → first render       | < 3s cho workbook 10k cells      |
| Scroll FPS  | Chrome DevTools Performance tab, scroll 1000 rows             | >= 30 FPS                        |
| Memory      | Chrome DevTools Memory tab, workbook 100k cells               | Khong memory leak sau 5 min      |

## Implementation Steps

1. **Bundle size**: chay `pnpm --filter @office/sheets build`, ghi nhan output size, dung `vite-bundle-visualizer` xem chunk breakdown.

2. **Load time**: them `performance.now()` vao `useUniver` hook: measure start → univerAPI ready → first render. Test voi 3 kich thuoc workbook:
   - 100 rows × 10 cols = 1k cells
   - 1000 rows × 10 cols = 10k cells
   - 10000 rows × 10 cols = 100k cells

3. **Scroll performance**: mo workbook 10k cells, scroll nhu nguoi that, do FPS qua Chrome DevTools.

4. **Memory**: mo workbook 100k cells, kiem tra memory growth qua 5 phut.

5. **Community chart plugin danh gia**:
   - Clone `xxs3315/univer-chart-plugin`, doc code.
   - Xac dinh: dung Univer version nao, co compatible voi v0.23 khong.
   - Xac dinh: co can file Pro khong, hay chi dung OSS core.
   - Ghi nhan vao checklist.

6. **Theme/Dark mode**: test `defaultTheme` cua Univer, thay doi mau sac co anh huong gi khong.

7. **Dien day checklist**: moi dong co trang thai: ✅ (OSS co) / ⚠️ (can tu lam) / ❌ (hoan).

## Related Code Files

- `apps/sheets/src/hooks/useUniver.ts` — them performance measurement.
- `apps/sheets/vite.config.ts` — them analyzer plugin.
- `docs/brainstorm-sheets-univer-survey.md` — cap nhat checklist.

## Success Criteria

- Bundle size duoc ghi nhan (dang B, chunk breakdown).
- Load time duoc do cho 3 kich thuoc workbook.
- Checklist gap hoan tat, moi muc co trang thai ro.
- Community chart plugin da danh gia (kha thi / khong kha thi + ly do).
- Dark mode: xac nhan Univer OSS co ho tro hay khong.
