import { describe, it, expect } from 'vitest';
import { unpackOoxml, getPartText } from '@office/ooxml-core';
import {
  exportDocx,
  exportMarkdown,
  importText,
  importHtml,
  OoxmlMapper,
} from '../index';

describe('docx-io', () => {
  it('should map HTML elements to OOXML correctly', () => {
    const html = `
      <h1>Tiêu đề 1</h1>
      <p style="text-align: center;">Đoạn văn <strong>in đậm</strong> và <em>in nghiêng</em> và <u>gạch chân</u>.</p>
      <ul>
        <li>Mục 1</li>
        <li>Mục 2</li>
      </ul>
      <ol>
        <li>Số 1</li>
        <li>Số 2</li>
      </ol>
      <table border="1">
        <tr>
          <th>Cột A</th>
          <th>Cột B</th>
        </tr>
        <tr>
          <td>Dữ liệu 1</td>
          <td>Dữ liệu 2</td>
        </tr>
      </table>
      <blockquote>Trích dẫn hay</blockquote>
      <pre><code>console.log("hello");</code></pre>
      <hr />
    `;

    const mapper = new OoxmlMapper();
    const result = mapper.convert(html);

    expect(result.bodyXml).toContain('Heading1');
    expect(result.bodyXml).toContain('Tiêu đề 1');
    expect(result.bodyXml).toContain('<w:b/>');
    expect(result.bodyXml).toContain('<w:i/>');
    expect(result.bodyXml).toContain('<w:u w:val="single"/>');
    expect(result.bodyXml).toContain('<w:jc w:val="center"/>');
    expect(result.bodyXml).toContain('ListParagraph');
    expect(result.bodyXml).toContain('<w:tbl>');
    expect(result.bodyXml).toContain('Quote');
    expect(result.bodyXml).toContain('console.log');
  });

  it('should export standalone .docx buffer that unzips with all parts', async () => {
    const html = `
      <h1>Báo Cáo Dự Án</h1>
      <p>Nội dung chi tiết dự án OneOffice.</p>
    `;

    const buffer = await exportDocx(html, { title: 'Báo Cáo' });
    expect(buffer).toBeInstanceOf(Uint8Array);
    expect(buffer.length).toBeGreaterThan(500);

    const pkg = await unpackOoxml(buffer);
    const docXml = getPartText(pkg, 'word/document.xml');
    expect(docXml).toBeDefined();
    expect(docXml).toContain('Báo Cáo Dự Án');
    expect(docXml).toContain('Nội dung chi tiết dự án OneOffice');

    const stylesXml = getPartText(pkg, 'word/styles.xml');
    expect(stylesXml).toBeDefined();
    expect(stylesXml).toContain('Heading1');

    const relsXml = getPartText(pkg, '_rels/.rels');
    expect(relsXml).toBeDefined();
    expect(relsXml).toContain('word/document.xml');
  });

  it('should patch original docx preserving metadata', async () => {
    const originalDocx = await exportDocx('<h1>Văn bản gốc</h1><p>Đoạn văn ban đầu</p>');

    const updatedDocx = await exportDocx('<h1>Văn bản sửa đổi</h1><p>Nội dung mới cập nhật</p>', {
      originalDocxBuffer: originalDocx,
    });

    const pkg = await unpackOoxml(updatedDocx);
    const docXml = getPartText(pkg, 'word/document.xml');
    expect(docXml).toContain('Văn bản sửa đổi');
    expect(docXml).toContain('Nội dung mới cập nhật');
  });

  it('should export HTML to Markdown correctly', () => {
    const html = `
      <h1>Tiêu đề lớn</h1>
      <p>Đoạn văn có <strong>chữ đậm</strong> và <em>chữ nghiêng</em> và <code>mã nguồn</code>.</p>
      <ul>
        <li>Mục bullet 1</li>
        <li>Mục bullet 2</li>
      </ul>
      <ol>
        <li>Mục số 1</li>
        <li>Mục số 2</li>
      </ol>
      <pre><code>const a = 10;</code></pre>
      <blockquote>Lời khuyên quan trọng</blockquote>
      <a href="https://example.com">Trang chủ</a>
      <table>
        <tr><th>Tên</th><th>Tuổi</th></tr>
        <tr><td>An</td><td>20</td></tr>
      </table>
    `;

    const md = exportMarkdown(html);
    expect(md).toContain('# Tiêu đề lớn');
    expect(md).toContain('**chữ đậm**');
    expect(md).toContain('*chữ nghiêng*');
    expect(md).toContain('`mã nguồn`');
    expect(md).toContain('- Mục bullet 1');
    expect(md).toContain('1. Mục số 1');
    expect(md).toContain('> Lời khuyên quan trọng');
    expect(md).toContain('[Trang chủ](https://example.com)');
    expect(md).toContain('| Tên | Tuổi |');
    expect(md).toContain('| An | 20 |');
  });

  it('should import text and html correctly', () => {
    const text = 'Dòng 1\nDòng 2\n\nDòng 4';
    const textHtml = importText(text);
    expect(textHtml).toContain('<p>Dòng 1</p>');
    expect(textHtml).toContain('<p>Dòng 2</p>');
    expect(textHtml).toContain('<p></p>');
    expect(textHtml).toContain('<p>Dòng 4</p>');

    const rawHtml = '<html><head><script>alert(1)</script></head><body><h1>Chào</h1><p>Thế giới</p></body></html>';
    const imported = importHtml(rawHtml);
    expect(imported).not.toContain('script');
    expect(imported).toContain('<h1>Chào</h1>');
    expect(imported).toContain('<p>Thế giới</p>');
  });

  it('should map Callout, Paragraph borders, and Chart blocks to OOXML', () => {
    const html = `
      <div data-type="callout" data-callout-type="tip"><p>Nội dung mẹo hay</p></div>
      <p data-border="left" data-border-color="#3b82f6" data-bg-color="#eff6ff">Đoạn văn có viền trái và màu nền</p>
      <div data-type="chart-block" data-chart-title="Doanh số 2026" data-chart-categories='["Q1","Q2"]' data-chart-series='[{"name":"Kế hoạch","data":[10,20]}]'></div>
    `;

    const mapper = new OoxmlMapper();
    const result = mapper.convert(html);

    // Callout verification
    expect(result.bodyXml).toContain('MẸO HAY');
    expect(result.bodyXml).toContain('Nội dung mẹo hay');
    expect(result.bodyXml).toContain('<w:pBdr>');

    // Paragraph border & shading verification
    expect(result.bodyXml).toContain('<w:left w:val="single"');
    expect(result.bodyXml).toContain('<w:shd w:val="clear" w:color="auto" w:fill="EFF6FF"/>');

    // Chart block table summary verification
    expect(result.bodyXml).toContain('Doanh số 2026');
    expect(result.bodyXml).toContain('Kế hoạch');
    expect(result.bodyXml).toContain('Q1');
  });

  it('should map footnotes to real OOXML footnote references with footnotes.xml part', async () => {
    const html = `
      <p>Văn bản có chú thích<sup data-type="footnote" data-footnote-id="fn-1" data-footnote-content="Nguồn: Nghị định 30/2020"></sup> cuối câu.</p>
    `;

    const mapper = new OoxmlMapper();
    const result = mapper.convert(html);
    expect(result.footnotes).toHaveLength(1);
    expect(result.footnotes[0]?.content).toBe('Nguồn: Nghị định 30/2020');
    expect(result.bodyXml).toContain('<w:footnoteReference w:id="1"/>');
    expect(result.bodyXml).not.toContain('data-footnote-content');

    const buffer = await exportDocx(html);
    const pkg = await unpackOoxml(buffer);
    const fnXml = getPartText(pkg, 'word/footnotes.xml');
    expect(fnXml).toBeDefined();
    expect(fnXml).toContain('Nguồn: Nghị định 30/2020');
    expect(fnXml).toContain('w:type="separator"');

    const ctXml = getPartText(pkg, '[Content_Types].xml');
    expect(ctXml).toContain('/word/footnotes.xml');
    const relsXml = getPartText(pkg, 'word/_rels/document.xml.rels');
    expect(relsXml).toContain('footnotes');
  });

  it('should map math inline and block to fallback text without katex HTML', () => {
    const html = `
      <p>Công thức <span data-type="math-inline" data-tex="E = mc^2"></span> nổi tiếng.</p>
      <div data-type="math-block" data-tex="\\int_a^b f(x)dx"></div>
    `;

    const mapper = new OoxmlMapper();
    const result = mapper.convert(html);

    expect(result.bodyXml).toContain('E = mc^2');
    expect(result.bodyXml).toContain('\\int_a^b f(x)dx');
    expect(result.bodyXml).not.toContain('katex');
    expect(result.bodyXml).toContain('Consolas');
  });

  it('should map bookmarks to OOXML bookmarkStart/End', () => {
    const html = `
      <p>Đoạn có <span data-bookmark-id="bm-abc" data-bookmark-name="Muc luc">điểm neo</span> bên trong.</p>
    `;

    const mapper = new OoxmlMapper();
    const result = mapper.convert(html);

    expect(result.bodyXml).toContain('<w:bookmarkStart w:id="1" w:name="Muc_luc"/>');
    expect(result.bodyXml).toContain('<w:bookmarkEnd w:id="1"/>');
    expect(result.bodyXml).toContain('điểm neo');
  });

  it('should map section break next-page to page break and skip continuous', () => {
    const html = `
      <p>Trang một</p>
      <div data-type="section-break" data-section-type="next-page"></div>
      <p>Trang hai</p>
      <div data-type="section-break" data-section-type="continuous"></div>
      <p>Vẫn trang hai</p>
    `;

    const mapper = new OoxmlMapper();
    const result = mapper.convert(html);

    expect(result.bodyXml).toContain('Trang một');
    expect(result.bodyXml).toContain('Trang hai');
    expect(result.bodyXml).toContain('Vẫn trang hai');
    const pageBreakCount = (result.bodyXml.match(/<w:br w:type="page"\/>/g) ?? []).length;
    expect(pageBreakCount).toBe(1);
  });

  it('should inject footnotes part when patching original docx containing footnotes', async () => {
    const originalDocx = await exportDocx('<h1>Hợp đồng gốc</h1><p>Điều khoản bản đầu</p>');
    const updatedHtml = '<h1>Hợp đồng sửa đổi</h1><p>Điều khoản mới<sup data-type="footnote" data-footnote-id="fn-9" data-footnote-content="Bổ sung 2026"></sup></p>';

    const updatedDocx = await exportDocx(updatedHtml, { originalDocxBuffer: originalDocx });

    const pkg = await unpackOoxml(updatedDocx);
    const docXml = getPartText(pkg, 'word/document.xml');
    expect(docXml).toContain('Hợp đồng sửa đổi');
    expect(docXml).toContain('<w:footnoteReference w:id="1"/>');

    const fnXml = getPartText(pkg, 'word/footnotes.xml');
    expect(fnXml).toBeDefined();
    expect(fnXml).toContain('Bổ sung 2026');
  });
});
