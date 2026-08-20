import { describe, it, expect } from 'vitest';
import { measureDocxFidelity } from '../index';

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
});
