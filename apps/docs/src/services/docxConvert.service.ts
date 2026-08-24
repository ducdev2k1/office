import type { DocxConvertRequest, DocxConvertResponse } from '@/workers/docx-convert.worker';

let nextRequestId = 1;

/**
 * Convert .docx trong Web Worker để không chặn main thread khi import file lớn.
 * new URL(...) phải dùng đường dẫn tương đối — đây là yêu cầu phân tích tĩnh của Vite
 * khi bundle worker (không phải module import nên không vi phạm quy tắc alias).
 */
const createWorker = (): Worker | null => {
  try {
    return new Worker(new URL('../workers/docx-convert.worker.ts', import.meta.url), {
      type: 'module',
    });
  } catch (error) {
    console.warn('[docxConvert] Web Worker unavailable, fallback to main thread:', error);
    return null;
  }
};

export const convertDocxInWorker = async (file: Blob): Promise<string> => {
  const { convertDocxToHtml } = await import('@office/docx-io');
  const worker = createWorker();
  if (!worker) return convertDocxToHtml(file);

  const id = nextRequestId;
  nextRequestId += 1;

  return new Promise<string>((resolve, reject) => {
    const bufferPromise = file.arrayBuffer();
    const cleanup = () => {
      worker.removeEventListener('message', onMessage);
      worker.removeEventListener('error', onError);
      void worker.terminate();
    };
    const onMessage = (event: MessageEvent<DocxConvertResponse>) => {
      if (event.data.id !== id) return;
      cleanup();
      if (event.data.error) reject(new Error(event.data.error));
      else resolve(event.data.html ?? '');
    };
    const onError = () => {
      cleanup();
      void bufferPromise
        .then((buffer) => convertDocxToHtml(buffer))
        .then(resolve, reject);
    };

    worker.addEventListener('message', onMessage);
    worker.addEventListener('error', onError);

    bufferPromise
      .then((buffer) => {
        const request: DocxConvertRequest = { id, buffer };
        worker.postMessage(request, [buffer]);
      })
      .catch(reject);
  });
};
