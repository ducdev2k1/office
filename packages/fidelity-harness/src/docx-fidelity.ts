import { exportDocx, convertDocxToText } from '@office/docx-io';
import { getPartText, listParts, unpackOoxml } from '@office/ooxml-core';

export interface FormatCheck {
  label: string;
  pattern: RegExp;
}

export interface FormatCheckResult {
  label: string;
  passed: boolean;
}

export interface DocxFidelityReport {
  isSuccess: boolean;
  textFidelity: number;
  formatFidelity: number;
  formatResults: FormatCheckResult[];
  partCount: number;
  parts: string[];
}

export const measureDocxFidelity = async (
  html: string,
  expectedKeywords: string[],
  formatChecks: FormatCheck[] = [],
): Promise<DocxFidelityReport> => {
  const docxBuffer = await exportDocx(html);
  const pkg = await unpackOoxml(docxBuffer);
  const parts = listParts(pkg);

  const documentXml = getPartText(pkg, 'word/document.xml') ?? '';

  const extractedText = await convertDocxToText(docxBuffer);

  let matched = 0;
  for (const kw of expectedKeywords) {
    if (extractedText.includes(kw)) {
      matched++;
    }
  }

  const textFidelity = expectedKeywords.length > 0 ? (matched / expectedKeywords.length) * 100 : 100;

  const formatResults: FormatCheckResult[] = formatChecks.map((check) => ({
    label: check.label,
    passed: check.pattern.test(documentXml),
  }));
  const passedFormats = formatResults.filter((r) => r.passed).length;
  const formatFidelity = formatChecks.length > 0 ? (passedFormats / formatChecks.length) * 100 : 100;

  return {
    isSuccess:
      textFidelity >= 90 &&
      formatFidelity >= 90 &&
      parts.includes('word/document.xml'),
    textFidelity,
    formatFidelity,
    formatResults,
    partCount: parts.length,
    parts,
  };
};

/** Bộ format check chuẩn cho các element class phổ biến của editor. */
export const standardFormatChecks = (): FormatCheck[] => [
  { label: 'heading', pattern: /w:pStyle w:val="Heading[1-6]"/ },
  { label: 'bold', pattern: /<w:b\/>/ },
  { label: 'italic', pattern: /<w:i\/>/ },
  { label: 'underline', pattern: /<w:u w:val="single"\/>/ },
  { label: 'strike', pattern: /<w:strike\/>/ },
  { label: 'text-color', pattern: /<w:color w:val="[0-9A-F]{6}"\/>/ },
  { label: 'highlight', pattern: /<w:shd [^>]*w:fill="(?!F1F5F9")[0-9A-F]{6}"/ },
  { label: 'alignment', pattern: /<w:jc w:val="(center|right|both)"\/>/ },
  { label: 'list', pattern: /<w:numPr>/ },
  { label: 'table', pattern: /<w:tbl>/ },
  { label: 'hyperlink', pattern: /<w:hyperlink [^>]*r:id=/ },
  { label: 'page-break', pattern: /<w:br w:type="page"\/>/ },
  { label: 'image', pattern: /<w:drawing>/ },
  { label: 'grid-span', pattern: /<w:gridSpan / },
];
