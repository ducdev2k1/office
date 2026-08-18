import { describe, it, expect } from 'vitest';
import { mmToPx, type HeaderFooterSlot, type PageNumberSetup } from '@/types/docs.types';
import { renderTokens, resolveSlot, type TokenContext } from './page-tokens.utils';

describe('mmToPx guard', () => {
  it('handles regular numbers correctly', () => {
    expect(mmToPx(25.4)).toBe(96);
    expect(mmToPx(0)).toBe(0);
    expect(mmToPx(20)).toBe(76);
  });

  it('safely handles undefined, null, NaN and non-finite values without returning NaN', () => {
    expect(mmToPx(undefined as unknown as number)).toBe(0);
    expect(mmToPx(null as unknown as number)).toBe(0);
    expect(mmToPx(Number.NaN)).toBe(0);
    expect(mmToPx(Number.POSITIVE_INFINITY)).toBe(0);
    expect(mmToPx(Number.NEGATIVE_INFINITY)).toBe(0);
  });
});

describe('renderTokens', () => {
  const baseCtx: TokenContext = {
    page: 2,
    pages: 10,
    title: 'Báo cáo tài chính',
    date: new Date('2026-08-18T10:30:00.000Z'),
    locale: 'vi',
  };

  it('renders individual and multiple tokens correctly', () => {
    expect(renderTokens('Trang {page} / {pages}', baseCtx)).toBe('Trang 2 / 10');
    expect(renderTokens('{title} - {page}', baseCtx)).toBe('Báo cáo tài chính - 2');
  });

  it('renders date token according to locale', () => {
    const renderedVi = renderTokens('{date}', baseCtx);
    expect(renderedVi.length).toBeGreaterThan(0);

    const renderedEn = renderTokens('{date}', { ...baseCtx, locale: 'en' });
    expect(renderedEn.length).toBeGreaterThan(0);
  });

  it('retains unknown tokens as literals without throwing', () => {
    expect(renderTokens('Tài liệu {unknown_token} - {page}', baseCtx)).toBe(
      'Tài liệu {unknown_token} - 2',
    );
  });

  it('handles templates without tokens or empty templates', () => {
    expect(renderTokens('', baseCtx)).toBe('');
    expect(renderTokens('Plain text only', baseCtx)).toBe('Plain text only');
  });

  it('handles repeated tokens in template', () => {
    expect(renderTokens('{page}:{page}:{pages}', baseCtx)).toBe('2:2:10');
  });
});

describe('resolveSlot', () => {
  const baseCtx = {
    title: 'Kế hoạch Q3',
    date: new Date('2026-08-18T00:00:00.000Z'),
    locale: 'vi' as const,
  };

  it('resolves slot texts when pageNumber is disabled', () => {
    const slot: HeaderFooterSlot = {
      left: '{title}',
      center: 'Công ty OneMail',
      right: '{date}',
    };
    const pageNumber: PageNumberSetup = {
      enabled: false,
      position: 'footer',
      align: 'center',
      format: '{page}',
      startAt: 1,
      skipFirstPage: false,
    };

    const headerResult = resolveSlot(slot, pageNumber, 'header', 0, 5, baseCtx);
    expect(headerResult.left).toBe('Kế hoạch Q3');
    expect(headerResult.center).toBe('Công ty OneMail');
    expect(headerResult.right.length).toBeGreaterThan(0);
  });

  it('places page number in correct position and alignment when enabled', () => {
    const pageNumber: PageNumberSetup = {
      enabled: true,
      position: 'footer',
      align: 'right',
      format: 'Trang {page} / {pages}',
      startAt: 1,
      skipFirstPage: false,
    };

    const footerResult = resolveSlot(undefined, pageNumber, 'footer', 1, 4, baseCtx);
    expect(footerResult.left).toBe('');
    expect(footerResult.center).toBe('');
    expect(footerResult.right).toBe('Trang 2 / 4');

    const headerResult = resolveSlot(undefined, pageNumber, 'header', 1, 4, baseCtx);
    expect(headerResult.right).toBe('');
  });

  it('concatenates slot text with page number in the same cell without overwriting', () => {
    const slot: HeaderFooterSlot = {
      left: '',
      center: '',
      right: 'Tài liệu bảo mật -',
    };
    const pageNumber: PageNumberSetup = {
      enabled: true,
      position: 'footer',
      align: 'right',
      format: '{page}',
      startAt: 1,
      skipFirstPage: false,
    };

    const result = resolveSlot(slot, pageNumber, 'footer', 2, 3, baseCtx);
    expect(result.right).toBe('Tài liệu bảo mật - 3');
  });

  it('handles startAt != 1 while keeping {pages} as total page count', () => {
    const pageNumber: PageNumberSetup = {
      enabled: true,
      position: 'footer',
      align: 'center',
      format: '{page} / {pages}',
      startAt: 5,
      skipFirstPage: false,
    };

    const page0 = resolveSlot(undefined, pageNumber, 'footer', 0, 3, baseCtx);
    expect(page0.center).toBe('5 / 3');

    const page1 = resolveSlot(undefined, pageNumber, 'footer', 1, 3, baseCtx);
    expect(page1.center).toBe('6 / 3');

    const page2 = resolveSlot(undefined, pageNumber, 'footer', 2, 3, baseCtx);
    expect(page2.center).toBe('7 / 3');
  });

  it('skips page number on first page when skipFirstPage is true but keeps slot text', () => {
    const slot: HeaderFooterSlot = {
      left: 'Tiêu đề',
      center: 'Logo',
      right: 'Phụ lục',
    };
    const pageNumber: PageNumberSetup = {
      enabled: true,
      position: 'header',
      align: 'center',
      format: '{page}',
      startAt: 1,
      skipFirstPage: true,
    };

    const page0 = resolveSlot(slot, pageNumber, 'header', 0, 3, baseCtx);
    expect(page0.left).toBe('Tiêu đề');
    expect(page0.center).toBe('Logo');
    expect(page0.right).toBe('Phụ lục');

    const page1 = resolveSlot(slot, pageNumber, 'header', 1, 3, baseCtx);
    expect(page1.center).toBe('Logo 2');
  });
});
