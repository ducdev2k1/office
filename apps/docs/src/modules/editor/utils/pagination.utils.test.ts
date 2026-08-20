import { describe, expect, it } from 'vitest';
import {
  computeBreaksFromMeasurements,
  resolveContentOffsets,
} from '@/modules/editor/utils/pagination.utils';
import {
  MAX_PAGES_CASE,
  PAGINATION_CASES,
  RESOLVE_CASES,
} from '@/modules/editor/utils/__fixtures__/pagination-cases';

describe('computeBreaksFromMeasurements', () => {
  for (const fixture of PAGINATION_CASES) {
    it(`matches fixture: ${fixture.name}`, () => {
      expect(computeBreaksFromMeasurements(fixture.blocks, fixture.metrics)).toEqual(
        fixture.expected,
      );
    });
  }

  it('matches fixture: max-pages caps breaks but counts laid-out pages', () => {
    expect(computeBreaksFromMeasurements(MAX_PAGES_CASE.blocks, MAX_PAGES_CASE.metrics)).toEqual(
      MAX_PAGES_CASE.expected,
    );
  });

  it('page count = contentOffsets.length, including pages tall blocks span', () => {
    for (const fixture of [...PAGINATION_CASES, MAX_PAGES_CASE]) {
      const result = computeBreaksFromMeasurements(fixture.blocks, fixture.metrics);
      expect(result.contentOffsets.length).toBe(fixture.expected.contentOffsets.length);
    }
    const tall = PAGINATION_CASES.find((c) => c.name === 'tall-block-spans-three-pages');
    const tallResult = computeBreaksFromMeasurements(tall!.blocks, tall!.metrics);
    expect(tallResult.contentOffsets.length).toBe(4);
    expect(tallResult.contentOffsets.length).toBe(tallResult.breaks.length + 3);
  });
});

describe('resolveContentOffsets', () => {
  for (const fixture of RESOLVE_CASES) {
    it(`matches fixture: ${fixture.name}`, () => {
      const domTopOf = (offset: number): number | null => fixture.domTop[offset] ?? null;
      expect(resolveContentOffsets(fixture.breaks, fixture.simulated, domTopOf, 1000)).toEqual(
        fixture.expected,
      );
    });
  }
});
