import { describe, it, expect } from 'vitest';
import { importHtml } from '../import';

describe('importHtml sanitization', () => {
  it('strips script and style blocks with content', () => {
    const out = importHtml('<p>An toàn</p><script>alert(1)</script><style>.x{}</style>');
    expect(out).toContain('<p>An toàn</p>');
    expect(out).not.toContain('script');
    expect(out).not.toContain('alert(1)');
    expect(out).not.toContain('.x{}');
  });

  it('removes iframe/object/embed/form blocks entirely', () => {
    const out = importHtml(
      '<p>Trước</p><iframe src="https://evil.example"></iframe><object data="x"></object><embed src="y"><form action="z"><input></form><p>Sau</p>',
    );
    expect(out).toContain('Trước');
    expect(out).toContain('Sau');
    expect(out).not.toContain('iframe');
    expect(out).not.toContain('object');
    expect(out).not.toContain('embed');
    expect(out).not.toContain('form');
  });

  it('drops void dangerous tags base/meta/link', () => {
    const out = importHtml('<meta charset="utf-8"><base href="https://evil.example"><link rel="stylesheet" href="a.css"><p>Nội dung</p>');
    expect(out).toBe('<p>Nội dung</p>');
  });

  it('removes inline event handler attributes', () => {
    const out = importHtml(
      '<p onclick="alert(1)" onmouseover=\'steal()\' onMouseEnter=x>Hover</p><img src="a.png" onerror="boom()">',
    );
    expect(out).not.toContain('onclick');
    expect(out).not.toContain('onmouseover');
    expect(out).not.toContain('onmouseenter');
    expect(out).toContain('Hover');
    expect(out).toContain('img');
    expect(out).not.toContain('onerror');
  });

  it('neutralizes javascript/vbscript/data-html URLs in href and src', () => {
    const out = importHtml(
      '<a href="javascript:alert(1)">Link một</a><a href=\'vbscript:x\'>Hai</a><img src=javascript:alert(2)><a href="data:text/html;base64,PHNjcmlwdD4=">Ba</a>',
    );
    expect(out).not.toContain('javascript:');
    expect(out).not.toContain('vbscript:');
    expect(out).not.toContain('data:text/html');
    expect(out).toContain('Link một');
  });

  it('keeps safe markup untouched', () => {
    const src = '<h1>Tiêu đề</h1><p><strong>Đậm</strong> và <a href="https://inet.vn">liên kết thường</a></p>';
    expect(importHtml(src)).toBe(src);
  });
});
