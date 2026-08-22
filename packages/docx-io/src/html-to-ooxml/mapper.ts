import type { DocxFootnoteItem, DocxMediaItem, DocxRelationship, OoxmlConversionResult } from '../types';
import { parseHtmlToTree, type HtmlNode } from './html-parser';
import { parseImageDataUrl } from './media.utils';
import {
  colorToHex,
  escapeXml,
  parseInlineStyles,
  ptToHalfPt,
  pxToEmu,
  pxToHalfPt,
} from './xml.utils';
import {
  renderCalloutXml,
  renderChartBlockXml,
  renderTableXml,
} from './block-renderer.utils';

interface InlineContext {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  subscript?: boolean;
  superscript?: boolean;
  code?: boolean;
  color?: string;
  backgroundColor?: string;
  fontFamily?: string;
  fontSizeHalfPt?: number;
}

export class OoxmlMapper {
  private relationships: DocxRelationship[] = [];
  private media: DocxMediaItem[] = [];
  private footnotes: DocxFootnoteItem[] = [];
  private nextRelId = 1;
  private nextMediaId = 1;
  private nextFootnoteId = 1;
  private nextBookmarkId = 1;

  public convert(html: string): OoxmlConversionResult {
    this.relationships = [];
    this.media = [];
    this.footnotes = [];
    this.nextRelId = 1;
    this.nextMediaId = 1;
    this.nextFootnoteId = 1;
    this.nextBookmarkId = 1;

    const tree = parseHtmlToTree(html);
    const bodyXml = this.renderNodes(tree, 0, null);

    return {
      bodyXml,
      relationships: this.relationships,
      media: this.media,
      footnotes: this.footnotes,
    };
  }

  private registerFootnote(content: string): number {
    const id = this.nextFootnoteId++;
    this.footnotes.push({ id, content });
    return id;
  }

  private registerHyperlink(url: string): string {
    const id = `rIdLink${this.nextRelId++}`;
    this.relationships.push({
      id,
      type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink',
      target: url,
      targetMode: 'External',
    });
    return id;
  }

  private registerImage(src: string, width = 400, height = 300): DocxMediaItem | null {
    const mediaItem = parseImageDataUrl(src, this.nextMediaId++, width, height);
    if (!mediaItem) return null;

    this.media.push(mediaItem);
    this.relationships.push({
      id: mediaItem.id,
      type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image',
      target: mediaItem.target,
    });
    return mediaItem;
  }

  private renderNodes(
    nodes: HtmlNode[],
    listDepth = 0,
    listType: 'bullet' | 'ordered' | 'task' | null = null,
  ): string {
    let xml = '';
    for (const node of nodes) {
      xml += this.renderBlockNode(node, listDepth, listType);
    }
    return xml;
  }

  private renderBlockNode(
    node: HtmlNode,
    listDepth = 0,
    listType: 'bullet' | 'ordered' | 'task' | null = null,
  ): string {
    if (node.type === 'text') {
      const trimmed = node.textContent.trim();
      if (!trimmed) return '';
      return `<w:p><w:r><w:t xml:space="preserve">${escapeXml(node.textContent)}</w:t></w:r></w:p>`;
    }

    const tag = node.tagName;
    const styles = parseInlineStyles(node.attributes.style ?? '');

    // Headings
    if (/^h[1-6]$/.test(tag)) {
      const level = tag[1];
      const jcXml = this.renderJc(styles['text-align']);
      return `<w:p><w:pPr><w:pStyle w:val="Heading${level}"/>${jcXml}</w:pPr>${this.renderInlines(node.children, {})}</w:p>`;
    }

    // Paragraph
    if (tag === 'p') {
      const jcXml = this.renderJc(styles['text-align']);
      const spacingXml = this.renderSpacing(styles['line-height']);
      
      const borderAttr = node.attributes['data-border'];
      const borderColor = colorToHex(node.attributes['data-border-color'] ?? '') ?? '94A3B8';
      const bgHex = colorToHex(node.attributes['data-bg-color'] ?? '') ?? colorToHex(styles['background-color'] ?? '');
      
      let pBdrXml = '';
      if (borderAttr) {
        if (borderAttr === 'left') {
          pBdrXml = `<w:pBdr><w:left w:val="single" w:sz="18" w:space="8" w:color="${borderColor}"/></w:pBdr>`;
        } else if (borderAttr === 'top') {
          pBdrXml = `<w:pBdr><w:top w:val="single" w:sz="12" w:space="4" w:color="${borderColor}"/></w:pBdr>`;
        } else if (borderAttr === 'bottom') {
          pBdrXml = `<w:pBdr><w:bottom w:val="single" w:sz="12" w:space="4" w:color="${borderColor}"/></w:pBdr>`;
        } else if (borderAttr === 'right') {
          pBdrXml = `<w:pBdr><w:right w:val="single" w:sz="18" w:space="8" w:color="${borderColor}"/></w:pBdr>`;
        } else if (borderAttr === 'box' || borderAttr === 'full') {
          pBdrXml = `<w:pBdr><w:top w:val="single" w:sz="8" w:space="4" w:color="${borderColor}"/><w:left w:val="single" w:sz="8" w:space="8" w:color="${borderColor}"/><w:bottom w:val="single" w:sz="8" w:space="4" w:color="${borderColor}"/><w:right w:val="single" w:sz="8" w:space="8" w:color="${borderColor}"/></w:pBdr>`;
        }
      }

      let shdXml = '';
      if (bgHex) {
        shdXml = `<w:shd w:val="clear" w:color="auto" w:fill="${bgHex}"/>`;
      }

      return `<w:p><w:pPr>${jcXml}${spacingXml}${pBdrXml}${shdXml}</w:pPr>${this.renderInlines(node.children, {})}</w:p>`;
    }

    // Callout box
    if (node.attributes['data-type'] === 'callout' || (node.attributes.class && node.attributes.class.includes('callout'))) {
      return renderCalloutXml(node, (child) => this.renderBlockNode(child, listDepth, listType));
    }

    // Chart Block
    if (node.attributes['data-type'] === 'chart-block') {
      return renderChartBlockXml(node);
    }

    // Blockquote
    if (tag === 'blockquote') {
      return `<w:p><w:pPr><w:pStyle w:val="Quote"/><w:ind w:left="720"/></w:pPr>${this.renderInlines(node.children, { italic: true })}</w:p>`;
    }

    // Code block
    if (tag === 'pre') {
      const codeChild = node.children.find((c) => c.tagName === 'code') ?? node;
      const codeText = codeChild.children
        .map((c) => (c.type === 'text' ? c.textContent : ''))
        .join('');
      const lines = codeText.split('\n');
      return lines
        .map(
          (line) =>
            `<w:p><w:pPr><w:shd w:val="clear" w:color="auto" w:fill="F1F5F9"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/><w:sz w:val="20"/></w:rPr><w:t xml:space="preserve">${escapeXml(line)}</w:t></w:r></w:p>`,
        )
        .join('');
    }

    // Horizontal rule
    if (tag === 'hr') {
      return `<w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="CBD5E1"/></w:pBdr></w:pPr></w:p>`;
    }

    // Page break
    if (node.attributes['data-type'] === 'page-break' || styles['page-break-before'] === 'always') {
      return `<w:p><w:r><w:br w:type="page"/></w:r></w:p>`;
    }

    // Section break: next-page -> page break, continuous -> skip
    if (node.attributes['data-type'] === 'section-break' || node.attributes['data-section-type']) {
      if ((node.attributes['data-section-type'] ?? 'next-page') === 'next-page') {
        return `<w:p><w:pPr><w:pStyle w:val="Normal"/></w:pPr><w:r><w:br w:type="page"/></w:r></w:p>`;
      }
      return '';
    }

    // Math block (KaTeX) — fallback text per plan acceptance level
    if (node.attributes['data-type'] === 'math-block') {
      const tex = node.attributes['data-tex'] ?? '';
      return `<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/><w:i/><w:color w:val="1E40AF"/></w:rPr><w:t xml:space="preserve">${escapeXml(tex)}</w:t></w:r></w:p>`;
    }

    // Lists
    if (tag === 'ul' || tag === 'ol') {
      const isTask = node.attributes['data-type'] === 'taskList';
      const currentListType = isTask ? 'task' : tag === 'ul' ? 'bullet' : 'ordered';
      let listXml = '';
      for (const child of node.children) {
        if (child.tagName === 'li') {
          listXml += this.renderListItem(child, listDepth, currentListType);
        }
      }
      return listXml;
    }

    // Table
    if (tag === 'table') {
      return renderTableXml(
        node,
        (nodes, ctx) => this.renderInlines(nodes, ctx),
        (nodes) => this.renderNodes(nodes, 0, null),
      );
    }

    // Generic div / container
    if (tag === 'div' || tag === 'section' || tag === 'article') {
      return this.renderNodes(node.children, listDepth, listType);
    }

    // Fallback: wrap standalone inlines in a paragraph
    const inlineContent = this.renderInlineNode(node, {});
    return inlineContent ? `<w:p>${inlineContent}</w:p>` : '';
  }

  private renderListItem(
    node: HtmlNode,
    depth: number,
    listType: 'bullet' | 'ordered' | 'task',
  ): string {
    const numId = listType === 'bullet' ? '1' : listType === 'ordered' ? '2' : '1';
    const isChecked = node.attributes['data-checked'] === 'true';
    const prefix = listType === 'task' ? (isChecked ? '☑ ' : '☐ ') : '';

    const directInlines: HtmlNode[] = [];
    const nestedLists: HtmlNode[] = [];

    for (const child of node.children) {
      if (child.tagName === 'ul' || child.tagName === 'ol') {
        nestedLists.push(child);
      } else if (child.tagName === 'p') {
        directInlines.push(...child.children);
      } else {
        directInlines.push(child);
      }
    }

    let result = `<w:p><w:pPr><w:pStyle w:val="ListParagraph"/><w:numPr><w:ilvl w:val="${depth}"/><w:numId w:val="${numId}"/></w:numPr></w:pPr>`;
    if (prefix) {
      result += `<w:r><w:t xml:space="preserve">${prefix}</w:t></w:r>`;
    }
    result += `${this.renderInlines(directInlines, {})}</w:p>`;

    for (const nested of nestedLists) {
      result += this.renderNodes([nested], depth + 1, listType);
    }

    return result;
  }

  private renderInlines(nodes: HtmlNode[], ctx: InlineContext): string {
    let xml = '';
    for (const node of nodes) {
      xml += this.renderInlineNode(node, ctx);
    }
    return xml;
  }

  private renderInlineNode(node: HtmlNode, ctx: InlineContext): string {
    if (node.type === 'text') {
      if (!node.textContent) return '';
      const rPr = this.renderRunProperties(ctx);
      return `<w:r>${rPr}<w:t xml:space="preserve">${escapeXml(node.textContent)}</w:t></w:r>`;
    }

    const tag = node.tagName;
    const styles = parseInlineStyles(node.attributes.style ?? '');

    const nextCtx: InlineContext = {
      ...ctx,
      bold: ctx.bold || tag === 'strong' || tag === 'b' || styles['font-weight'] === 'bold',
      italic: ctx.italic || tag === 'em' || tag === 'i' || styles['font-style'] === 'italic',
      underline:
        ctx.underline || tag === 'u' || (styles['text-decoration'] ?? '').includes('underline'),
      strike:
        ctx.strike ||
        tag === 's' ||
        tag === 'strike' ||
        tag === 'del' ||
        (styles['text-decoration'] ?? '').includes('line-through'),
      subscript: ctx.subscript || tag === 'sub',
      superscript: ctx.superscript || tag === 'sup',
      code: ctx.code || tag === 'code',
      color: styles.color ? colorToHex(styles.color) ?? ctx.color : ctx.color,
      backgroundColor:
        styles['background-color'] || tag === 'mark'
          ? colorToHex(styles['background-color'] ?? 'yellow') ?? ctx.backgroundColor
          : ctx.backgroundColor,
      fontFamily: styles['font-family'] ?? ctx.fontFamily,
      fontSizeHalfPt: styles['font-size']
        ? this.parseFontSize(styles['font-size']) ?? ctx.fontSizeHalfPt
        : ctx.fontSizeHalfPt,
    };

    // Link
    if (tag === 'a' && node.attributes.href) {
      const relId = this.registerHyperlink(node.attributes.href);
      return `<w:hyperlink r:id="${relId}"><w:r><w:rPr><w:rStyle w:val="Hyperlink"/><w:color w:val="0000FF"/><w:u w:val="single"/></w:rPr><w:t xml:space="preserve">${escapeXml(node.textContent || node.attributes.href)}</w:t></w:r></w:hyperlink>`;
    }

    // Image
    if (tag === 'img' && node.attributes.src) {
      const width = parseInt(node.attributes.width ?? '400', 10) || 400;
      const height = parseInt(node.attributes.height ?? '300', 10) || 300;
      const media = this.registerImage(node.attributes.src, width, height);
      if (media) {
        const cx = pxToEmu(media.widthPx);
        const cy = pxToEmu(media.heightPx);
        return `<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/><wp:docPr id="${this.nextMediaId}" name="Picture"/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="${this.nextMediaId}" name="Picture"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${media.id}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>`;
      }
    }

    // Footnote reference — real OOXML footnote (content stored in data attribute)
    if (node.attributes['data-type'] === 'footnote') {
      const content = node.attributes['data-footnote-content'] ?? '';
      if (!content) return '';
      const fnId = this.registerFootnote(content);
      return `<w:r><w:rPr><w:rStyle w:val="FootnoteReference"/><w:vertAlign w:val="superscript"/></w:rPr><w:footnoteReference w:id="${fnId}"/></w:r>`;
    }

    // Math inline (KaTeX) — fallback text per plan acceptance level
    if (node.attributes['data-type'] === 'math-inline') {
      const tex = node.attributes['data-tex'] ?? '';
      if (!tex) return '';
      return `<w:r><w:rPr><w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/><w:i/><w:color w:val="1E40AF"/></w:rPr><w:t xml:space="preserve">${escapeXml(tex)}</w:t></w:r>`;
    }

    // Bookmark anchor (no href)
    if ((node.attributes['data-bookmark-id'] || node.attributes.name) && !node.attributes.href) {
      const rawName = node.attributes['data-bookmark-name'] ?? node.attributes['data-bookmark-id'] ?? node.attributes.name ?? 'Bookmark';
      const safeName = escapeXml(rawName.replace(/\s+/g, '_').slice(0, 40) || 'Bookmark');
      const bmId = this.nextBookmarkId++;
      const inner = this.renderInlines(node.children, ctx);
      return `<w:bookmarkStart w:id="${bmId}" w:name="${safeName}"/>${inner}<w:bookmarkEnd w:id="${bmId}"/>`;
    }

    // Line break
    if (tag === 'br') {
      return '<w:r><w:br/></w:r>';
    }

    return this.renderInlines(node.children, nextCtx);
  }

  private renderRunProperties(ctx: InlineContext): string {
    let rPr = '';
    if (ctx.bold) rPr += '<w:b/>';
    if (ctx.italic) rPr += '<w:i/>';
    if (ctx.underline) rPr += '<w:u w:val="single"/>';
    if (ctx.strike) rPr += '<w:strike/>';
    if (ctx.subscript) rPr += '<w:vertAlign w:val="subscript"/>';
    if (ctx.superscript) rPr += '<w:vertAlign w:val="superscript"/>';
    if (ctx.color) rPr += `<w:color w:val="${ctx.color}"/>`;
    if (ctx.backgroundColor) rPr += `<w:shd w:val="clear" w:color="auto" w:fill="${ctx.backgroundColor}"/>`;
    if (ctx.fontSizeHalfPt) rPr += `<w:sz w:val="${ctx.fontSizeHalfPt}"/>`;
    if (ctx.code) {
      rPr += '<w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/><w:shd w:val="clear" w:color="auto" w:fill="F1F5F9"/>';
    } else if (ctx.fontFamily) {
      rPr += `<w:rFonts w:ascii="${escapeXml(ctx.fontFamily)}" w:hAnsi="${escapeXml(ctx.fontFamily)}"/>`;
    }
    return rPr ? `<w:rPr>${rPr}</w:rPr>` : '';
  }

  private renderJc(align?: string): string {
    if (!align) return '';
    const clean = align.trim().toLowerCase();
    if (clean === 'center') return '<w:jc w:val="center"/>';
    if (clean === 'right') return '<w:jc w:val="right"/>';
    if (clean === 'justify') return '<w:jc w:val="both"/>';
    return '<w:jc w:val="left"/>';
  }

  private renderSpacing(lineHeight?: string): string {
    if (!lineHeight) return '';
    const num = parseFloat(lineHeight);
    if (!isNaN(num) && num > 0) {
      const line = Math.round(num * 240);
      return `<w:spacing w:line="${line}" w:lineRule="auto"/>`;
    }
    return '';
  }

  private parseFontSize(sizeStr: string): number | null {
    if (sizeStr.endsWith('pt')) {
      const val = parseFloat(sizeStr);
      return isNaN(val) ? null : ptToHalfPt(val);
    }
    if (sizeStr.endsWith('px')) {
      const val = parseFloat(sizeStr);
      return isNaN(val) ? null : pxToHalfPt(val);
    }
    return null;
  }
}
