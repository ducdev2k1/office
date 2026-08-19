import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Editor } from '@tiptap/core';
import { DEFAULT_PAGE_SETUP, PAPER_SIZES, type DocRecord, type PageSetup } from '@/types/docs.types';
import { HorizontalRuler } from './HorizontalRuler';
import { RulerGuideLine } from './RulerGuideLine';
import { type RulerUnit } from './ruler.utils';
import { useRuler } from './useRuler';

interface DocRulerProps {
  editor: Editor | null;
  activeDoc: DocRecord | undefined;
  onPageSetupChange: (setup: PageSetup) => void;
  onPaginationUpdate: (immediate?: boolean) => void;
}

export const DocRuler = ({
  editor,
  activeDoc,
  onPageSetupChange,
  onPaginationUpdate,
}: DocRulerProps) => {
  const [unit, setUnit] = useState<RulerUnit>(() => {
    const saved = localStorage.getItem('office_ruler_unit');
    return saved === 'in' ? 'in' : 'cm';
  });

  const [currentIndents, setCurrentIndents] = useState({
    firstLineIndent: 0,
    leftIndent: 0,
    rightIndent: 0,
  });

  const pageSetup = activeDoc?.pageSetup;
  const defaults = DEFAULT_PAGE_SETUP();
  const paperSize = pageSetup?.paperSize ?? defaults.paperSize;
  const orientation = pageSetup?.orientation ?? defaults.orientation;
  const rawSize = PAPER_SIZES[paperSize] ?? PAPER_SIZES.a4;

  const paperWidthMm = orientation === 'landscape' ? rawSize.height : rawSize.width;
  const paperHeightMm = orientation === 'landscape' ? rawSize.width : rawSize.height;

  const margins = useMemo(
    () => pageSetup?.margins ?? defaults.margins,
    [pageSetup?.margins, defaults.margins],
  );

  // Sync indents from TipTap editor selection
  useEffect(() => {
    if (!editor) return;

    const syncIndents = () => {
      const parent = editor.state.selection.$from.parent;
      const attrs = parent?.attrs ?? {};

      setCurrentIndents({
        firstLineIndent: typeof attrs.firstLineIndent === 'number' ? attrs.firstLineIndent : 0,
        leftIndent: typeof attrs.leftIndent === 'number' ? attrs.leftIndent : 0,
        rightIndent: typeof attrs.rightIndent === 'number' ? attrs.rightIndent : 0,
      });
    };

    editor.on('selectionUpdate', syncIndents);
    editor.on('transaction', syncIndents);
    syncIndents();

    return () => {
      editor.off('selectionUpdate', syncIndents);
      editor.off('transaction', syncIndents);
    };
  }, [editor]);

  const handleMarginChange = useCallback(
    (nextMargins: typeof margins) => {
      if (!activeDoc || !pageSetup) return;
      const nextSetup: PageSetup = {
        ...pageSetup,
        margins: nextMargins,
      };
      onPageSetupChange(nextSetup);
      onPaginationUpdate(true);
    },
    [activeDoc, pageSetup, onPageSetupChange, onPaginationUpdate],
  );

  const handleIndentChange = useCallback(
    (nextIndents: typeof currentIndents) => {
      setCurrentIndents(nextIndents);
      if (!editor || !editor.isEditable) return;
      editor.chain().setIndents(nextIndents).run();
    },
    [editor],
  );

  const handleToggleUnit = useCallback(() => {
    setUnit((prev) => {
      const next = prev === 'cm' ? 'in' : 'cm';
      localStorage.setItem('office_ruler_unit', next);
      return next;
    });
  }, []);

  const rulerHook = useRuler({
    unit,
    paperWidthMm,
    paperHeightMm,
    margins,
    indents: currentIndents,
    onMarginChange: handleMarginChange,
    onIndentChange: handleIndentChange,
  });

  return (
    <>
      <div className="ruler flex justify-center w-full bg-card/60 border-b border-border/80 shrink-0 z-30">
        <HorizontalRuler
          paperWidthMm={paperWidthMm}
          margins={margins}
          indents={currentIndents}
          unit={unit}
          onToggleUnit={handleToggleUnit}
          rulerHook={rulerHook}
        />
      </div>

      <RulerGuideLine dragState={rulerHook.dragState} />
    </>
  );
};
