import type { SlideDeckData, SlideDocRecord, SlideItem } from '@/types/slides.types';
import { generatePptxBlob, parsePptxBuffer, parsePptxFile } from '@office/pptx-io';
import { createDocumentStore } from '@office/storage-adapter';

const STORE_NAME = 'slides';
const store = createDocumentStore<SlideDocRecord>(STORE_NAME);

const now = (): string => new Date().toISOString();

const createDefaultSlide = (): SlideItem => ({
  id: `slide-${crypto.randomUUID()}`,
  title: 'Trang tiêu đề',
  background: '#ffffff',
  elements: [
    {
      id: `el-${crypto.randomUUID()}`,
      type: 'text',
      x: 100,
      y: 180,
      width: 760,
      height: 90,
      content: 'Bài Trình Chiếu Mới',
      fontSize: 36,
      color: '#0f172a',
      align: 'center',
    },
    {
      id: `el-${crypto.randomUUID()}`,
      type: 'text',
      x: 150,
      y: 280,
      width: 660,
      height: 50,
      content: 'Nhấp đúp để chỉnh sửa nội dung thuyết trình',
      fontSize: 18,
      color: '#64748b',
      align: 'center',
    },
  ],
});

export const createBlankDeckData = (
  id: string,
  title = 'Bài trình chiếu chưa có tiêu đề',
): SlideDeckData => ({
  id,
  name: title,
  ratio: '16:9',
  slides: [createDefaultSlide()],
});

export const createBlankSlideDeck = (title?: string): SlideDocRecord => {
  const id = `deck-${crypto.randomUUID()}`;
  const effectiveTitle = title?.trim() || 'Bài trình chiếu chưa có tiêu đề';
  const timestamp = now();
  return {
    id,
    kind: 'slides',
    title: effectiveTitle,
    createdAt: timestamp,
    updatedAt: timestamp,
    lastOpenedAt: timestamp,
    starred: false,
    deletedAt: null,
    data: createBlankDeckData(id, effectiveTitle),
  };
};

const SEED_SLIDES: SlideDocRecord[] = [
  {
    id: 'deck-sample-intro',
    kind: 'slides',
    title: 'Giới thiệu giải pháp OneOffice',
    createdAt: '2026-08-19T08:00:00.000Z',
    updatedAt: '2026-08-19T08:00:00.000Z',
    lastOpenedAt: '2026-08-19T08:00:00.000Z',
    starred: true,
    deletedAt: null,
    data: {
      id: 'deck-sample-intro',
      name: 'Giới thiệu giải pháp OneOffice',
      ratio: '16:9',
      slides: [
        {
          id: 'slide-1',
          title: 'Trang mở đầu',
          background: '#f8fafc',
          elements: [
            {
              id: 'el-1',
              type: 'text',
              x: 80,
              y: 160,
              width: 800,
              height: 100,
              content: 'OneOffice Presentation Suite',
              fontSize: 40,
              color: '#b45309',
              align: 'center',
            },
            {
              id: 'el-2',
              type: 'text',
              x: 120,
              y: 270,
              width: 720,
              height: 60,
              content:
                'Bộ công cụ văn phòng trực tuyến bảo mật, độc lập và tối ưu cho doanh nghiệp',
              fontSize: 18,
              color: '#475569',
              align: 'center',
            },
          ],
        },
        {
          id: 'slide-2',
          title: 'Tính năng nổi bật',
          background: '#ffffff',
          elements: [
            {
              id: 'el-3',
              type: 'text',
              x: 60,
              y: 50,
              width: 840,
              height: 60,
              content: 'Các Tính Năng Cốt Lõi',
              fontSize: 28,
              color: '#0f172a',
              align: 'left',
            },
            {
              id: 'el-4',
              type: 'text',
              x: 60,
              y: 130,
              width: 400,
              height: 200,
              content:
                '• Xử lý hoàn toàn trên trình duyệt (Offline-first)\n• Tương thích định dạng Microsoft PowerPoint (.pptx)\n• Tích hợp hệ thống OneMail SSO & Storage\n• Tùy biến linh hoạt theo thương hiệu iNET',
              fontSize: 16,
              color: '#334155',
              align: 'left',
            },
          ],
        },
      ],
    },
  },
];

export const loadSlides = async (): Promise<SlideDocRecord[]> => {
  try {
    const list = await store.list();
    if (list.length > 0) return list;
    await store.putMany(SEED_SLIDES);
    return SEED_SLIDES;
  } catch {
    return SEED_SLIDES;
  }
};

export const saveSlideDeck = async (deck: SlideDocRecord): Promise<void> => {
  try {
    await store.put(deck);
  } catch (error) {
    console.error('Failed to persist slide deck into IndexedDB:', error);
  }
};

export const saveSlides = async (slides: SlideDocRecord[]): Promise<void> => {
  try {
    await store.putMany(slides);
  } catch (error) {
    console.error('Failed to persist slides into IndexedDB:', error);
  }
};

export const deleteSlideRecord = async (id: string): Promise<void> => {
  try {
    await store.delete(id);
  } catch (error) {
    console.error('Failed to delete slide record:', error);
  }
};

export const importSlideFile = async (file: File): Promise<SlideDocRecord> => {
  const id = `deck-${crypto.randomUUID()}`;
  const timestamp = now();
  let deckData: SlideDeckData;

  try {
    deckData = await parsePptxFile(file);
    deckData.id = id;
  } catch {
    const fallbackTitle = file.name.replace(/\.pptx$/i, '') || 'Bài trình chiếu đã nhập';
    deckData = createBlankDeckData(id, fallbackTitle);
  }

  const title = deckData.name || file.name.replace(/\.pptx$/i, '') || 'Bài trình chiếu đã nhập';

  const newDeck: SlideDocRecord = {
    id,
    kind: 'slides',
    title,
    createdAt: timestamp,
    updatedAt: timestamp,
    lastOpenedAt: timestamp,
    starred: false,
    deletedAt: null,
    data: deckData,
  };

  await store.put(newDeck);
  return newDeck;
};

export const loadSamplePptx = async (
  sampleName: 'sample-basic.pptx' | 'sample-medium.pptx' | 'sample-advanced.pptx',
): Promise<SlideDocRecord> => {
  const response = await fetch(`/samples/${sampleName}`);
  const buffer = await response.arrayBuffer();
  const id = `deck-${crypto.randomUUID()}`;
  const deckData = await parsePptxBuffer(buffer);
  deckData.id = id;
  const timestamp = now();

  const titleMap: Record<string, string> = {
    'sample-basic.pptx': 'Mẫu Cơ Bản (Báo Cáo Kế Hoạch Quý)',
    'sample-medium.pptx': 'Mẫu Trung Bình (Kiến Trúc OneOffice)',
    'sample-advanced.pptx': 'Mẫu Nâng Cao (Hồ Sơ Năng Lực 10 Trang)',
  };

  const newDeck: SlideDocRecord = {
    id,
    kind: 'slides',
    title: titleMap[sampleName] || deckData.name || sampleName,
    createdAt: timestamp,
    updatedAt: timestamp,
    lastOpenedAt: timestamp,
    starred: false,
    deletedAt: null,
    data: deckData,
  };

  await store.put(newDeck);
  return newDeck;
};

export const exportSlideFile = async (deck: SlideDeckData): Promise<Blob> => {
  return generatePptxBlob(deck);
};

export const getStorageUsageBytes = (slides: SlideDocRecord[]): number => {
  try {
    return new Blob([JSON.stringify(slides)]).size;
  } catch {
    return 0;
  }
};
