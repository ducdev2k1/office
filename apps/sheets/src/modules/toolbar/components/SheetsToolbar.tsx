import { AlignmentTools } from '@/modules/toolbar/components/AlignmentTools';
import { CellFormatTools } from '@/modules/toolbar/components/CellFormatTools';
import { FontPicker } from '@/modules/toolbar/components/FontPicker';
import { FormulaTools } from '@/modules/toolbar/components/FormulaTools';
import { InsertTools } from '@/modules/toolbar/components/InsertTools';
import { NumberFormatTools } from '@/modules/toolbar/components/NumberFormatTools';
import { QuickActions } from '@/modules/toolbar/components/QuickActions';
import { TextFormatTools } from '@/modules/toolbar/components/TextFormatTools';
import { useSheetsToolbarState } from '@/modules/toolbar/hooks/useSheetsToolbarState';
import type { SheetsToolbarProps } from '@/modules/toolbar/types/toolbar.types';
import { Separator } from '@office/ui-kit';

const Sep = () => (
  <Separator orientation="vertical" className="mx-1 h-5 w-px shrink-0 bg-border/60" />
);

export const SheetsToolbar = ({ univerAPI, onPrint, onInsertChart }: SheetsToolbarProps) => {
  const { state, actions } = useSheetsToolbarState(univerAPI);

  return (
    <div
      role="toolbar"
      aria-label="Thanh công cụ Bảng tính"
      className="flex h-10 min-w-0 shrink-0 items-center gap-0.5 overflow-x-auto border-b border-border bg-background px-3 py-1 text-xs select-none"
    >
      {/* 1. History, Print, Paint Format & Zoom */}
      <QuickActions
        onUndo={actions.undo}
        onRedo={actions.redo}
        onPrint={onPrint}
        isPaintingFormat={state.isPaintingFormat}
        onTogglePaintFormat={actions.togglePaintFormat}
        zoom={state.zoom}
        onSetZoom={actions.setZoom}
      />

      <Sep />

      {/* 2. Number Formatting */}
      <NumberFormatTools
        currentFormat={state.numberFormat}
        onSetNumberFormat={actions.setNumberFormat}
        onAdjustDecimals={actions.adjustDecimals}
      />

      <Sep />

      {/* 3. Font Family */}
      <FontPicker
        currentFont={state.fontFamily}
        onSelectFont={actions.setFontFamily}
      />

      <Sep />

      {/* 4. Text Styles & Colors */}
      <TextFormatTools
        fontSize={state.fontSize}
        bold={state.bold}
        italic={state.italic}
        underline={state.underline}
        strikethrough={state.strikethrough}
        textColor={state.textColor}
        fillColor={state.fillColor}
        onFontSizeChange={actions.setFontSize}
        onToggleBold={actions.toggleBold}
        onToggleItalic={actions.toggleItalic}
        onToggleUnderline={actions.toggleUnderline}
        onToggleStrikethrough={actions.toggleStrikethrough}
        onTextColorChange={actions.setTextColor}
        onFillColorChange={actions.setFillColor}
      />

      <Sep />

      {/* 5. Cell Borders & Merge */}
      <CellFormatTools
        isMerged={state.isMerged}
        onToggleMerge={actions.toggleMerge}
        onMergeAll={actions.mergeAll}
        onMergeHorizontal={actions.mergeHorizontal}
        onMergeVertical={actions.mergeVertical}
        onUnmerge={actions.unmerge}
        onApplyBorder={actions.applyBorder}
      />

      <Sep />

      {/* 6. Alignments, Text Wrap & Rotation */}
      <AlignmentTools
        horizontalAlign={state.horizontalAlign}
        verticalAlign={state.verticalAlign}
        wrapMode={state.wrapMode}
        textRotation={state.textRotation}
        onHorizontalAlignChange={actions.setHorizontalAlign}
        onVerticalAlignChange={actions.setVerticalAlign}
        onSetWrapMode={actions.setWrapMode}
        onSetTextRotation={actions.setTextRotation}
      />

      <Sep />

      {/* 7. Insert Tools (Chart, Link, Checkbox, Filter) */}
      <InsertTools
        onInsertChart={onInsertChart}
        onInsertLink={actions.insertLink}
        onInsertCheckbox={actions.insertCheckbox}
        onCreateFilter={actions.createFilter}
      />

      <Sep />

      {/* 8. Formulas, Clear Formatting & Search */}
      <FormulaTools
        onInsertFormula={actions.insertFormula}
        onClearFormatting={actions.clearFormatting}
        onOpenFindReplace={actions.openFindReplace}
      />
    </div>
  );
};
