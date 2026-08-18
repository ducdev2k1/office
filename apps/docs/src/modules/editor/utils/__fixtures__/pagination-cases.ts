import type { BlockMeasurement, PageMetrics } from '../pagination.utils';

export interface PaginationCase {
  name: string;
  blocks: BlockMeasurement[];
  metrics: PageMetrics;
  expected: { breaks: number[]; spacers: number[]; forced: boolean[]; contentOffsets: number[] };
}

export const PAGE_METRICS: PageMetrics = {
  paperW: 700,
  paperH: 1000,
  usable: 900,
  marginT: 50,
  marginB: 50,
};

export const block = (
  offset: number,
  height: number,
  opts: Partial<Pick<BlockMeasurement, 'type' | 'marginTop' | 'marginBottom' | 'domTop' | 'lines'>> = {},
): BlockMeasurement => ({
  type: 'paragraph',
  offset,
  height,
  marginTop: 0,
  marginBottom: 0,
  domTop: 0,
  ...opts,
});

export const pageBreakBlock = (offset: number): BlockMeasurement =>
  block(offset, 0, { type: 'pageBreak' });

const P = PAGE_METRICS;
const PAPER_H = P.paperH;
const STEP = PAPER_H + 24;

export const PAGINATION_CASES: PaginationCase[] = [
  {
    name: 'empty-doc-keeps-one-page',
    blocks: [],
    metrics: P,
    expected: { breaks: [], spacers: [], forced: [], contentOffsets: [0] },
  },
  {
    name: 'fits-exactly-one-page',
    blocks: [block(1, 400), block(3, 400)],
    metrics: P,
    expected: { breaks: [], spacers: [], forced: [], contentOffsets: [0] },
  },
  {
    name: 'overflows-by-one-px',
    blocks: [block(1, 500), block(3, 401)],
    metrics: P,
    expected: { breaks: [3], spacers: [524], forced: [false], contentOffsets: [0, STEP] },
  },
  {
    name: 'margin-collapse-max',
    blocks: [block(1, 400, { marginBottom: 200 }), block(3, 400, { marginTop: 50 })],
    metrics: P,
    expected: { breaks: [3], spacers: [424], forced: [false], contentOffsets: [0, STEP] },
  },
  {
    name: 'first-block-does-not-collapse',
    blocks: [block(1, 450, { marginTop: 200 })],
    metrics: P,
    expected: { breaks: [], spacers: [], forced: [], contentOffsets: [0] },
  },
  {
    name: 'forced-page-break',
    blocks: [block(1, 300), pageBreakBlock(5), block(9, 300)],
    metrics: P,
    expected: { breaks: [5], spacers: [724], forced: [true], contentOffsets: [0, STEP] },
  },
  {
    name: 'consecutive-page-breaks',
    blocks: [pageBreakBlock(3), pageBreakBlock(5)],
    metrics: P,
    expected: {
      breaks: [3, 5],
      spacers: [0, 0],
      forced: [true, true],
      contentOffsets: [0, STEP, 2 * STEP],
    },
  },
  {
    name: 'page-break-as-first-block',
    blocks: [pageBreakBlock(1), block(5, 300)],
    metrics: P,
    expected: { breaks: [1], spacers: [0], forced: [true], contentOffsets: [0, STEP] },
  },
  {
    name: 'tall-block-spans-three-pages',
    blocks: [block(1, 2500)],
    metrics: P,
    expected: {
      breaks: [1],
      spacers: [STEP],
      forced: [false],
      contentOffsets: [0, STEP, 2 * STEP, 3 * STEP],
    },
  },
  {
    name: 'line-split-splits-at-overflowing-line',
    blocks: [
      block(1, 800),
      block(5, 200, {
        lines: [
          { top: 0, bottom: 50, pos: 6 },
          { top: 50, bottom: 100, pos: 20 },
          { top: 100, bottom: 150, pos: 35 },
          { top: 150, bottom: 200, pos: 50 },
        ],
      }),
    ],
    metrics: P,
    expected: {
      breaks: [35],
      spacers: [124],
      forced: [false],
      contentOffsets: [0, STEP],
    },
  },
  {
    name: 'line-split-first-line-overflows-falls-back-to-block-break',
    blocks: [
      block(1, 890),
      block(5, 100, {
        lines: [
          { top: 0, bottom: 50, pos: 6 },
          { top: 50, bottom: 100, pos: 20 },
        ],
      }),
    ],
    metrics: P,
    expected: {
      breaks: [5],
      spacers: [134],
      forced: [false],
      contentOffsets: [0, STEP],
    },
  },
  {
    name: 'line-split-tall-block-spans-multiple-pages-with-lines',
    blocks: [
      block(1, 2000, {
        lines: [
          { top: 0, bottom: 850, pos: 10 },
          { top: 850, bottom: 1700, pos: 100 },
          { top: 1700, bottom: 2000, pos: 200 },
        ],
      }),
    ],
    metrics: P,
    expected: {
      breaks: [100, 200],
      spacers: [174, 174],
      forced: [false, false],
      contentOffsets: [0, STEP, 2 * STEP],
    },
  },
];

export const MAX_PAGES_CASE: PaginationCase = {
  name: 'max-pages-caps-breaks-but-counts-laid-out-pages',
  blocks: Array.from({ length: 59 }, (_, i) => pageBreakBlock(1 + 2 * i)),
  metrics: P,
  expected: {
    breaks: Array.from({ length: 49 }, (_, i) => 1 + 2 * i),
    spacers: Array.from({ length: 49 }, () => 0),
    forced: Array.from({ length: 49 }, () => true),
    contentOffsets: Array.from({ length: 50 }, (_, i) => i * STEP),
  },
};

export const RESOLVE_CASES: {
  name: string;
  breaks: number[];
  simulated: number[];
  domTop: Record<number, number>;
  expected: number[];
}[] = [
  {
    name: 'tall-block-interpolates-jumped-pages',
    breaks: [1],
    simulated: [0, STEP, 2 * STEP, 3 * STEP],
    domTop: { 1: STEP },
    expected: [0, STEP, 2 * STEP, 3 * STEP],
  },
  {
    name: 'uses-real-dom-top-including-drift',
    breaks: [5, 9],
    simulated: [0, STEP, 2 * STEP],
    domTop: { 5: STEP, 9: 2 * STEP + 2 },
    expected: [0, STEP, 2 * STEP + 2],
  },
  {
    name: 'falls-back-to-simulated-when-no-dom-top',
    breaks: [1],
    simulated: [0, STEP],
    domTop: {},
    expected: [0, STEP],
  },
];