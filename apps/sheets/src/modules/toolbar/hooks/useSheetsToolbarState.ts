import type {
  CopiedFormat,
  SheetsToolbarActions,
  TextRotationAngle,
  TextWrapMode,
  ToolbarState,
} from '@/modules/toolbar/types/toolbar.types';
import { BorderStyleTypes, BorderType, WrapStrategy, type FUniver } from '@univerjs/presets';
import { useCallback, useEffect, useRef, useState } from 'react';

const DEFAULT_STATE: ToolbarState = {
  fontFamily: 'Arial',
  fontSize: 11,
  bold: false,
  italic: false,
  underline: false,
  strikethrough: false,
  textColor: '#000000',
  fillColor: '',
  horizontalAlign: 'left',
  verticalAlign: 'bottom',
  wrap: false,
  wrapMode: 'overflow',
  textRotation: 0,
  isMerged: false,
  numberFormat: 'General',
  zoom: 100,
  isPaintingFormat: false,
};

export const useSheetsToolbarState = (univerAPI: FUniver | null) => {
  const [state, setState] = useState<ToolbarState>(DEFAULT_STATE);
  const copiedFormatRef = useRef<CopiedFormat | null>(null);

  const getActiveRange = useCallback(() => {
    if (!univerAPI) return null;
    const wb = univerAPI.getActiveWorkbook();
    const ws = wb?.getActiveSheet();
    return ws?.getActiveRange() || ws?.getSelection()?.getActiveRange() || null;
  }, [univerAPI]);

  const getActiveWorksheet = useCallback(() => {
    if (!univerAPI) return null;
    return univerAPI.getActiveWorkbook()?.getActiveSheet() || null;
  }, [univerAPI]);

  const syncStateFromRange = useCallback(() => {
    const range = getActiveRange();
    if (!range) return;

    try {
      const styleData = range.getCellStyleData();
      const fontFam = range.getFontFamily() || 'Arial';
      const fontSz = range.getFontSize() || 11;
      const rawHAlign = range.getHorizontalAlignment();
      const hAlign: 'left' | 'center' | 'right' =
        rawHAlign === 'normal' || rawHAlign === 'right'
          ? 'right'
          : rawHAlign === 'center'
            ? 'center'
            : 'left';
      const vAlign = (range.getVerticalAlignment() as 'top' | 'middle' | 'bottom') || 'bottom';
      const isWrap = Boolean(range.getWrap());
      const isMerged = Boolean(range.isMerged());
      const bg = range.getBackground() || '';

      const isBold = Boolean(styleData?.bl);
      const isItalic = Boolean(styleData?.it);
      const underlineVal = styleData?.ul;
      const strikeVal = styleData?.st;
      const colorVal = styleData?.cl?.rgb || '#000000';
      const numFmt = styleData?.n?.pattern || 'General';

      // Text wrap mode detection
      const wrapStrat = styleData?.tb;
      const currentWrapMode: TextWrapMode =
        wrapStrat === WrapStrategy.WRAP ? 'wrap' : wrapStrat === WrapStrategy.CLIP ? 'clip' : 'overflow';

      // Text rotation
      const rotationAngle = (styleData?.tr?.a as TextRotationAngle) || 0;

      // Zoom ratio
      const ws = getActiveWorksheet();
      const wsExt = ws as unknown as { getZoomRatio?: () => number };
      const zoomRatio = wsExt?.getZoomRatio?.() ? Math.round(wsExt.getZoomRatio() * 100) : 100;

      // Handle format painter apply on destination selection
      if (copiedFormatRef.current && state.isPaintingFormat) {
        const cf = copiedFormatRef.current;
        if (cf.fontFamily) range.setFontFamily(cf.fontFamily);
        if (cf.fontSize) range.setFontSize(cf.fontSize);
        if (cf.bold !== undefined) range.setFontWeight(cf.bold ? 'bold' : 'normal');
        if (cf.italic !== undefined) range.setFontStyle(cf.italic ? 'italic' : 'normal');
        if (cf.underline !== undefined) range.setFontLine(cf.underline ? 'underline' : 'none');
        if (cf.strikethrough !== undefined) range.setFontLine(cf.strikethrough ? 'line-through' : 'none');
        if (cf.textColor) range.setFontColor(cf.textColor);
        if (cf.fillColor !== undefined) range.setBackground(cf.fillColor);
        if (cf.horizontalAlign) range.setHorizontalAlignment(cf.horizontalAlign === 'right' ? 'normal' : cf.horizontalAlign);
        if (cf.verticalAlign) range.setVerticalAlignment(cf.verticalAlign);
        if (cf.wrap !== undefined) range.setWrapStrategy(cf.wrap ? WrapStrategy.WRAP : WrapStrategy.OVERFLOW);
        if (cf.numberFormat) {
          const curVal = range.getValue();
          range.setValue({ v: curVal ?? undefined, s: { n: { pattern: cf.numberFormat } } });
        }
        copiedFormatRef.current = null;
        setState((prev) => ({ ...prev, isPaintingFormat: false }));
        return;
      }

      setState((prev) => ({
        ...prev,
        fontFamily: fontFam,
        fontSize: fontSz,
        bold: isBold,
        italic: isItalic,
        underline: Boolean(underlineVal && typeof underlineVal === 'object' && underlineVal.s),
        strikethrough: Boolean(strikeVal && typeof strikeVal === 'object' && strikeVal.s),
        textColor: colorVal,
        fillColor: bg,
        horizontalAlign: hAlign,
        verticalAlign: vAlign,
        wrap: isWrap,
        wrapMode: currentWrapMode,
        textRotation: rotationAngle,
        isMerged,
        numberFormat: numFmt,
        zoom: zoomRatio,
      }));
    } catch {
      // ignore
    }
  }, [getActiveRange, getActiveWorksheet, state.isPaintingFormat]);

  useEffect(() => {
    if (!univerAPI) return;
    syncStateFromRange();
    const disposable = univerAPI.onCommandExecuted?.(() => {
      syncStateFromRange();
    });
    return () => {
      disposable?.dispose?.();
    };
  }, [univerAPI, syncStateFromRange]);

  const actions: SheetsToolbarActions = {
    undo: useCallback(() => {
      univerAPI?.undo();
    }, [univerAPI]),

    redo: useCallback(() => {
      univerAPI?.redo();
    }, [univerAPI]),

    togglePaintFormat: useCallback(() => {
      if (state.isPaintingFormat) {
        copiedFormatRef.current = null;
        setState((prev) => ({ ...prev, isPaintingFormat: false }));
      } else {
        copiedFormatRef.current = {
          fontFamily: state.fontFamily,
          fontSize: state.fontSize,
          bold: state.bold,
          italic: state.italic,
          underline: state.underline,
          strikethrough: state.strikethrough,
          textColor: state.textColor,
          fillColor: state.fillColor,
          horizontalAlign: state.horizontalAlign,
          verticalAlign: state.verticalAlign,
          wrap: state.wrap,
          numberFormat: state.numberFormat,
        };
        setState((prev) => ({ ...prev, isPaintingFormat: true }));
      }
    }, [state]),

    setZoom: useCallback(
      (zoom: number) => {
        const wb = univerAPI?.getActiveWorkbook();
        const ws = wb?.getActiveSheet();
        const unitId = wb?.getId();
        const subUnitId = ws?.getSheetId();
        if (unitId && subUnitId && univerAPI) {
          try {
            univerAPI.executeCommand?.('sheet.command.set-zoom-ratio', {
              zoomRatio: zoom / 100,
              unitId,
              subUnitId,
            });
          } catch {
            // ignore
          }
        }
        setState((prev) => ({ ...prev, zoom }));
      },
      [univerAPI],
    ),

    setFontFamily: useCallback(
      (font: string) => {
        const range = getActiveRange();
        range?.setFontFamily(font);
        setState((prev) => ({ ...prev, fontFamily: font }));
      },
      [getActiveRange],
    ),

    setFontSize: useCallback(
      (size: number) => {
        const range = getActiveRange();
        range?.setFontSize(size);
        setState((prev) => ({ ...prev, fontSize: size }));
      },
      [getActiveRange],
    ),

    toggleBold: useCallback(() => {
      const range = getActiveRange();
      const next = !state.bold;
      range?.setFontWeight(next ? 'bold' : 'normal');
      setState((prev) => ({ ...prev, bold: next }));
    }, [getActiveRange, state.bold]),

    toggleItalic: useCallback(() => {
      const range = getActiveRange();
      const next = !state.italic;
      range?.setFontStyle(next ? 'italic' : 'normal');
      setState((prev) => ({ ...prev, italic: next }));
    }, [getActiveRange, state.italic]),

    toggleUnderline: useCallback(() => {
      const range = getActiveRange();
      const next = !state.underline;
      range?.setFontLine(next ? 'underline' : 'none');
      setState((prev) => ({ ...prev, underline: next }));
    }, [getActiveRange, state.underline]),

    toggleStrikethrough: useCallback(() => {
      const range = getActiveRange();
      const next = !state.strikethrough;
      range?.setFontLine(next ? 'line-through' : 'none');
      setState((prev) => ({ ...prev, strikethrough: next }));
    }, [getActiveRange, state.strikethrough]),

    setTextColor: useCallback(
      (color: string) => {
        const range = getActiveRange();
        range?.setFontColor(color);
        setState((prev) => ({ ...prev, textColor: color }));
      },
      [getActiveRange],
    ),

    setFillColor: useCallback(
      (color: string) => {
        const range = getActiveRange();
        range?.setBackground(color);
        setState((prev) => ({ ...prev, fillColor: color }));
      },
      [getActiveRange],
    ),

    setHorizontalAlign: useCallback(
      (align: 'left' | 'center' | 'right') => {
        const range = getActiveRange();
        range?.setHorizontalAlignment(align === 'right' ? 'normal' : align);
        setState((prev) => ({ ...prev, horizontalAlign: align }));
      },
      [getActiveRange],
    ),

    setVerticalAlign: useCallback(
      (align: 'top' | 'middle' | 'bottom') => {
        const range = getActiveRange();
        range?.setVerticalAlignment(align);
        setState((prev) => ({ ...prev, verticalAlign: align }));
      },
      [getActiveRange],
    ),

    toggleWrap: useCallback(() => {
      const range = getActiveRange();
      const next = !state.wrap;
      range?.setWrapStrategy(next ? WrapStrategy.WRAP : WrapStrategy.OVERFLOW);
      setState((prev) => ({ ...prev, wrap: next, wrapMode: next ? 'wrap' : 'overflow' }));
    }, [getActiveRange, state.wrap]),

    setWrapMode: useCallback(
      (mode: TextWrapMode) => {
        const range = getActiveRange();
        const strat =
          mode === 'wrap' ? WrapStrategy.WRAP : mode === 'clip' ? WrapStrategy.CLIP : WrapStrategy.OVERFLOW;
        range?.setWrapStrategy(strat);
        setState((prev) => ({ ...prev, wrap: mode === 'wrap', wrapMode: mode }));
      },
      [getActiveRange],
    ),

    setTextRotation: useCallback(
      (angle: TextRotationAngle) => {
        const range = getActiveRange();
        if (!range) return;
        const curVal = range.getValue();
        range.setValue({
          v: curVal ?? undefined,
          s: { tr: { a: angle } },
        });
        setState((prev) => ({ ...prev, textRotation: angle }));
      },
      [getActiveRange],
    ),

    toggleMerge: useCallback(() => {
      const range = getActiveRange();
      if (!range) return;
      if (state.isMerged) {
        range.breakApart();
        setState((prev) => ({ ...prev, isMerged: false }));
      } else {
        range.merge();
        setState((prev) => ({ ...prev, isMerged: true }));
      }
    }, [getActiveRange, state.isMerged]),

    mergeAll: useCallback(() => {
      const range = getActiveRange();
      range?.merge();
      setState((prev) => ({ ...prev, isMerged: true }));
    }, [getActiveRange]),

    mergeHorizontal: useCallback(() => {
      const range = getActiveRange();
      range?.mergeAcross?.();
      setState((prev) => ({ ...prev, isMerged: true }));
    }, [getActiveRange]),

    mergeVertical: useCallback(() => {
      const range = getActiveRange();
      range?.merge();
      setState((prev) => ({ ...prev, isMerged: true }));
    }, [getActiveRange]),

    unmerge: useCallback(() => {
      const range = getActiveRange();
      range?.breakApart();
      setState((prev) => ({ ...prev, isMerged: false }));
    }, [getActiveRange]),

    setNumberFormat: useCallback(
      (pattern: string) => {
        const range = getActiveRange();
        if (!range) return;
        const curVal = range.getValue();
        range.setValue({
          v: curVal ?? undefined,
          s: { n: { pattern } },
        });
        setState((prev) => ({ ...prev, numberFormat: pattern }));
      },
      [getActiveRange],
    ),

    adjustDecimals: useCallback(
      (delta: number) => {
        const range = getActiveRange();
        if (!range) return;
        const pattern = delta > 0 ? '0.00' : '0';
        const curVal = range.getValue();
        range.setValue({
          v: curVal ?? undefined,
          s: { n: { pattern } },
        });
        setState((prev) => ({ ...prev, numberFormat: pattern }));
      },
      [getActiveRange],
    ),

    applyBorder: useCallback(
      (type: BorderType, style = BorderStyleTypes.THIN, color = '#000000') => {
        const range = getActiveRange();
        range?.setBorder(type, style, color);
      },
      [getActiveRange],
    ),

    insertFormula: useCallback(
      (formula: string) => {
        const range = getActiveRange();
        if (!range) return;
        range.setValue(`=${formula.toUpperCase()}()`);
      },
      [getActiveRange],
    ),

    insertLink: useCallback(
      (url?: string, text?: string) => {
        const range = getActiveRange();
        if (!range) return;
        const targetUrl = url || window.prompt('Nhập địa chỉ liên kết (URL):', 'https://');
        if (!targetUrl) return;
        const label = text || range.getValue() || targetUrl;
        range.setValue({
          f: `=HYPERLINK("${targetUrl}", "${label}")`,
          v: String(label),
        });
      },
      [getActiveRange],
    ),

    insertCheckbox: useCallback(() => {
      const range = getActiveRange();
      if (!range) return;
      range.setValue(false);
    }, [getActiveRange]),

    createFilter: useCallback(() => {
      const range = getActiveRange();
      if (!range) return;
      const rangeExt = range as unknown as { createFilter?: () => void };
      rangeExt?.createFilter?.();
    }, [getActiveRange]),

    clearFormatting: useCallback(() => {
      const range = getActiveRange();
      if (!range) return;
      range.setFontWeight('normal');
      range.setFontStyle('normal');
      range.setFontLine('none');
      range.setBackground('');
      range.setFontColor('#000000');
      range.setHorizontalAlignment('left');
      range.setVerticalAlignment('bottom');
      range.setWrap(false);
      range.setWrapStrategy(WrapStrategy.OVERFLOW);
      range.setValue({
        v: range.getValue() ?? undefined,
        s: { tr: { a: 0 }, n: { pattern: 'General' } },
      });
      setState((prev) => ({
        ...prev,
        ...DEFAULT_STATE,
        fontFamily: 'Arial',
        fontSize: 11,
      }));
    }, [getActiveRange]),

    openFindReplace: useCallback(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f', ctrlKey: true }));
    }, []),
  };

  return {
    state,
    actions,
  };
};
