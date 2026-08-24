import { convertDocxToHtml } from '@office/docx-io';

export interface DocxConvertRequest {
  id: number;
  buffer: ArrayBuffer;
}

export interface DocxConvertResponse {
  id: number;
  html?: string;
  error?: string;
}

const ctx = self as unknown as {
  onmessage: ((event: MessageEvent<DocxConvertRequest>) => void) | null;
  postMessage: (message: DocxConvertResponse) => void;
};

ctx.onmessage = async (event: MessageEvent<DocxConvertRequest>) => {
  const { id, buffer } = event.data;
  try {
    const html = await convertDocxToHtml(buffer);
    ctx.postMessage({ id, html });
  } catch (error) {
    ctx.postMessage({
      id,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
