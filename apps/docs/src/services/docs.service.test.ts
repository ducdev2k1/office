import { describe, it, expect } from 'vitest';
import { withDefaults } from '@/services/docs.service';
import type { DocRecord } from '@/types/docs.types';

describe('withDefaults', () => {
  it('fills all default fields for a minimal doc record without pageSetup', () => {
    const minDoc: DocRecord = {
      id: 'test-1',
      title: 'Minimal Doc',
      kind: 'docs',
      createdAt: '2026-08-18T00:00:00.000Z',
      updatedAt: '2026-08-18T00:00:00.000Z',
      lastOpenedAt: '2026-08-18T00:00:00.000Z',
      starred: false,
      deletedAt: null,
      content: '<p>test</p>',
    };

    const result = withDefaults(minDoc);
    expect(result.pageSetup).toBeDefined();
    expect(result.pageSetup?.paperSize).toBe('a4');
    expect(result.pageSetup?.orientation).toBe('portrait');
    expect(result.pageSetup?.margins).toEqual({ top: 20, right: 15, bottom: 20, left: 15 });
    expect(result.pageSetup?.headerMargin).toBe(10);
    expect(result.pageSetup?.footerMargin).toBe(10);
    expect(result.pageSetup?.pageNumber).toEqual({
      enabled: false,
      position: 'footer',
      align: 'center',
      format: '{page}',
      startAt: 1,
      skipFirstPage: false,
    });
  });

  it('preserves existing pageSetup fields while filling missing subfields', () => {
    const partialDoc: DocRecord = {
      id: 'test-2',
      title: 'Partial Setup',
      kind: 'docs',
      createdAt: '2026-08-18T00:00:00.000Z',
      updatedAt: '2026-08-18T00:00:00.000Z',
      lastOpenedAt: '2026-08-18T00:00:00.000Z',
      starred: false,
      deletedAt: null,
      content: '<p>test</p>',
      pageSetup: {
        paperSize: 'letter',
        orientation: 'landscape',
        margins: { top: 25, right: 25, bottom: 25, left: 25 },
      },
    };

    const result = withDefaults(partialDoc);
    expect(result.pageSetup?.paperSize).toBe('letter');
    expect(result.pageSetup?.orientation).toBe('landscape');
    expect(result.pageSetup?.margins).toEqual({ top: 25, right: 25, bottom: 25, left: 25 });
    expect(result.pageSetup?.headerMargin).toBe(10);
    expect(result.pageSetup?.footerMargin).toBe(10);
    expect(result.pageSetup?.pageNumber?.enabled).toBe(false);
  });

  it('retains user configured header, footer and pageNumber settings', () => {
    const fullDoc: DocRecord = {
      id: 'test-3',
      title: 'Full Setup',
      kind: 'docs',
      createdAt: '2026-08-18T00:00:00.000Z',
      updatedAt: '2026-08-18T00:00:00.000Z',
      lastOpenedAt: '2026-08-18T00:00:00.000Z',
      starred: true,
      deletedAt: null,
      content: '<p>test</p>',
      pageSetup: {
        paperSize: 'a5',
        orientation: 'portrait',
        margins: { top: 10, right: 10, bottom: 10, left: 10 },
        headerMargin: 12,
        footerMargin: 15,
        header: { left: 'Doc Title', center: '', right: '{date}' },
        footer: { left: '', center: '{page}', right: '' },
        pageNumber: {
          enabled: true,
          position: 'header',
          align: 'right',
          format: 'Trang {page} / {pages}',
          startAt: 5,
          skipFirstPage: true,
        },
      },
    };

    const result = withDefaults(fullDoc);
    expect(result.pageSetup?.paperSize).toBe('a5');
    expect(result.pageSetup?.headerMargin).toBe(12);
    expect(result.pageSetup?.footerMargin).toBe(15);
    expect(result.pageSetup?.header?.left).toBe('Doc Title');
    expect(result.pageSetup?.pageNumber?.enabled).toBe(true);
    expect(result.pageSetup?.pageNumber?.startAt).toBe(5);
    expect(result.pageSetup?.pageNumber?.skipFirstPage).toBe(true);
  });
});
