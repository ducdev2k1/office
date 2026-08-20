# Phase 4: Viet bao cao + De xuat MVP + Quyet dinh go/no-go

## Overview

- **Priority**: P1 | **Status**: completed | **Effort**: 10h
- Muc tieu: tong hop ket qua 3 phase truoc thanh bao cao cuoi cung, de xuat pham vi MVP Sheets, va co quyet dinh go/no-go cho Univer OSS.

## Requirements

1. Viet bao cao tong hop (tieng Viet) bao gom:
   - Tom tat khao sat (ung dung, tinh nang, hieu nang).
   - Bang gap tinh nang hoan tat (tu Phase 3).
   - Danh gia community chart plugin + ket luan.
   - Pipeline ExcelJS → snapshot: kha thi, gap, thoi gian du kien.
   - Hieu nang: bundle size, load time, scroll, memory.
   - Quyet dinh go/no-go voi ly do.
   - De xuat pham vi MVP (tinh nang nao lam dau, tinh nang nao hoan).
   - Danh gia thoi gian du kien cho tung phan cua MVP.
   - Risk register cap nhat (tu research + thuc te khao sat).
2. Cap nhat `docs/brainstorm-sheets-univer-survey.md` voi ket qua thuc te.
3. De xuat implementation plan chi tiet cho MVP Sheets (neu go).

## Structure bao cao

```markdown
# Bao cao khao sat Univer — Giai doan 6 (Sheets)

## 1. Tom tat dieu hanh

## 2. Ket qua khao sat

### 2.1 Prototype: Univer v0.23 OSS

### 2.2 Pipeline nhap/xuat xlsx (ExcelJS → snapshot)

### 2.3 Hieu nang

### 2.4 Checklist gap tinh nang

### 2.5 Danh gia community chart plugin

### 2.6 Dark mode va theme

## 3. Quyet dinh go/no-go

## 4. De xuat pham vi MVP

### 4.1 Tinh nang trong MVP

### 4.2 Tinh nang hoan/bo qua

### 4.3 Thu tu uu tien

### 4.4 Thoi gian du kien

## 5. Risk register cap nhat

## 6. Recommend tiep theo
```

## Implementation Steps

1. **Tong hop du lieu tu Phase 1–3**: doc lai moi phase, lay so lieu (bundle, load time, checklist, gap).

2. **Viet phan 1–2**: tom tat + ket qua khao sat (prototype, pipeline, hieu nang).

3. **Viet bang gap tinh nang**: moi dong co trang thai: OSS co ✅ / Can tu lam ⚠️ / Hoan ❌, voi ghi chu phuong an.

4. **Quyet dinh go/no-go**:
   - **Go**: neu gap tinh nang co the xu ly duoc voi ExcelJS + echarts (hoac hoan charts), load time < 5s, bundle size chap nhan duoc.
   - **No-go**: neu gap qua lon (khong convert duoc xlsx, Univer OSS khong on dinh, hieu nang kem).
   - **Conditional go**: neu mot so tinh nang can hoan, nhung co the bat dau MVP voi pham vi nho.

5. **De xuat MVP**:
   - Pham vi MVP: chi nhung tinh nang ✅ (OSS co) + nhung tinh nang �an tu lam ma da xac nhan kha thi.
   - Thu tu uu tien: (1) scaffold, (2) nhap/xuat xlsx, (3) tinh nang OSS co ban, (4) charts (neu kha thi), (5) collaboration (hoan).
   - Thoi gian du kien cho tung phan.

6. **Cap nhat `docs/brainstorm-sheets-univer-survey.md`** voi ket qua thuc te (thay vi du doan nhu hien tai).

7. **De xuat tao implementation plan chi tiet** (neu go): fomart giong `plans/260816-editor-basics/plan.md`.

## Related Code Files

- `docs/brainstorm-sheets-univer-survey.md` — cap nhat.
- `plans/260818-sheets-survey/plan.md` — cap nhat trang thai.

## Success Criteria

- Bao cao hoan tat, doc duoc boi ca ky thuat va quan ly.
- Quyet dinh go/no-go co ly do ro rang.
- Neu go: co pham vi MVP + thoi gian du kien.
- Neu no-go: co danh gia phuong an thay the (hoac dong y hoan cho den khi Univer 1.0).
