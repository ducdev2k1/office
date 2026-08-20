import { describe, expect, it } from 'vitest';
import katex from 'katex';

describe('Math, Footnote, Columns', () => {
  it('should render KaTeX inline math correctly', () => {
    const tex = 'E = mc^2';
    const html = katex.renderToString(tex, { throwOnError: false, displayMode: false });
    expect(html).toContain('katex');
    expect(html).toContain('E');
    expect(html).toContain('m');
  });

  it('should render KaTeX block math with display mode', () => {
    const tex = '\\int_0^1 x^2 dx = \\frac{1}{3}';
    const html = katex.renderToString(tex, { throwOnError: false, displayMode: true });
    expect(html).toContain('katex-display');
  });

  it('should handle KaTeX invalid formula with throwOnError false gracefully', () => {
    const invalidTex = '\\frac{a}{';
    const html = katex.renderToString(invalidTex, { throwOnError: false, displayMode: false });
    expect(html).toBeDefined();
  });
});
