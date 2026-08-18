import { useCallback, useMemo, useState } from 'react';
import { PAPER_SIZES, type DocRecord, type PageSetup } from '@/types/docs.types';
import { VerticalRuler } from './VerticalRuler';
import { RulerGuideLine } from './RulerGuideLine';
import { type RulerUnit } from './ruler.utils';
import { useRuler } from './useRuler';

interface DocVerticalRulerProps {
  activeDoc: DocRecord | undefined;
  onPageSetupChange: (setup: PageSetup) => void;
  onPaginationUpdate: (immediate?: boolean) => void;
  scrollTop?: number;
}

export const DocVerticalRuler = ({
  activeDoc,
  onPageSetupChange,
  onPaginationUpdate,
  scrollTop = 0,
}: DocVerticalRulerProps) => {
  const [unit] = useState<RulerUnit>(() => {
    const saved = localStorage.getItem('office_ruler_unit');
    return saved === 'in' ? 'in' : 'cm';
  });

  const pageSetup = activeDoc?.pageSetup;
  const paperSize = pageSetup?.paperSize ?? 'a4';
  const orientation = pageSetup?.orientation ?? 'portrait';
  const rawSize = PAPER_SIZES[paperSize] ?? PAPER_SIZES.a4;

  const paperWidthMm = orientation === 'landscape' ? rawSize.height : rawSize.width;
  const paperHeightMm = orientation === 'landscape' ? rawSize.width : rawSize.height;

  const margins = useMemo(
    () => pageSetup?.margins ?? { top: 20, right: 15, bottom: 20, left: 15 },
    [pageSetup?.margins],
  );

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

  const rulerHook = useRuler({
    unit,
    paperWidthMm,
    paperHeightMm,
    margins,
    indents: { firstLineIndent: 0, leftIndent: 0, rightIndent: 0 },
    onMarginChange: handleMarginChange,
    onIndentChange: () => {},
  });

  return (
    <>
      <VerticalRuler
        paperHeightMm={paperHeightMm}
        margins={margins}
        unit={unit}
        rulerHook={rulerHook}
        scrollTop={scrollTop}
      />
      <RulerGuideLine dragState={rulerHook.dragState} />
    </>
  );
};
