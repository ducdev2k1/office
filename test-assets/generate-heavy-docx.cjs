const fs = require('node:fs');
const zlib = require('node:zlib');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
  BorderStyle,
  AlignmentType,
  HeadingLevel,
  LevelFormat,
  PageBreak,
  ImageRun,
} = require('docx');

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeAndData = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData));
  return Buffer.concat([len, typeAndData, crc]);
};

/** PNG gradient có nhiễu nhẹ — đủ hợp lệ cho Word/mammoth, khó nén cực tiểu. */
const makePng = (width, height, seed) => {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const raw = Buffer.alloc(height * (1 + width * 3));
  let p = 0;
  for (let y = 0; y < height; y += 1) {
    raw[p] = 0;
    p += 1;
    for (let x = 0; x < width; x += 1) {
      raw[p] = (x * 255) / width + Math.sin(x * seed) * 40;
      raw[p + 1] = (y * 255) / height;
      raw[p + 2] = ((x + y) * 128) / (width + height) + Math.cos(y * seed) * 30;
      p += 3;
    }
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 6 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
};

const LOREM =
  'Văn bản kiểm thử hiệu năng cho trình soạn thảo trực tuyến, bao gồm nhiều đoạn văn dài ' +
  'kết hợp chữ in đậm, chữ in nghiêng và các ký tự tiếng Việt có dấu để đo lường tốc độ ' +
  'phân trang, độ trễ khi gõ và độ mượt khi cuộn trên tài liệu dung lượng lớn. ';

const para = (i) =>
  new Paragraph({
    spacing: { after: 160 },
    children: [
      new TextRun(`[[Khối ${i}]] `),
      new TextRun({ text: LOREM.repeat(2), bold: i % 7 === 0 }),
      new TextRun({ text: ' Đoạn bổ sung để tăng chiều dài dòng.', italics: true }),
    ],
  });

const heading = (text, level) =>
  new Paragraph({
    heading: level === 1 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2,
    children: [new TextRun(text)],
  });

const makeTable = (sectionIndex) => {
  const border = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' };
  const borders = { top: border, bottom: border, left: border, right: border };
  const cell = (text, isHeader) =>
    new TableCell({
      borders,
      width: { size: 2340, type: WidthType.DXA },
      shading: isHeader ? { fill: 'D5E8F0', type: ShadingType.CLEAR } : undefined,
      children: [new Paragraph({ children: [new TextRun({ text, bold: isHeader })] })],
    });
  return new Table({
    columnWidths: [2340, 2340, 2340, 2340],
    rows: [
      new TableRow({
        tableHeader: true,
        children: ['Chỉ số', 'Giá trị', 'Đơn vị', 'Ghi chú'].map((h) => cell(h, true)),
      }),
      ...Array.from({ length: 6 }, (_, r) =>
        new TableRow({
          children: [
            `Dòng ${r + 1}`,
            `${sectionIndex * 10 + r}`,
            'đơn vị',
            'Ghi chú kiểm thử bảng dữ liệu lớn',
          ].map((v) => cell(v, false)),
        }),
      ),
    ],
  });
};

const children = [
  new Paragraph({
    heading: HeadingLevel.TITLE,
    alignment: AlignmentType.CENTER,
    children: [new TextRun('Tài liệu kiểm thử hiệu năng — 300 trang')],
  }),
];

for (let section = 1; section <= 300; section += 1) {
  children.push(heading(`Phần ${section}: Mục tiêu kiểm thử hiệu năng`, 1));
  children.push(heading(`Phân tích ${section}.1 — Tổng quan nội dung`, 2));
  for (let p = 0; p < 5; p += 1) children.push(para(section * 100 + p));
  if (section % 10 === 0) {
    const png = makePng(320, 240, section / 10);
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new ImageRun({
            type: 'png',
            data: png,
            transformation: { width: 400, height: 300 },
            altText: { title: `Hình ${section}`, description: 'Ảnh kiểm thử', name: `img-${section}` },
          }),
        ],
      }),
    );
  }
  if (section % 3 === 0) {
    for (let b = 0; b < 4; b += 1) {
      children.push(
        new Paragraph({
          numbering: { reference: 'bullet-list', level: 0 },
          children: [new TextRun(`Điểm đánh giá thứ ${b + 1} của phần ${section}`)],
        }),
      );
    }
  }
  children.push(heading(`Số liệu ${section}.2 — Bảng thống kê`, 2));
  if (section % 5 === 0) children.push(makeTable(section));
  else for (let p = 5; p < 9; p += 1) children.push(para(section * 100 + p));
  children.push(new Paragraph({ children: [new PageBreak()] }));
}

const doc = new Document({
  styles: {
    default: { document: { run: { font: 'Arial', size: 24 } } },
    paragraphStyles: [
      {
        id: 'Heading1',
        name: 'Heading 1',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { size: 32, bold: true, color: '000000', font: 'Arial' },
        paragraph: { spacing: { before: 240, after: 240 }, outlineLevel: 0 },
      },
      {
        id: 'Heading2',
        name: 'Heading 2',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { size: 28, bold: true, color: '000000', font: 'Arial' },
        paragraph: { spacing: { before: 180, after: 180 }, outlineLevel: 1 },
      },
    ],
  },
  numbering: {
    config: [
      {
        reference: 'bullet-list',
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: '•',
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } },
          },
        ],
      },
    ],
  },
  sections: [{ children }],
});

Packer.toBuffer(doc).then((buffer) => {
  const out = 'heavy-300-trang.docx';
  fs.writeFileSync(out, buffer);
  console.log(`${out}: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);
});
