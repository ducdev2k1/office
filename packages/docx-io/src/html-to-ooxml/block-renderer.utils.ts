import type { HtmlNode } from './html-parser';
import { colorToHex, escapeXml, parseInlineStyles } from './xml.utils';

export const renderCalloutXml = (
  node: HtmlNode,
  renderBlockFn: (node: HtmlNode) => string,
): string => {
  const calloutType = node.attributes['data-callout-type'] ?? 'info';
  const colorMap: Record<string, { border: string; fill: string; label: string }> = {
    info: { border: '3B82F6', fill: 'EFF6FF', label: 'ℹ️ THÔNG TIN' },
    tip: { border: '10B981', fill: 'ECFDF5', label: '💡 MẸO HAY' },
    warning: { border: 'F59E0B', fill: 'FFFBEB', label: '⚠️ CHÚ Ý' },
    danger: { border: 'EF4444', fill: 'FFF1F2', label: '🚨 CẢNH BÁO' },
  };
  const cfg = colorMap[calloutType] ?? colorMap.info!;

  const headerXml = `<w:p><w:pPr><w:pBdr><w:left w:val="single" w:sz="24" w:space="12" w:color="${cfg.border}"/></w:pBdr><w:shd w:val="clear" w:color="auto" w:fill="${cfg.fill}"/><w:ind w:left="240" w:right="240"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="20"/><w:color w:val="${cfg.border}"/></w:rPr><w:t xml:space="preserve">${cfg.label}</w:t></w:r></w:p>`;

  const bodyXml = node.children
    .map((child) => {
      const content = renderBlockFn(child);
      return content.replace(
        '<w:pPr>',
        `<w:pPr><w:pBdr><w:left w:val="single" w:sz="24" w:space="12" w:color="${cfg.border}"/></w:pBdr><w:shd w:val="clear" w:color="auto" w:fill="${cfg.fill}"/><w:ind w:left="240" w:right="240"/>`,
      );
    })
    .join('');

  return headerXml + (bodyXml || '');
};

export const renderChartBlockXml = (node: HtmlNode): string => {
  const title = node.attributes['data-chart-title'] || 'Biểu đồ số liệu';
  let categories: string[] = [];
  let series: Array<{ name: string; data: number[] }> = [];
  try {
    categories = JSON.parse(node.attributes['data-chart-categories'] || '[]');
    series = JSON.parse(node.attributes['data-chart-series'] || '[]');
  } catch {
    categories = [];
    series = [];
  }

  let chartXml = `<w:p><w:pPr><w:pStyle w:val="Heading3"/><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:color w:val="1E3A8A"/></w:rPr><w:t>📊 ${escapeXml(title)}</w:t></w:r></w:p>`;

  if (categories.length > 0 && series.length > 0) {
    chartXml +=
      '<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/><w:tblBorders><w:top w:val="single" w:sz="6" w:space="0" w:color="3B82F6"/><w:bottom w:val="single" w:sz="6" w:space="0" w:color="3B82F6"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/><w:insideV w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/></w:tblBorders></w:tblPr>';
    chartXml +=
      '<w:tr><w:tc><w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="DBEAFE"/></w:tcPr><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Danh mục</w:t></w:r></w:p></w:tc>';
    for (const s of series) {
      chartXml += `<w:tc><w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="DBEAFE"/></w:tcPr><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>${escapeXml(s.name)}</w:t></w:r></w:p></w:tc>`;
    }
    chartXml += '</w:tr>';
    for (let i = 0; i < categories.length; i++) {
      chartXml += `<w:tr><w:tc><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>${escapeXml(categories[i] ?? '')}</w:t></w:r></w:p></w:tc>`;
      for (const s of series) {
        chartXml += `<w:tc><w:p><w:r><w:t>${escapeXml(String(s.data[i] ?? 0))}</w:t></w:r></w:p></w:tc>`;
      }
      chartXml += '</w:tr>';
    }
    chartXml += '</w:tbl>';
  }

  return chartXml;
};

export const renderTableXml = (
  tableNode: HtmlNode,
  renderInlinesFn: (nodes: HtmlNode[], ctx: any) => string,
  renderNodesFn: (nodes: HtmlNode[]) => string,
): string => {
  const rows: HtmlNode[] = [];
  for (const child of tableNode.children) {
    if (child.tagName === 'tr') {
      rows.push(child);
    } else if (child.tagName === 'tbody' || child.tagName === 'thead') {
      rows.push(...child.children.filter((c) => c.tagName === 'tr'));
    }
  }

  let tblXml = '<w:tbl>';
  tblXml +=
    '<w:tblPr><w:tblW w:w="5000" w:type="pct"/><w:tblBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/><w:left w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/><w:right w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/><w:insideV w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/></w:tblBorders></w:tblPr>';

  for (const row of rows) {
    tblXml += '<w:tr>';
    for (const cell of row.children) {
      if (cell.tagName === 'td' || cell.tagName === 'th') {
        const isHeader = cell.tagName === 'th';
        const styles = parseInlineStyles(cell.attributes.style ?? '');
        const colSpan = parseInt(cell.attributes.colspan ?? '1', 10);
        const bgHex =
          colorToHex(styles['background-color'] ?? '') ?? (isHeader ? 'F1F5F9' : null);

        let tcPr = '<w:tcPr>';
        if (colSpan > 1) {
          tcPr += `<w:gridSpan w:val="${colSpan}"/>`;
        }
        if (bgHex) {
          tcPr += `<w:shd w:val="clear" w:color="auto" w:fill="${bgHex}"/>`;
        }
        tcPr += '</w:tcPr>';

        const cellContent =
          cell.children.length === 0
            ? '<w:p/>'
            : cell.children.some((c) => c.tagName === 'p')
              ? renderNodesFn(cell.children)
              : `<w:p>${renderInlinesFn(cell.children, { bold: isHeader })}</w:p>`;

        tblXml += `<w:tc>${tcPr}${cellContent}</w:tc>`;
      }
    }
    tblXml += '</w:tr>';
  }
  tblXml += '</w:tbl>';
  return tblXml;
};
