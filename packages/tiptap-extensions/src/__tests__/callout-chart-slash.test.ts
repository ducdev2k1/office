import { describe, expect, it } from 'vitest';
import { DEFAULT_CHART_ATTRS, type ChartBlockAttrs } from '../chart';
import { Callout } from '../callout';
import { ParagraphStyle } from '../paragraph-style';
import { SlashCommand } from '../slash-command';

describe('Callout, ChartBlock, ParagraphStyle, SlashCommand Extensions', () => {
  it('should initialize Callout extension with default type info', () => {
    expect(Callout.name).toBe('callout');
    const attrs = Callout.config.addAttributes?.call(Callout as any) as
      | Record<string, { default?: unknown }>
      | undefined;
    expect(attrs?.type?.default).toBe('info');
  });

  it('should initialize ChartBlock with default dataset and categories', () => {
    expect(DEFAULT_CHART_ATTRS.chartType).toBe('bar');
    expect(DEFAULT_CHART_ATTRS.categories.length).toBe(4);
    expect(DEFAULT_CHART_ATTRS.series.length).toBe(2);
    expect(DEFAULT_CHART_ATTRS.series[0]?.name).toBe('Kế hoạch');
  });

  it('should validate ParagraphStyle global attributes structure', () => {
    expect(ParagraphStyle.name).toBe('paragraphStyle');
    const globalAttrs = ParagraphStyle.config.addGlobalAttributes?.call(ParagraphStyle as any);
    expect(globalAttrs).toBeDefined();
    expect(globalAttrs?.[0]?.types).toContain('paragraph');
  });

  it('should configure SlashCommand extension storage defaults', () => {
    expect(SlashCommand.name).toBe('slashCommand');
    const storage = SlashCommand.config.addStorage?.call(SlashCommand as any);
    expect(storage).toEqual({
      onOpen: null,
      onClose: null,
      onSelect: null,
    });
  });
});
