export type RulerUnit = 'cm' | 'in';

export interface RulerTick {
  positionMm: number;
  positionPx: number;
  heightRatio: number;
  label?: string;
}

export const mmToPx = (mm: number): number => (mm * 96) / 25.4;
export const pxToMm = (px: number): number => (px * 25.4) / 96;

export const inToPx = (inch: number): number => inch * 96;
export const pxToIn = (px: number): number => px / 96;

export const mmToIn = (mm: number): number => mm / 25.4;
export const inToMm = (inch: number): number => inch * 25.4;

export const formatUnitValue = (mm: number, unit: RulerUnit): string => {
  if (unit === 'in') {
    const inches = mmToIn(mm);
    return `${inches.toFixed(2)} in`;
  }
  const cm = mm / 10;
  return `${cm.toFixed(1)} cm`;
};

export const snapValueMm = (mm: number, unit: RulerUnit): number => {
  if (unit === 'in') {
    // Snap to nearest 1/16 inch (1.5875mm)
    const stepMm = 25.4 / 16;
    return Math.round(mm / stepMm) * stepMm;
  }
  // Snap to nearest 1mm
  return Math.round(mm);
};

export const generateHorizontalTicks = (
  paperWidthMm: number,
  unit: RulerUnit,
): RulerTick[] => {
  const ticks: RulerTick[] = [];

  if (unit === 'cm') {
    const totalMm = Math.floor(paperWidthMm);
    for (let mm = 0; mm <= totalMm; mm++) {
      const isCm = mm % 10 === 0;
      const isHalfCm = mm % 5 === 0 && !isCm;

      ticks.push({
        positionMm: mm,
        positionPx: mmToPx(mm),
        heightRatio: isCm ? 1.0 : isHalfCm ? 0.6 : 0.35,
        label: isCm ? String(mm / 10) : undefined,
      });
    }
  } else {
    const totalInches = paperWidthMm / 25.4;
    const stepsPerInch = 8; // 1/8 inch intervals
    const totalSteps = Math.floor(totalInches * stepsPerInch);

    for (let step = 0; step <= totalSteps; step++) {
      const currentInch = step / stepsPerInch;
      const currentMm = currentInch * 25.4;
      const isInch = step % stepsPerInch === 0;
      const isHalfInch = step % (stepsPerInch / 2) === 0 && !isInch;
      const isQuarterInch = step % (stepsPerInch / 4) === 0 && !isHalfInch && !isInch;

      ticks.push({
        positionMm: currentMm,
        positionPx: mmToPx(currentMm),
        heightRatio: isInch ? 1.0 : isHalfInch ? 0.65 : isQuarterInch ? 0.45 : 0.3,
        label: isInch ? String(Math.round(currentInch)) : undefined,
      });
    }
  }

  return ticks;
};

export const generateVerticalTicks = (
  paperHeightMm: number,
  unit: RulerUnit,
): RulerTick[] => {
  return generateHorizontalTicks(paperHeightMm, unit);
};
