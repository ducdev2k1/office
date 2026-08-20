import assert from 'node:assert/strict';
import { generatePptxBuffer } from '../generator/pptxGenerator.service';
import { parsePptxBuffer } from '../parser/pptxParser.service';
import type { SlideDeckData } from '../types';

const sampleDeck: SlideDeckData = {
  id: 'test-deck-1',
  name: 'Bài Thuyết Trình Mẫu Doanh Nghiệp',
  ratio: '16:9',
  slides: [
    {
      id: 's1',
      title: 'Trang mở đầu',
      background: '#f8fafc',
      elements: [
        {
          id: 'el-1',
          type: 'text',
          x: 100,
          y: 150,
          width: 760,
          height: 80,
          content: 'Giải Pháp Văn Phòng Trực Tuyến OneOffice',
          fontSize: 36,
          color: '#b45309',
          align: 'center',
        },
        {
          id: 'el-2',
          type: 'text',
          x: 150,
          y: 250,
          width: 660,
          height: 60,
          content: 'Tối ưu hóa quy trình làm việc và bảo mật dữ liệu',
          fontSize: 18,
          color: '#475569',
          align: 'center',
        },
      ],
    },
    {
      id: 's2',
      title: 'Tính năng cốt lõi',
      background: '#ffffff',
      elements: [
        {
          id: 'el-3',
          type: 'text',
          x: 60,
          y: 60,
          width: 840,
          height: 50,
          content: 'Các Tính Năng Nổi Bật',
          fontSize: 28,
          color: '#0f172a',
          align: 'left',
        },
        {
          id: 'el-4',
          type: 'text',
          x: 60,
          y: 140,
          width: 400,
          height: 180,
          content:
            '1. Xử lý tài liệu trực tiếp trên trình duyệt\n2. Tương thích chuẩn OOXML PowerPoint\n3. Hỗ trợ tiếng Việt Unicode hoàn hảo',
          fontSize: 16,
          color: '#334155',
          align: 'left',
        },
      ],
    },
  ],
};

const run = async () => {
  console.log('--- RUNNING PPTX-IO ROUNDTRIP TEST ---');

  // 1. Generate PPTX buffer
  const buffer = await generatePptxBuffer(sampleDeck);
  assert.ok(buffer.byteLength > 0, 'Generated buffer must not be empty');
  console.log(`✓ Generated PPTX buffer: ${buffer.byteLength} bytes`);

  // 2. Parse back from buffer
  const parsedDeck = await parsePptxBuffer(buffer);
  assert.equal(parsedDeck.slides.length, 2, 'Must parse exactly 2 slides');
  assert.equal(parsedDeck.ratio, '16:9', 'Must maintain 16:9 ratio');

  // Verify slide 1 contents
  const s1 = parsedDeck.slides[0];
  assert.ok(s1, 'Slide 1 must exist');
  assert.equal(s1.elements.length, 2, 'Slide 1 must have 2 text elements');
  assert.ok(
    s1.elements[0]?.content?.includes('Giải Pháp Văn Phòng Trực Tuyến OneOffice'),
    'Slide 1 heading text must match Vietnamese unicode',
  );

  // Verify slide 2 contents
  const s2 = parsedDeck.slides[1];
  assert.ok(s2, 'Slide 2 must exist');
  assert.ok(
    s2.elements[0]?.content?.includes('Các Tính Năng Nổi Bật'),
    'Slide 2 title text must match',
  );

  console.log('✓ Roundtrip parse verified: Vietnamese unicode, slide count, and elements intact');
  console.log('🎉 PPTX-IO ROUNDTRIP TEST PASSED SUCCESSFULLY!');
};

void run();
