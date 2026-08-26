import { exportDocx } from '@office/docx-io';
import {
  getPartText,
  repackOoxml,
  setPartText,
  unpackOoxml,
} from '@office/ooxml-core';

export interface CorpusFile {
  name: string;
  buffer: Uint8Array;
}

export interface CorpusEntry {
  name: string;
  html: string;
}

const PNG_BLUE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
const PNG_RED =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

export const CORPUS_ENTRIES: CorpusEntry[] = [
  {
    name: 'synthetic-bang-merge-colspan.docx',
    html: `<h2>Bảng hợp nhất ô</h2>
<table>
<tr><th colspan="2">Khu vực hợp nhất ngang</th><th>Cột độc lập</th></tr>
<tr><td style="background-color:#DBEAFE">Ô A2</td><td>Ô B2</td><td>Ô C2</td></tr>
<tr><td colspan="3" style="background-color:#DCFCE7">Dòng gộp trọn ba cột tổng kết</td></tr>
<tr><td>Tổng tiền</td><td><strong>12.500.000 VNĐ</strong></td><td><em>Đã duyệt</em></td></tr>
</table>`,
  },
  {
    name: 'synthetic-danh-sach-da-cap.docx',
    html: `<h2>Danh sách nhiều cấp</h2>
<ul>
<li>Chương một: Tổng quan
<ul>
<li>Mục 1.1: Bối cảnh
<ol>
<li>Điểm nhấn thứ nhất của mục 1.1</li>
<li>Điểm nhấn thứ hai của mục 1.1</li>
</ol>
</li>
<li>Mục 1.2: Phạm vi công việc</li>
</ul>
</li>
<li>Chương hai: Kế hoạch triển khai</li>
<li>Chương ba: Dự kiến kinh phí</li>
</ul>`,
  },
  {
    name: 'synthetic-anh-nhung.docx',
    html: `<h2>Ảnh nhúng trong tài liệu</h2>
<p>Hình minh họa đầu tiên với kích thước lớn:</p>
<img src="${PNG_BLUE}" width="320" height="160">
<p>Theo đó là hình vuông nhỏ hơn nằm giữa đoạn văn bản.</p>
<img src="${PNG_RED}" width="96" height="96">
<p>Kết thúc phần minh họa bằng đoạn chữ bình thường.</p>`,
  },
  {
    name: 'synthetic-hyperlink-dang-cach.docx',
    html: `<h2>Liên kết đa dạng</h2>
<p>Trang chủ đối tác: <a href="https://inet.vn">iNET</a> và tài liệu kỹ thuật <a href="https://docs.example.com/huong-dan">Tài liệu hướng dẫn sử dụng</a>.</p>
<p>Liên hệ email: <a href="mailto:vanban@inet.vn">vanban@inet.vn</a> hoặc gọi hotline.</p>
<p>Liên kết trong câu cũng được hỗ trợ như <a href="https://example.com/bao-cao">báo cáo mẫu</a> ở trên mạng.</p>`,
  },
  {
    name: 'synthetic-bookmark-anchor.docx',
    html: `<h2>Dấu trang và điểm neo</h2>
<p>Văn bản mở đầu có <span data-bookmark-id="muc-dau" data-bookmark-name="Muc_dau">điểm neo đầu tiên</span> đặt giữa câu.</p>
<p>Đoạn nội dung chính trình bày chi tiết các nội dung đã thống nhất giữa hai bên.</p>
<p>Kết thúc tại <span data-bookmark-id="muc-cuoi" data-bookmark-name="Muc_cuoi">điểm neo cuối cùng</span> của tài liệu.</p>`,
  },
  {
    name: 'synthetic-chan-trang-chu-thich.docx',
    html: `<h2>Chú thích cuối trang</h2>
<p>Văn bản hành chính phải tuân thủ quy định định dạng<span data-type="footnote" data-footnote-content="Nghị định 30/2020/NĐ-CP về công tác văn thư"></span> hiện hành.</p>
<p>Thời hạn nộp báo cáo được gia hạn thêm mười ngày làm việc<span data-type="footnote" data-footnote-content="Quyết định 05/2024/QĐ-TTg kèm phụ lục"></span>.</p>`,
  },
  {
    name: 'synthetic-nd30-cong-van.docx',
    html: `<p style="text-align: center"><span style="font-family: 'Times New Roman'; font-size: 13pt"><strong>ỦY BAN NHÂN DÂN TỈNH BẮC NINH</strong></span></p>
<p style="text-align: center"><span style="font-family: 'Times New Roman'; font-size: 13pt"><strong>SỞ KHOA HỌC VÀ CÔNG NGHỆ</strong></span></p>
<hr>
<p style="text-align: right"><span style="font-size: 13pt"><em>Số: 1523/BC-SKHCN</em></span></p>
<p style="text-align: right"><span style="font-size: 13pt"><em>V/v tổng kết triển khai chuyển đổi số</em></span></p>
<p><span style="font-family: 'Times New Roman'; font-size: 13pt"><strong>KÍNH BÁO CÁO</strong></span></p>
<p style="line-height: 1.5; text-align: justify"><span style="font-family: 'Times New Roman'; font-size: 13.5pt">Căn cứ Kế hoạch số 25/KH-UBND ngày 15 tháng 02 năm 2026 của Ủy ban nhân dân tỉnh về triển khai Chương trình chuyển đổi số giai đoạn 2026 - 2030;</span></p>
<p style="line-height: 1.5; text-align: justify"><span style="font-family: 'Times New Roman'; font-size: 13.5pt">Xét kết quả thực tế sáu tháng đầu năm, Sở Khoa học và Công nghệ kính báo cáo Ủy ban nhân dân tỉnh như sau: toàn địa phương hoàn thành 87% chỉ tiêu giao, trong đó khối hành chính công đạt tỷ lệ cao nhất.</span></p>
<p style="line-height: 1.5; text-align: justify"><span style="font-family: 'Times New Roman'; font-size: 13.5pt">Đề nghị Ủy ban nhân dân tỉnh xem xét, chỉ đạo các đơn vị liên quan phối hợp thực hiện các nhiệm vụ còn tồn đọng theo kế hoạch.</span></p>
<p style="text-align: right"><span style="font-size: 13pt"><em>Nơi nhận: Như Điều 3;</em></span></p>`,
  },
  {
    name: 'synthetic-ma-nguon-pre.docx',
    html: `<h2>Đoạn mã nguồn</h2>
<p>Ví dụ hàm tính tổng viết bằng TypeScript:</p>
<pre><code data-language="typescript">const tinhTong = (a: number, b: number): number => {
  return a + b;
};

console.log(tinhTong(2, 3));</code></pre>
<p>Đoạn mã trên in ra số năm ra màn hình console.</p>`,
  },
  {
    name: 'synthetic-callout-bon-loai.docx',
    html: `<h2>Bốn loại hộp thông báo</h2>
<div data-type="callout" data-callout-type="info"><p>Hệ thống sẽ bảo trì vào 22h tối thứ sáu hàng tuần.</p></div>
<div data-type="callout" data-callout-type="tip"><p>Nên bật chế độ tự động lưu mỗi năm phút một lần.</p></div>
<div data-type="callout" data-callout-type="warning"><p>Không chia sẻ link tài liệu ra ngoài phạm vi nội bộ.</p></div>
<div data-type="callout" data-callout-type="danger"><p>Xóa thùng rác sẽ không thể khôi phục dữ liệu đã mất.</p></div>`,
  },
  {
    name: 'synthetic-task-list-checklist.docx',
    html: `<h2>Checklist công việc tuần</h2>
<ul data-type="taskList">
<li data-checked="true"><p>Rà soát tài liệu đầu vào</p></li>
<li data-checked="true"><p>Chốt nội dung với phòng pháp chế</p></li>
<li data-checked="false"><p>In bản cứng trình ký</p></li>
<li data-checked="false"><p>Lưu hồ sơ điện tử vào kho dùng chung</p></li>
</ul>`,
  },
  {
    name: 'synthetic-ngat-trang-da-phan.docx',
    html: `<h1>Phần mở đầu</h1>
<p>Nội dung phần một trình bày bối cảnh và lý do ban hành tài liệu này dành cho mọi người đọc tham khảo.</p>
<div data-type="page-break"></div>
<h1>Phần nội dung chính</h1>
<p>Phần hai đi sâu vào phân tích số liệu thu được từ ba quý liên tiếp vừa qua.</p>
<div data-type="page-break"></div>
<h2>Phụ lục số liệu chi tiết</h2>
<p>Trang cuối cùng chứa bảng số liệu đối chiếu giữa kế hoạch và thực tế thực hiện.</p>`,
  },
  {
    name: 'synthetic-tong-hop-lop-a.docx',
    html: `<h1>Báo cáo tổng hợp định kỳ</h1>
<p>Đoạn mở đầu có <strong>chữ đậm</strong>, <em>chữ nghiêng</em>, <u>gạch chân</u> và <s>gạch ngang</s> cùng lúc.</p>
<p style="text-align: center">Đoạn căn giữa với <span style="color:#DC2626">chữ màu đỏ</span> và <mark>nền vàng nổi bật</mark>.</p>
<blockquote>Trích dẫn điều khoản áp dụng từ văn bản hợp nhất mới nhất.</blockquote>
<hr>
<h2>Bảng thống kê kèm ảnh</h2>
<table>
<tr><th>Chỉ tiêu</th><th>Kế hoạch</th><th>Thực hiện</th></tr>
<tr><td>Sản lượng</td><td>1.200</td><td style="background-color:#FEF9C3">1.350</td></tr>
</table>
<ul><li>Mục kết luận một</li><li>Mục kết luận hai</li></ul>
<img src="${PNG_BLUE}" width="160" height="80">
<p>Tham khảo chi tiết tại <a href="https://example.com/tong-hop">trang tổng hợp</a>.</p>
<div data-type="page-break"></div>
<p>Hết báo cáo sau khi ngắt trang.</p>`,
  },
];

const HEADER_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:i/><w:color w:val="808080"/></w:rPr><w:t xml:space="preserve">Tai lieu noi bo - Luu hanh khong rong rai</w:t></w:r></w:p></w:hdr>`;

const FOOTER_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:instrText xml:space="preserve">PAGE</w:instrText></w:r><w:r><w:fldChar w:fldCharType="separate"/></w:r><w:r><w:t>1</w:t></w:r><w:r><w:fldChar w:fldCharType="end"/></w:r></w:p></w:ftr>`;

const CT_OVERRIDE = (part: string, kind: string): string =>
  `<Override PartName="/word/${part}" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.${kind}+xml"/>`;

const REL_ENTRY = (id: string, kind: string, target: string): string =>
  `<Relationship Id="${id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/${kind}" Target="${target}"/>`;

export const injectHeaderFooter = async (buffer: Uint8Array): Promise<Uint8Array> => {
  const pkg = await unpackOoxml(buffer);

  setPartText(pkg, 'word/header1.xml', HEADER_XML);
  setPartText(pkg, 'word/footer1.xml', FOOTER_XML);

  const contentTypes = getPartText(pkg, '[Content_Types].xml') ?? '';
  setPartText(
    pkg,
    '[Content_Types].xml',
    contentTypes.replace(
      '</Types>',
      `${CT_OVERRIDE('header1.xml', 'header')}${CT_OVERRIDE('footer1.xml', 'footer')}</Types>`,
    ),
  );

  const rels = getPartText(pkg, 'word/_rels/document.xml.rels') ?? '';
  setPartText(
    pkg,
    'word/_rels/document.xml.rels',
    rels.replace(
      '</Relationships>',
      `${REL_ENTRY('rIdHeader1', 'header', 'header1.xml')}${REL_ENTRY('rIdFooter1', 'footer', 'footer1.xml')}</Relationships>`,
    ),
  );

  const documentXml = getPartText(pkg, 'word/document.xml') ?? '';
  setPartText(
    pkg,
    'word/document.xml',
    documentXml.replace(
      '</w:sectPr>',
      '<w:headerReference w:type="default" r:id="rIdHeader1"/><w:footerReference w:type="default" r:id="rIdFooter1"/></w:sectPr>',
    ),
  );

  return repackOoxml(pkg);
};

export const generateCorpus = async (): Promise<CorpusFile[]> => {
  const files: CorpusFile[] = [];
  for (const entry of CORPUS_ENTRIES) {
    const buffer = await exportDocx(entry.html);
    files.push({ name: entry.name, buffer });
  }

  const baseBody = await exportDocx(
    '<h1>Văn bản có header footer</h1><p>Phần thân tài liệu chỉ chứa nội dung chính, riêng phần đầu trang và chân trang được chèn số trang tự động kèm dòng nhắc lưu hành nội bộ.</p>',
  );
  files.push({
    name: 'synthetic-header-footer-so-trang.docx',
    buffer: await injectHeaderFooter(baseBody),
  });

  return files;
};
