export interface DocTemplate {
  id: string;
  title: string;
  description: string;
  category: 'work' | 'personal' | 'official';
  content: string;
}

export const DOC_TEMPLATES: DocTemplate[] = [
  {
    id: 'template-blank',
    title: 'Tài liệu trống',
    description: 'Bắt đầu với một tài liệu hoàn toàn mới.',
    category: 'personal',
    content: '<h1>Tài liệu mới</h1><p></p>',
  },
  {
    id: 'template-meeting-notes',
    title: 'Biên bản cuộc họp',
    description: 'Mẫu ghi chép mục tiêu, người tham dự và hành động tiếp theo.',
    category: 'work',
    content: `<h1>BIÊN BẢN CUỘC HỌP</h1>
<p><strong>Ngày họp:</strong> ${new Date().toLocaleDateString('vi-VN')} | <strong>Chủ trì:</strong> Nguyễn Văn A | <strong>Thư ký:</strong> Trần Thị B</p>
<hr />
<h2>1. Thành phần tham dự</h2>
<ul>
  <li>Nguyễn Văn A - Trưởng dự án</li>
  <li>Trần Thị B - Kỹ sư phần mềm</li>
  <li>Lê Văn C - Product Manager</li>
</ul>
<h2>2. Nội dung thảo luận</h2>
<p>Thảo luận về tiến độ phát triển bộ công cụ văn phòng OneOffice, phân bổ tài nguyên và rà soát các mốc bàn giao sắp tới.</p>
<h2>3. Quyết định đã thống nhất</h2>
<ol>
  <li>Hoàn thiện mốc xuất file OOXML .docx đạt fidelity trên 95%.</li>
  <li>Triển khai tính năng làm việc cộng tác đa người dùng trên nền tảng Yjs.</li>
</ol>
<h2>4. Danh sách công việc cần làm (Action Items)</h2>
<ul data-type="taskList">
  <li data-checked="true"><p>Rà soát kiến trúc tầng dữ liệu</p></li>
  <li data-checked="false"><p>Thực hiện kiểm thử tải cho module đồng bộ</p></li>
  <li data-checked="false"><p>Gửi báo cáo tuần cho ban giám đốc</p></li>
</ul>`,
  },
  {
    id: 'template-project-proposal',
    title: 'Đề xuất dự án',
    description: 'Mẫu đề xuất ý tưởng, phân tích chi phí, lộ trình và kết quả kỳ vọng.',
    category: 'work',
    content: `<h1>ĐỀ XUẤT DỰ ÁN CÔNG NGHỆ</h1>
<p><em>Đơn vị đề xuất: Phòng Nghiên cứu và Phát triển</em></p>
<hr />
<h2>1. Mục tiêu và Lý do thực hiện</h2>
<p>Xây dựng hệ thống biên tập tài liệu văn phòng trực tuyến độc lập, tốc độ cao, hỗ trợ bảo mật tuyệt đối và lưu trữ nội bộ cho doanh nghiệp.</p>
<h2>2. Phạm vi và Tính năng cốt lõi</h2>
<table border="1">
  <thead>
    <tr>
      <th>Phân hệ</th>
      <th>Mô tả tính năng</th>
      <th>Thời gian hoàn thành</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Docs</strong></td>
      <td>Soạn thảo văn bản, bảng biểu, xuất file Word</td>
      <td>Tháng 8/2026</td>
    </tr>
    <tr>
      <td><strong>Sheets</strong></td>
      <td>Bảng tính, biểu đồ, công thức số liệu</td>
      <td>Tháng 9/2026</td>
    </tr>
    <tr>
      <td><strong>Slides</strong></td>
      <td>Trình chiếu, hiệu ứng trình bày chuyên nghiệp</td>
      <td>Tháng 10/2026</td>
    </tr>
  </tbody>
</table>
<h2>3. Kế hoạch nguồn lực</h2>
<blockquote>Ưu tiên sử dụng các thư viện mã nguồn mở bản quyền thương mại tự do (MIT, Apache 2.0), cam kết không phụ thuộc vào dịch vụ bên thứ ba.</blockquote>`,
  },
  {
    id: 'template-resume',
    title: 'Hồ sơ năng lực / CV',
    description: 'Bản lý lịch chuyên nghiệp nêu bật kỹ năng và kinh nghiệm.',
    category: 'personal',
    content: `<h1>NGUYỄN VĂN A</h1>
<p><strong>Senior Software Engineer | Hà Nội, Việt Nam</strong></p>
<p>Email: nguyenvana@onemail.vn | Điện thoại: 0987 654 321 | GitHub: github.com/nguyenvana</p>
<hr />
<h2>TÓM TẮT NĂNG LỰC</h2>
<p>Kỹ sư phần mềm với hơn 6 năm kinh nghiệm phát triển ứng dụng Web hiệu năng cao, chuyên sâu về TypeScript, React, kiến trúc Offline-First và đồng bộ Realtime qua CRDT.</p>
<h2>KINH NGHIỆM LÀM VIỆC</h2>
<h3>Trưởng nhóm Kỹ thuật — OneMail Group (2023 - Nay)</h3>
<ul>
  <li>Chịu trách nhiệm kiến trúc bộ ứng dụng văn phòng OneOffice phục vụ hàng chục ngàn người dùng doanh nghiệp.</li>
  <li>Tối ưu hóa Disk I/O Autosave giúp giảm 95% thời gian ghi đĩa và loại bỏ hoàn toàn độ trễ khi gõ phím.</li>
</ul>
<h3>Lập trình viên Frontend Cao cấp — ABC Tech (2020 - 2023)</h3>
<ul>
  <li>Phát triển hệ thống Dashboard tài chính với khối lượng dữ liệu lớn.</li>
</ul>
<h2>HỌC VẤN & CHỨNG CHỈ</h2>
<p><strong>Cử nhân Công nghệ Thông tin</strong> — Đại học Bách Khoa Hà Nội (2016 - 2020)</p>`,
  },
  {
    id: 'template-tech-spec',
    title: 'Đặc tả kỹ thuật (Tech Spec)',
    description: 'Tài liệu kiến trúc hệ thống, sơ đồ khối và chi tiết giải thuật.',
    category: 'official',
    content: `<h1>ĐẶC TẢ KỸ THUẬT: OOXML PRESERVE-AND-PATCH</h1>
<p><strong>Trạng thái:</strong> Đã phê duyệt | <strong>Phiên bản:</strong> 1.2 | <strong>Tác giả:</strong> Core Team</p>
<hr />
<h2>1. Tổng quan Kiến trúc</h2>
<p>Module <code>@office/ooxml-core</code> và <code>@office/docx-io</code> kết hợp với nhau nhằm thực hiện chu trình unpack, patch DOM và repack định dạng WordprocessingML.</p>
<h2>2. Sơ đồ luồng dữ liệu</h2>
<pre><code>File .docx gốc ──&gt; JSZip Unpack ──&gt; Sổ đăng ký part ──&gt; Mapper HTML sang OOXML
                                                             │
Blob (.docx)   &lt;── JSZip Repack &lt;── Cập nhật document.xml &lt;──┘</code></pre>
<h2>3. Ràng buộc bảo toàn dữ liệu</h2>
<ol>
  <li>Bảo toàn 100% byte gốc đối với các phần mở rộng không can thiệp.</li>
  <li>Tất cả thẻ XML sinh ra phải chuẩn hoá theo namespace <code>w:</code> của ECMA-376.</li>
</ol>`,
  },
  {
    id: 'template-formal-letter',
    title: 'Thông báo / Công văn chính thức',
    description: 'Mẫu công văn gửi phòng ban hoặc đối tác.',
    category: 'official',
    content: `<p style="text-align: center;"><strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br /><strong>Độc lập - Tự do - Hạnh phúc</strong></p>
<p style="text-align: center;">---o0o---</p>
<p><em>Hà Nội, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}</em></p>
<h1 style="text-align: center;">THÔNG BÁO VỀ KẾ HOẠCH BÀN GIAO SẢN PHẨM</h1>
<p><strong>Kính gửi:</strong> Toàn thể Quý đối tác và Phòng ban chức năng</p>
<p>Ban Giám đốc xin trân trọng thông báo về việc phát hành chính thức phiên bản OneOffice Suite phục vụ công tác chuyển đổi số:</p>
<ol>
  <li>Thời gian kích hoạt hệ thống: 08:00 sáng ngày 01 tháng 09 năm 2026.</li>
  <li>Các tài khoản OneMail doanh nghiệp sẽ tự động được cấp quyền truy cập toàn bộ phân hệ Docs, Sheets và Slides.</li>
</ol>
<p>Trân trọng cảm ơn sự phối hợp của Quý đơn vị./.</p>
<p style="text-align: right;"><strong>GIÁM ĐỐC ĐIỀU HÀNH</strong><br /><em>(Đã ký và đóng dấu)</em></p>`,
  },
];
