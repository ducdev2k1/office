# Phase 2: Khao sat chieu doc xlsx + pipeline ExcelJS → Univer snapshot

## Overview

- **Priority**: P1 | **Status**: completed | **Effort**: 12h
- Muc tieu: xac nhan con duong nhap file xlsx vao Univer OSS. Univer OSS khong co import/export — phai dung ExcelJS doc xlsx → convert sang `IWorkbookData` snapshot → `univerAPI.loadSnapshot()`. Phase nay dung chinh de chung minh kha thi.

## Requirements

1. Cai `exceljs` (MIT) vao `apps/sheets`.
2. Nhan 1 file xlsx mau (tao bang ExcelJS hoac lay file thuc te) — doc duoc, hien thi dung tren Univer canvas.
3. Xac dinh do phuc tap cua `IWorkbookData` (Univer snapshot format): cell values, styles, merge cells, column widths, row heights.
4. Ghi nhan gap: nhung gi ExcelJS doc duoc nhung Univer OSS khong hien thi duoc (sau nay can `packages/xlsx-io` xu ly).
5. Xac nhan: ghi lai file xlsx tu Univer snapshot bang ExcelJS co kha thi khong (chia 2 buoc: doc + ghi).

## Architecture

**Pipeline nhap xlsx:**
```text
File .xlsx (tren may / IndexedDB)
  → ExcelJS.readFile() → workbook object
  → Convert sang IWorkbookData (Univer snapshot)
  → univerAPI.loadSnapshot(workbookData)
  → Univer canvas hien thi
```

**IWorkbookData format** (tu Univer docs):
```ts
interface IWorkbookData {
  id?: string;
  name?: string;
  sheetOrder?: string[];
  sheets: {
    [sheetId: string]: {
      name?: string;
      cellData: {
        [row: number]: {
          [col: number]: {
            v?: any;        // gia tri
            s?: string;     // style id
            t?: number;     // type
            f?: string;     // formula
            // ...
          };
        };
      };
      columnWidth?: { [col: number]: number };
      rowHeight?: { [row: number]: number };
      mergeData?: IRange[];
      // ...
    };
  };
}
```

## Implementation Steps

1. **Cai ExcelJS**: `pnpm add exceljs` trong `apps/sheets`.

2. **Tao xlsx mau bang code** (de kiem soat):
   ```ts
   const wb = new ExcelJS.Workbook();
   const ws = wb.addWorksheet('Sheet1');
   ws.getCell('A1').value = 'Ten';
   ws.getCell('B1').value = 'Gia tri';
   ws.getCell('A2').value = 'Hang 1';
   ws.getCell('B2').value = 12345;
   ws.getColumn(1).width = 20;
   ws.addRow([3, 4, 5]);
   await wb.xlsx.writeFile('/tmp/test.xlsx');
   ```

3. **Viet convert function** `exceljsToUniver(workbook: ExcelJS.Workbook): IWorkbookData`:
   - Iterate sheets → map sheetId
   - Iterate rows → map cellData (v, t, s, f)
   - Map columnWidth, rowHeight
   - Map mergeData
   - Map number formats, font styles, borders → Univer style model

4. **Tich hop vao prototype**: them button "Open XLSX" → FileReader → ExcelJS.readFile → convert → loadSnapshot.

5. **Test voi 3 file**:
   - File don gian (1 sheet, 10x10 cells, text + so).
   - File phuc tap hon (merge cells, formula, so format, column widths).
   - File lon (1000 rows × 20 cols) — kiem tra co load duoc khong.

6. **Ghi nhan gap** ( viet vao report phase 4):
   - Style nao convert duoc / khong convert duoc.
   - Toc do convert cho file lon.
   - Formula: ExcelJS doc duoc formula string, Univer OSS co tinh toan duoc khong (dung formula engine OSS).

## Related Code Files

- `packages/xlsx-io/src/index.ts` — placeholder, phan tach tu day.
- `apps/sheets/src/` — them hook `useXlsxImport.ts` va util `exceljsToUniver.utils.ts`.

## Success Criteria

- File xlsx don gian mo duoc tren Univer OSS, du lieu hien thi dung.
- Co 1 convert function hoan chinh, ghi nhan duoc gap.
- Xac nhan: `univerAPI.getWorkbook().getSnapshot()` lay duoc snapshot sau khi load — co the dung de kiem tra.
