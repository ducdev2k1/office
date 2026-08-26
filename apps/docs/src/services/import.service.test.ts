import { describe, it, expect } from 'vitest';
import { importMarkdownFile } from '@/services/import.service';

const makeMdFile = (content: string): File =>
  new File([content], 'bao-cao.md', { type: 'text/markdown' });

describe('importMarkdownFile', () => {
  it('converts headings, lists and inline styles to editor-compatible HTML', async () => {
    const md = [
      '# Tieu de chinh',
      '',
      'Doan van co **in dam** va *in nghieng*.',
      '',
      '- Muc mot',
      '- Muc hai',
      '',
      '1. Buoc mot',
      '2. Buoc hai',
    ].join('\n');

    const doc = await importMarkdownFile(makeMdFile(md));

    expect(doc.sourceType).toBe('markdown');
    expect(doc.title).toBe('bao-cao');
    expect(doc.content).toContain('<h1>');
    expect(doc.content).toContain('Tieu de chinh');
    expect(doc.content).toContain('<strong>in dam</strong>');
    expect(doc.content).toContain('<em>in nghieng</em>');
    expect(doc.content).toContain('<ul>');
    expect(doc.content).toContain('<ol>');
    expect(doc.content).not.toContain('<script');
  });

  it('converts GFM tables and fenced code blocks', async () => {
    const md = [
      '| Ten | Tuoi |',
      '| --- | ---- |',
      '| An  | 30   |',
      '',
      '```js',
      'const x = 1;',
      '```',
    ].join('\n');

    const doc = await importMarkdownFile(makeMdFile(md));

    expect(doc.content).toContain('<table>');
    expect(doc.content).toContain('Ten');
    expect(doc.content).toContain('<pre>');
    expect(doc.content).toContain('const x = 1;');
  });

  it('keeps links and images as HTML anchors/img tags', async () => {
    const md = '[Trang chu](https://example.com) va ![mo ta](https://example.com/a.png)';

    const doc = await importMarkdownFile(makeMdFile(md));

    expect(doc.content).toContain('<a href="https://example.com">');
    expect(doc.content).toContain('<img src="https://example.com/a.png"');
  });

  it('falls back to an empty paragraph for empty markdown', async () => {
    const doc = await importMarkdownFile(makeMdFile(''));

    expect(doc.sourceType).toBe('markdown');
    expect(doc.content.trim()).not.toBe('');
  });
});
