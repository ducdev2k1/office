import { describe, it, expect } from 'vitest';
import { measureDocxFidelity, standardFormatChecks } from '../index';

describe('fidelity-harness docx', () => {
  it('should verify high text fidelity round-trip for standard docx export', async () => {
    const html = `
      <h1>Báo Cáo Hiệu Năng Hệ Thống</h1>
      <p>Kiến trúc offline-first đảm bảo độ ổn định cao.</p>
      <ul>
        <li>Tối ưu I/O</li>
        <li>Bảo toàn dữ liệu OOXML</li>
      </ul>
      <table>
        <tr><th>Mục</th><th>Kết quả</th></tr>
        <tr><td>Autosave</td><td>Nhanh hơn 20 lần</td></tr>
      </table>
    `;

    const report = await measureDocxFidelity(html, [
      'Báo Cáo Hiệu Năng',
      'offline-first',
      'Tối ưu I/O',
      'Bảo toàn dữ liệu',
      'Autosave',
      'Nhanh hơn 20 lần',
    ]);

    expect(report.isSuccess).toBe(true);
    expect(report.textFidelity).toBe(100);
    expect(report.parts).toContain('word/document.xml');
    expect(report.parts).toContain('word/styles.xml');
  });

  it('should measure format fidelity against element-class checks', async () => {
    const html = `
      <h2>Định dạng tổng hợp</h2>
      <p style="text-align: justify;"><strong>Đậm</strong> <em>Nghiêng</em> <u>Gạch chân</u> <s>Gạch ngang</s> <span style="color: #dc2626;">Màu đỏ</span> <mark>Tô sáng</mark></p>
      <ol><li>Mục đánh số</li></ol>
      <table><tr><th>Hạng mục</th></tr><tr><td>Kết quả đo</td></tr></table>
      <p><a href="https://example.com">Liên kết</a></p>
      <div data-type="page-break"></div>
      <p>Sau ngắt trang</p>
    `;

    const report = await measureDocxFidelity(
      html,
      ['Định dạng tổng hợp', 'Mục đánh số', 'Sau ngắt trang'],
      standardFormatChecks(),
    );

    expect(report.textFidelity).toBe(100);
    expect(report.formatFidelity).toBeGreaterThanOrEqual(90);
    expect(report.isSuccess).toBe(true);

    const failed = report.formatResults.filter((r) => !r.passed).map((r) => r.label);
    expect(failed).toEqual([]);
  });
});
