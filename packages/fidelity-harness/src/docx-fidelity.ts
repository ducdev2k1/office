import { convertDocxToText, exportDocx } from '@office/docx-io';
import { listParts, unpackOoxml } from '@office/ooxml-core';

export interface DocxFidelityReport {
  isSuccess: boolean;
  textFidelity: number;
  partCount: number;
  parts: string[];
}

export const measureDocxFidelity = async (
  html: string,
  expectedKeywords: string[],
): Promise<DocxFidelityReport> => {
  const docxBuffer = await exportDocx(html);
  const pkg = await unpackOoxml(docxBuffer);
  const parts = listParts(pkg);

  const extractedText = await convertDocxToText(docxBuffer);

  let matched = 0;
  for (const kw of expectedKeywords) {
    if (extractedText.includes(kw)) {
      matched++;
    }
  }

  const textFidelity = expectedKeywords.length > 0 ? (matched / expectedKeywords.length) * 100 : 100;

  return {
    isSuccess: textFidelity >= 90 && parts.includes('word/document.xml'),
    textFidelity,
    partCount: parts.length,
    parts,
  };
};
