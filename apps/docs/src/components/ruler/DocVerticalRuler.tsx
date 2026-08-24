import { useCallback, useMemo, useState } from 'react';
import {
  DEFAULT_PAGE_SETUP,
  PAPER_SIZES,
  type DocRecord,
  type PageSetup,
} from '@/types/docs.types';
import { VerticalRuler } from './VerticalRuler';
import { RulerGuideLine } from './RulerGuideLine';
import { type RulerUnit } from './ruler.utils';
import { useRuler } from './useRuler';

interface DocVerticalRulerProps {
  activeDoc: DocRecord | undefined;
  onPageSetupChange: (setup: PageSetup) => void;
  onPaginationUpdate: (immediate?: boolean) => void;
}

export const DocVerticalRuler = ({
  activeDoc,
  onPageSetupChange,
  onPaginationUpdate,
}: DocVerticalRulerProps) => {
  const [unit] = useState<RulerUnit>(() => {
    const saved = localStorage.getItem('office_ruler_unit');
    return saved === 'in' ? 'in' : 'cm';
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
      />
      <RulerGuideLine dragState={rulerHook.dragState} />
    </>
  );
};
