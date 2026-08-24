import {
  PAPER_DIMENSIONS_MM,
  PRINT_MARGINS_MM,
} from '@/modules/print/constants/print.constants';
import type { PrintSettings } from '@/modules/print/types/print.types';
import { indexToColumnLetter, parseRangeString } from '@/modules/charts/utils/dataRangeParser.utils';
import type { ICellData, IWorkbookData, IWorksheetData } from '@univerjs/presets';
import { jsPDF } from 'jspdf';

const DEFAULT_ROW_HEIGHT_PX = 24;
const DEFAULT_COL_WIDTH_PX = 80;
const PX_TO_MM = 0.264583;

const getCellDisplayString = (cell?: ICellData): string => {
  if (!cell) return '';
  if (cell.v !== undefined && cell.v !== null) {
    if (typeof cell.v === 'number') {
      return Number.isInteger(cell.v) ? cell.v.toLocaleString('vi-VN') : cell.v.toString();
    }
    return String(cell.v);
  }
  return '';
};

export const exportWorksheetToPdf = async (
  workbook: IWorkbookData,
  activeSheetId: string,
  settings: PrintSettings,
): Promise<Blob> => {
  const sheet = workbook.sheets?.[activeSheetId] || Object.values(workbook.sheets || {})[0];
  if (!sheet) {
    throw new Error('Worksheet not found');
  }

  const paper = PAPER_DIMENSIONS_MM[settings.paperSize];
  const pageWidth = settings.orientation === 'portrait' ? paper.width : paper.height;
  const pageHeight = settings.orientation === 'portrait' ? paper.height : paper.width;
  const margins = PRINT_MARGINS_MM[settings.margins];

  const printableWidth = pageWidth - margins.left - margins.right;
  const printableHeight = pageHeight - margins.top - margins.bottom;

  // Determine row and column boundaries
  let minRow = 0;
  let maxRow = 15;
  let minCol = 0;
  let maxCol = 6;

  if (settings.range === 'selection' && settings.selectedRange) {
    const parsedRange = parseRangeString(settings.selectedRange);
    if (parsedRange) {
      minRow = parsedRange.startRow;
      maxRow = parsedRange.endRow;
      minCol = parsedRange.startCol;
      maxCol = parsedRange.endCol;
    }
  } else if (sheet.cellData) {
    const rowKeys = Object.keys(sheet.cellData).map(Number);
    if (rowKeys.length > 0) {
      minRow = 0;
      maxRow = Math.max(...rowKeys, 10);
      let foundMaxCol = 0;
      rowKeys.forEach((r) => {
        const row = sheet.cellData?.[r];
        if (row) {
          const colKeys = Object.keys(row).map(Number);
          if (colKeys.length > 0) {
            foundMaxCol = Math.max(foundMaxCol, ...colKeys);
          }
        }
      });
      maxCol = Math.max(foundMaxCol, 5);
    }
  }

  const rowHeaderWidth = settings.showHeaders ? 12 : 0;
  const colHeaderHeight = settings.showHeaders ? 8 : 0;

  // Calculate raw table dimensions
  const colWidthsMm: number[] = [];
  for (let c = minCol; c <= maxCol; c++) {
    const px = sheet.columnData?.[c]?.w ?? DEFAULT_COL_WIDTH_PX;
    colWidthsMm.push(px * PX_TO_MM);
  }

  const rawTableWidth = colWidthsMm.reduce((acc, w) => acc + w, 0) + rowHeaderWidth;

  // Calculate scaling factor
  let scale = 1.0;
  if (settings.scale === 'fitWidth' || settings.scale === 'fitPage') {
    if (rawTableWidth > printableWidth) {
      scale = printableWidth / rawTableWidth;
    }
  }

  const finalColWidths = colWidthsMm.map((w) => w * scale);
  const finalRowHeaderWidth = rowHeaderWidth * scale;
  const finalColHeaderHeight = colHeaderHeight * scale;

  const pdf = new jsPDF({
    orientation: settings.orientation,
    unit: 'mm',
    format: settings.paperSize,
  });

  let currentY = margins.top;

  const drawHeaders = (startX: number, startY: number) => {
    if (!settings.showHeaders) return;

    pdf.setFontSize(8 * scale);
    pdf.setTextColor(100, 100, 100);
    pdf.setFillColor(245, 245, 245);
    pdf.setDrawColor(200, 200, 200);

    // Corner cell
    pdf.rect(startX, startY, finalRowHeaderWidth, finalColHeaderHeight, 'FD');

    // Column headers (A, B, C...)
    let colX = startX + finalRowHeaderWidth;
    for (let c = minCol; c <= maxCol; c++) {
      const w = finalColWidths[c - minCol] || 20 * scale;
      pdf.rect(colX, startY, w, finalColHeaderHeight, 'FD');
      const label = indexToColumnLetter(c);
      pdf.text(label, colX + w / 2, startY + finalColHeaderHeight / 2 + 1, { align: 'center' });
      colX += w;
    }
  };

  // Draw Title & Metadata Header
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(20, 20, 20);
  pdf.text(sheet.name || 'Worksheet', margins.left, currentY + 4);
  currentY += 10;

  drawHeaders(margins.left, currentY);
  currentY += finalColHeaderHeight;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9 * scale);

  for (let r = minRow; r <= maxRow; r++) {
    const rawH = sheet.rowData?.[r]?.h ?? DEFAULT_ROW_HEIGHT_PX;
    const rowH = rawH * PX_TO_MM * scale;

    // Check pagination
    if (currentY + rowH > pageHeight - margins.bottom) {
      pdf.addPage(settings.paperSize, settings.orientation);
      currentY = margins.top;
      drawHeaders(margins.left, currentY);
      currentY += finalColHeaderHeight;
    }

    let currentX = margins.left;

    // Row Header (1, 2, 3...)
    if (settings.showHeaders) {
      pdf.setFillColor(245, 245, 245);
      pdf.setDrawColor(200, 200, 200);
      pdf.rect(currentX, currentY, finalRowHeaderWidth, rowH, 'FD');
      pdf.setTextColor(100, 100, 100);
      pdf.text(String(r + 1), currentX + finalRowHeaderWidth / 2, currentY + rowH / 2 + 1, {
        align: 'center',
      });
      currentX += finalRowHeaderWidth;
    }

    // Row Cells
    for (let c = minCol; c <= maxCol; c++) {
      const colW = finalColWidths[c - minCol] || 20 * scale;
      const cellData = sheet.cellData?.[r]?.[c];
      const text = getCellDisplayString(cellData);

      if (settings.showGridlines) {
        pdf.setDrawColor(220, 220, 220);
        pdf.rect(currentX, currentY, colW, rowH);
      }

      if (text) {
        pdf.setTextColor(30, 30, 30);
        const textY = currentY + rowH / 2 + 1.2 * scale;
        const textX = typeof cellData?.v === 'number' ? currentX + colW - 2 * scale : currentX + 2 * scale;
        const align = typeof cellData?.v === 'number' ? 'right' : 'left';
        
        // Truncate text if it overflows cell width
        const maxTextWidth = colW - 3 * scale;
        const renderedText = pdf.getTextWidth(text) > maxTextWidth ? `${text.slice(0, 15)}...` : text;
        pdf.text(renderedText, textX, textY, { align });
      }

      currentX += colW;
    }

    currentY += rowH;
  }

  return pdf.output('blob');
};
