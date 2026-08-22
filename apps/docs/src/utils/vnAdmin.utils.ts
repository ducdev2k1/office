import type { PageSetup } from '@/types/docs.types';

export interface VnAdminComplianceReport {
  isPaperSizeCompliant: boolean;
  isMarginTopCompliant: boolean;
  isMarginBottomCompliant: boolean;
  isMarginLeftCompliant: boolean;
  isMarginRightCompliant: boolean;
  isAllMarginsCompliant: boolean;
  isCompliant: boolean;
}

// Convert points to millimeters (1 pt ≈ 0.352778 mm)
const ptToMm = (pt: number) => pt * 0.352778;

export const checkVnAdminCompliance = (setup?: PageSetup): VnAdminComplianceReport => {
  const paperSize = setup?.paperSize ?? 'A4';
  const isPaperSizeCompliant = paperSize.toUpperCase() === 'A4';

  const margins = setup?.margins ?? { top: 56.7, right: 42.5, bottom: 56.7, left: 85.0 };
  const topMm = ptToMm(margins.top);
  const bottomMm = ptToMm(margins.bottom);
  const leftMm = ptToMm(margins.left);
  const rightMm = ptToMm(margins.right);

  const isMarginTopCompliant = topMm >= 19.5 && topMm <= 25.5;
  const isMarginBottomCompliant = bottomMm >= 19.5 && bottomMm <= 25.5;
  const isMarginLeftCompliant = leftMm >= 29.5 && leftMm <= 35.5;
  const isMarginRightCompliant = rightMm >= 14.5 && rightMm <= 20.5;

  const isAllMarginsCompliant =
    isMarginTopCompliant && isMarginBottomCompliant && isMarginLeftCompliant && isMarginRightCompliant;

  const isCompliant = isPaperSizeCompliant && isAllMarginsCompliant;

  return {
    isPaperSizeCompliant,
    isMarginTopCompliant,
    isMarginBottomCompliant,
    isMarginLeftCompliant,
    isMarginRightCompliant,
    isAllMarginsCompliant,
    isCompliant,
  };
};

// Standard margins per NĐ 30/2020: Top 20mm, Bottom 20mm, Left 30mm, Right 15mm (converted to pt)
// 1 mm ≈ 2.83465 pt
export const STANDARD_VN_ADMIN_PAGE_SETUP: PageSetup = {
  paperSize: 'a4',
  orientation: 'portrait',
  margins: {
    top: 56.7, // 20 mm
    bottom: 56.7, // 20 mm
    left: 85.0, // 30 mm
    right: 42.5, // 15 mm
  },
};
