import type { SlideElement, SlideItem, SlideLayoutType } from '@/types/slides.types';
import { createNewElement } from './slideOps.utils';

export const createSlideWithLayout = (
  layout: SlideLayoutType,
  slideIndex: number,
  t: (key: string, params?: Record<string, string | number>) => string,
): SlideItem => {
  const slideId = `slide-${crypto.randomUUID()}`;
  const elements: SlideElement[] = [];

  switch (layout) {
    case 'title':
      elements.push(
        createNewElement({
          type: 'text',
          x: 80,
          y: 150,
          width: 800,
          height: 100,
          content: t('editor.defaultNewTitle'),
          fontSize: 40,
          fontWeight: 'bold',
          align: 'center',
          color: '#0f172a',
        }),
        createNewElement({
          type: 'text',
          x: 120,
          y: 270,
          width: 720,
          height: 60,
          content: t('editor.defaultNewText'),
          fontSize: 20,
          align: 'center',
          color: '#475569',
        }),
      );
      break;

    case 'title-body':
      elements.push(
        createNewElement({
          type: 'text',
          x: 60,
          y: 40,
          width: 840,
          height: 60,
          content: t('editor.defaultNewTitle'),
          fontSize: 30,
          fontWeight: 'bold',
          align: 'left',
          color: '#0f172a',
        }),
        createNewElement({
          type: 'text',
          x: 60,
          y: 120,
          width: 840,
          height: 360,
          content: `• ${t('editor.defaultNewText')} 1\n• ${t('editor.defaultNewText')} 2\n• ${t('editor.defaultNewText')} 3`,
          fontSize: 18,
          align: 'left',
          color: '#334155',
        }),
      );
      break;

    case 'two-column':
      elements.push(
        createNewElement({
          type: 'text',
          x: 60,
          y: 40,
          width: 840,
          height: 60,
          content: t('editor.defaultNewTitle'),
          fontSize: 30,
          fontWeight: 'bold',
          align: 'left',
          color: '#0f172a',
        }),
        createNewElement({
          type: 'text',
          x: 60,
          y: 120,
          width: 400,
          height: 360,
          content: `• Cột trái 1\n• Cột trái 2\n• Cột trái 3`,
          fontSize: 18,
          align: 'left',
          color: '#334155',
        }),
        createNewElement({
          type: 'text',
          x: 500,
          y: 120,
          width: 400,
          height: 360,
          content: `• Cột phải 1\n• Cột phải 2\n• Cột phải 3`,
          fontSize: 18,
          align: 'left',
          color: '#334155',
        }),
      );
      break;

    case 'section-header':
      elements.push(
        createNewElement({
          type: 'text',
          x: 80,
          y: 200,
          width: 800,
          height: 120,
          content: 'Tiêu Đề Phần Mới',
          fontSize: 38,
          fontWeight: 'bold',
          align: 'center',
          color: '#1e40af',
        }),
      );
      break;

    case 'title-only':
      elements.push(
        createNewElement({
          type: 'text',
          x: 60,
          y: 40,
          width: 840,
          height: 60,
          content: t('editor.defaultNewTitle'),
          fontSize: 30,
          fontWeight: 'bold',
          align: 'left',
          color: '#0f172a',
        }),
      );
      break;

    case 'comparison':
      elements.push(
        createNewElement({
          type: 'text',
          x: 60,
          y: 30,
          width: 840,
          height: 50,
          content: 'So Sánh & Đánh Giá',
          fontSize: 28,
          fontWeight: 'bold',
          align: 'center',
          color: '#0f172a',
        }),
        createNewElement({
          type: 'shape',
          shapeKind: 'rounded',
          x: 60,
          y: 90,
          width: 400,
          height: 400,
          fill: '#eff6ff',
          stroke: '#93c5fd',
          strokeWidth: 1,
        }),
        createNewElement({
          type: 'text',
          x: 80,
          y: 110,
          width: 360,
          height: 40,
          content: 'Phương Án A',
          fontSize: 22,
          fontWeight: 'bold',
          align: 'center',
          color: '#1e40af',
        }),
        createNewElement({
          type: 'text',
          x: 80,
          y: 160,
          width: 360,
          height: 310,
          content: '• Ưu điểm 1\n• Ưu điểm 2\n• Chi phí hợp lý',
          fontSize: 16,
          align: 'left',
          color: '#334155',
        }),
        createNewElement({
          type: 'shape',
          shapeKind: 'rounded',
          x: 500,
          y: 90,
          width: 400,
          height: 400,
          fill: '#f0fdf4',
          stroke: '#86efac',
          strokeWidth: 1,
        }),
        createNewElement({
          type: 'text',
          x: 520,
          y: 110,
          width: 360,
          height: 40,
          content: 'Phương Án B',
          fontSize: 22,
          fontWeight: 'bold',
          align: 'center',
          color: '#16a34a',
        }),
        createNewElement({
          type: 'text',
          x: 520,
          y: 160,
          width: 360,
          height: 310,
          content: '• Tốc độ cao\n• Khả năng mở rộng\n• Tính linh hoạt tối đa',
          fontSize: 16,
          align: 'left',
          color: '#334155',
        }),
      );
      break;

    case 'one-column':
      elements.push(
        createNewElement({
          type: 'text',
          x: 180,
          y: 60,
          width: 600,
          height: 60,
          content: t('editor.defaultNewTitle'),
          fontSize: 28,
          fontWeight: 'bold',
          align: 'center',
          color: '#0f172a',
        }),
        createNewElement({
          type: 'text',
          x: 180,
          y: 140,
          width: 600,
          height: 340,
          content: `• ${t('editor.defaultNewText')} 1\n• ${t('editor.defaultNewText')} 2\n• ${t('editor.defaultNewText')} 3`,
          fontSize: 18,
          align: 'left',
          color: '#334155',
        }),
      );
      break;

    case 'blank':
    default:
      break;
  }

  return {
    id: slideId,
    title: `${slideIndex + 1}`,
    layout,
    background: '#ffffff',
    transition: 'fade',
    elements,
  };
};
