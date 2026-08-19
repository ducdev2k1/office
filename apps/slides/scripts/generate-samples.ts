import { generatePptxBuffer, type SlideDeckData } from '@office/pptx-io';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.resolve(__dirname, '../public/samples');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 1. Basic Sample (3 slides, Vietnamese Unicode text, headings, bullet list)
const basicDeck: SlideDeckData = {
  id: 'deck-basic',
  name: 'Báo Cáo Kế Hoạch Quý - iNET',
  ratio: '16:9',
  slides: [
    {
      id: 's1',
      title: 'Trang Bìa',
      background: '#f8fafc',
      elements: [
        {
          id: 'el-1',
          type: 'text',
          x: 100,
          y: 160,
          width: 760,
          height: 90,
          content: 'Kế Hoạch Phát Triển Sản Phẩm Quý 3',
          fontSize: 38,
          color: '#b45309',
          align: 'center',
        },
        {
          id: 'el-2',
          type: 'text',
          x: 150,
          y: 270,
          width: 660,
          height: 50,
          content: 'Đơn vị: Khối Công Nghệ Thông Tin - iNET Office Suite',
          fontSize: 18,
          color: '#475569',
          align: 'center',
        },
      ],
    },
    {
      id: 's2',
      title: 'Mục Tiêu Trọng Tâm',
      background: '#ffffff',
      elements: [
        {
          id: 'el-3',
          type: 'text',
          x: 60,
          y: 50,
          width: 840,
          height: 60,
          content: 'Mục Tiêu Trọng Tâm',
          fontSize: 28,
          color: '#0f172a',
          align: 'left',
        },
        {
          id: 'el-4',
          type: 'text',
          x: 60,
          y: 130,
          width: 840,
          height: 250,
          content: '1. Hoàn thiện bộ ba ứng dụng Docs, Sheets và Slides trên nền Web thuần.\n2. Tối ưu trải nghiệm soạn thảo ngoại tuyến (Offline-first) với IndexedDB.\n3. Đảm bảo khả năng tương thích 100% định dạng file Microsoft Office (.pptx, .xlsx, .docx).\n4. Bảo mật dữ liệu người dùng và tích hợp đăng nhập tập trung OneMail SSO.',
          fontSize: 18,
          color: '#334155',
          align: 'left',
        },
      ],
    },
    {
      id: 's3',
      title: 'Kết Luận & Lộ Trình',
      background: '#ffffff',
      elements: [
        {
          id: 'el-5',
          type: 'text',
          x: 60,
          y: 50,
          width: 840,
          height: 60,
          content: 'Lộ Trình Triển Khai',
          fontSize: 28,
          color: '#0f172a',
          align: 'left',
        },
        {
          id: 'el-6',
          type: 'text',
          x: 60,
          y: 130,
          width: 840,
          height: 200,
          content: '• Tháng 8: Hoàn thành khảo sát kỹ thuật và xây dựng prototype Slides.\n• Tháng 9: Tích hợp xuất nhập PPTX đầy đủ và hoàn thiện giao diện thanh công cụ iNET.\n• Tháng 10: Thử nghiệm diện rộng nội bộ và nâng cấp độ chính xác hiển thị.',
          fontSize: 18,
          color: '#334155',
          align: 'left',
        },
      ],
    },
  ],
};

// 2. Medium Sample (5 slides, shapes, colors, layout)
const mediumDeck: SlideDeckData = {
  id: 'deck-medium',
  name: 'Kiến Trúc Hệ Thống OneOffice',
  ratio: '16:9',
  slides: [
    {
      id: 'm1',
      title: 'Kiến trúc OneOffice Suite',
      background: '#0f172a',
      elements: [
        {
          id: 'mel-1',
          type: 'text',
          x: 100,
          y: 180,
          width: 760,
          height: 80,
          content: 'Kiến Trúc Kỹ Thuật OneOffice Web Suite',
          fontSize: 36,
          color: '#ffffff',
          align: 'center',
        },
        {
          id: 'mel-2',
          type: 'text',
          x: 150,
          y: 280,
          width: 660,
          height: 50,
          content: 'Monorepo Architecture • Turborepo + pnpm workspace',
          fontSize: 18,
          color: '#94a3b8',
          align: 'center',
        },
      ],
    },
    {
      id: 'm2',
      title: 'Các Ứng Dụng Trong Monorepo',
      background: '#ffffff',
      elements: [
        {
          id: 'mel-3',
          type: 'text',
          x: 60,
          y: 50,
          width: 840,
          height: 50,
          content: '1. Cấu Trúc Phân Tầng Ứng Dụng (Apps)',
          fontSize: 26,
          color: '#0f172a',
        },
        {
          id: 'mel-4',
          type: 'shape',
          x: 60,
          y: 120,
          width: 250,
          height: 180,
          fill: '#f0fdf4',
          stroke: '#16a34a',
        },
        {
          id: 'mel-5',
          type: 'text',
          x: 80,
          y: 140,
          width: 210,
          height: 140,
          content: 'apps/docs\n\n• React 19 + TipTap\n• docx-io\n• Trình soạn thảo văn bản',
          fontSize: 15,
          color: '#166534',
        },
        {
          id: 'mel-6',
          type: 'shape',
          x: 350,
          y: 120,
          width: 250,
          height: 180,
          fill: '#eff6ff',
          stroke: '#2563eb',
        },
        {
          id: 'mel-7',
          type: 'text',
          x: 370,
          y: 140,
          width: 210,
          height: 140,
          content: 'apps/sheets\n\n• React 19 + Univer OSS\n• xlsx-io (ExcelJS)\n• Bảng tính & Biểu đồ',
          fontSize: 15,
          color: '#1e40af',
        },
        {
          id: 'mel-8',
          type: 'shape',
          x: 640,
          y: 120,
          width: 250,
          height: 180,
          fill: '#fffbeb',
          stroke: '#d97706',
        },
        {
          id: 'mel-9',
          type: 'text',
          x: 660,
          y: 140,
          width: 210,
          height: 140,
          content: 'apps/slides\n\n• React 19 + pptx-io\n• Canvas 16:9 + Presentation\n• Trình chiếu thông minh',
          fontSize: 15,
          color: '#92400e',
        },
      ],
    },
    {
      id: 'm3',
      title: 'Các Gói Dùng Chung (Packages)',
      background: '#ffffff',
      elements: [
        {
          id: 'mel-10',
          type: 'text',
          x: 60,
          y: 50,
          width: 840,
          height: 50,
          content: '2. Các Thư Viện Dùng Chung (Shared Packages)',
          fontSize: 26,
          color: '#0f172a',
        },
        {
          id: 'mel-11',
          type: 'text',
          x: 60,
          y: 120,
          width: 840,
          height: 300,
          content: '• @office/app-shell: Khung vỏ giao diện chung, TopBar, chuyển đổi ứng dụng ProductSwitcher.\n• @office/file-home: Quản lý danh sách tệp tin, thùng rác, mẫu tài liệu, thống kê bộ nhớ.\n• @office/storage-adapter: Lớp trừu tượng hoá kho lưu trữ IndexedDB/Drive.\n• @office/ui-kit: Design tokens chuẩn thương hiệu iNET, bộ component Shadcn UI + Base UI.\n• @office/i18n: Đa ngôn ngữ Việt/Anh với suy diễn kiểu dữ liệu 100% tự động.',
          fontSize: 17,
          color: '#334155',
        },
      ],
    },
    {
      id: 'm4',
      title: 'Độ Tin Cậy & Hiệu Năng',
      background: '#ffffff',
      elements: [
        {
          id: 'mel-12',
          type: 'text',
          x: 60,
          y: 50,
          width: 840,
          height: 50,
          content: '3. Tiêu Chí Hiệu Năng & Chất Lượng',
          fontSize: 26,
          color: '#0f172a',
        },
        {
          id: 'mel-13',
          type: 'text',
          x: 60,
          y: 130,
          width: 840,
          height: 250,
          content: '• Tốc độ nạp trang ban đầu < 2.0s trên mạng tiêu chuẩn.\n• Thời gian phản hồi thao tác gõ chữ / kéo thả canvas đạt mức 60 FPS mượt mà.\n• Không rò rỉ bộ nhớ khi mở tài liệu lớn kéo dài nhiều giờ.\n• Kiểm tra typecheck và build tự động trong CI/CD đảm bảo 0 lỗi hồi quy.',
          fontSize: 18,
          color: '#334155',
        },
      ],
    },
    {
      id: 'm5',
      title: 'Tổng Kết',
      background: '#f8fafc',
      elements: [
        {
          id: 'mel-14',
          type: 'text',
          x: 100,
          y: 180,
          width: 760,
          height: 80,
          content: 'OneOffice — Sức Mạnh Làm Việc Tự Chủ',
          fontSize: 34,
          color: '#b45309',
          align: 'center',
        },
        {
          id: 'mel-15',
          type: 'text',
          x: 150,
          y: 280,
          width: 660,
          height: 60,
          content: 'Cảm ơn quý khách hàng và các đối tác đã đồng hành cùng iNET.',
          fontSize: 18,
          color: '#64748b',
          align: 'center',
        },
      ],
    },
  ],
};

// 3. Advanced Sample (10 slides)
const advancedDeck: SlideDeckData = {
  id: 'deck-advanced',
  name: 'Hồ Sơ Năng Lực Doanh Nghiệp iNET Corp',
  ratio: '16:9',
  slides: Array.from({ length: 10 }, (_, i) => ({
    id: `adv-${i + 1}`,
    title: `Mục ${i + 1}: Chuyên Đề ${i + 1}`,
    background: i % 2 === 0 ? '#ffffff' : '#f8fafc',
    elements: [
      {
        id: `ael-${i}-1`,
        type: 'text',
        x: 60,
        y: 60,
        width: 840,
        height: 60,
        content: `Chuyên Đề ${i + 1}: Báo Cáo Chiến Lược Chuyển Đổi Số`,
        fontSize: 28,
        color: '#0f172a',
      },
      {
        id: `ael-${i}-2`,
        type: 'text',
        x: 60,
        y: 140,
        width: 840,
        height: 250,
        content: `Nội dung chi tiết phân tích của chuyên đề số ${i + 1}.\n\n• Đánh giá hiện trạng hạ tầng và dịch vụ đám mây.\n• Triển khai giải pháp phần mềm quản trị văn phòng trực tuyến độc lập.\n• Đảm bảo tính liên tục trong hoạt động nghiệp vụ của khách hàng doanh nghiệp.\n• Cam kết mức độ sẵn sàng dịch vụ (SLA) đạt 99.9%.`,
        fontSize: 18,
        color: '#334155',
      },
    ],
  })),
};

const buildAll = async () => {
  console.log('Generating sample PPTX files...');

  const bBuffer = await generatePptxBuffer(basicDeck);
  fs.writeFileSync(path.join(outputDir, 'sample-basic.pptx'), bBuffer);
  console.log(`✓ Generated sample-basic.pptx (${bBuffer.byteLength} bytes)`);

  const mBuffer = await generatePptxBuffer(mediumDeck);
  fs.writeFileSync(path.join(outputDir, 'sample-medium.pptx'), mBuffer);
  console.log(`✓ Generated sample-medium.pptx (${mBuffer.byteLength} bytes)`);

  const aBuffer = await generatePptxBuffer(advancedDeck);
  fs.writeFileSync(path.join(outputDir, 'sample-advanced.pptx'), aBuffer);
  console.log(`✓ Generated sample-advanced.pptx (${aBuffer.byteLength} bytes)`);

  console.log('Sample generation completed successfully!');
};

void buildAll();
