import { describe, expect, it } from 'vitest';
import { convertDocxToHtml, exportDocx } from '../index';

const roundTrip = async (html: string): Promise<string> =>
  convertDocxToHtml(await exportDocx(html));

describe('direct formatting round-trip (mammoth gap fix)', () => {
  it('giữ underline qua round-trip', async () => {
    const html = await roundTrip('<p>Trước <u>gạch chân</u> sau</p>');
    expect(html).toContain('<u>gạch chân</u>');
    expect(html).toContain('Trước ');
    expect(html).toContain(' sau');
  });

  it('giữ màu chữ qua round-trip', async () => {
    const html = await roundTrip('<p><span style="color: #DC2626">màu đỏ</span></p>');
    expect(html.toLowerCase()).toMatch(/color:\s*#dc2626/);
    expect(html).toContain('màu đỏ');
  });

  it('giữ highlight qua round-trip', async () => {
    const html = await roundTrip('<p>nền <mark>nổi bật</mark> xong</p>');
    expect(html).toContain('<mark>nổi bật</mark>');
  });

  it('giữ căn lề đoạn qua round-trip', async () => {
    const center = await roundTrip('<p style="text-align: center">giữa trang</p>');
    expect(center).toMatch(/text-align:\s*center/i);
    const justify = await roundTrip('<p style="text-align: justify">hai bên</p>');
    expect(justify).toMatch(/text-align:\s*justify/i);
  });

  it('giữ ngắt trang qua round-trip', async () => {
    const html = await roundTrip('<p>Trang một</p><div data-type="page-break"></div><p>Trang hai</p>');
    expect(html).toContain('data-type="page-break"');
    expect(html.indexOf('data-type="page-break"')).toBeGreaterThan(html.indexOf('Trang một'));
    expect(html.indexOf('Trang hai')).toBeGreaterThan(html.indexOf('data-type="page-break"'));
  });

  it('strike do mammoth xử lý, không bồi thêm lớp s lồng nhau', async () => {
    const html = await roundTrip('<p><u><s>xóa gạch</s></u></p>');
    expect(html).toContain('<u>xóa gạch</u>');
    expect(html).toContain('<s>');
    expect(html).not.toContain('<s><s>');
  });

  it('không bồi thêm định dạng cho link', async () => {
    const html = await roundTrip('<p>Xem <a href="https://example.com">liên kết</a>.</p>');
    expect(html).toContain('href="https://example.com"');
    expect(html).not.toMatch(/color:\s*#0000ff/i);
  });

  it('văn bản thuần không bị biến đổi', async () => {
    const html = await roundTrip('<h1>Tiêu đề</h1><p>Đoạn văn bình thường.</p>');
    expect(html).toContain('<h1>Tiêu đề</h1>');
    expect(html).toContain('<p>Đoạn văn bình thường.</p>');
  });
});
