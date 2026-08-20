import { parseHtmlToTree, type HtmlNode } from './html-to-ooxml/html-parser';

export const exportMarkdown = (html: string): string => {
  const tree = parseHtmlToTree(html);
  return renderNodesToMarkdown(tree, 0, null).trim();
};

const INLINE_TAGS = new Set([
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'strike',
  'del',
  'code',
  'a',
  'img',
  'span',
  'mark',
  'sub',
  'sup',
  'br',
]);

const renderNodesToMarkdown = (
  nodes: HtmlNode[],
  depth = 0,
  listType: 'bullet' | 'ordered' | 'task' | null = null,
): string => {
  let output = '';
  let orderIndex = 1;

  for (const node of nodes) {
    if (node.type === 'text') {
      const trimmed = node.textContent.trim();
      if (trimmed) {
        output += `\n\n${node.textContent.trim()}\n\n`;
      }
      continue;
    }

    const tag = node.tagName;

    // Headings
    if (/^h[1-6]$/.test(tag)) {
      const level = parseInt(tag[1] ?? '1', 10);
      const prefix = '#'.repeat(level);
      const content = renderInlinesToMarkdown(node.children).trim();
      output += `\n\n${prefix} ${content}\n\n`;
      continue;
    }

    // Paragraph
    if (tag === 'p') {
      const content = renderInlinesToMarkdown(node.children).trim();
      if (content) {
        output += `\n\n${content}\n\n`;
      }
      continue;
    }

    // Blockquote
    if (tag === 'blockquote') {
      const content = renderNodesToMarkdown(node.children, depth, null).trim();
      const lines = content.split('\n').map((l) => `> ${l}`).join('\n');
      output += `\n\n${lines}\n\n`;
      continue;
    }

    // Code block
    if (tag === 'pre') {
      const codeChild = node.children.find((c) => c.tagName === 'code') ?? node;
      const lang = (
        node.attributes['data-language'] ||
        codeChild.attributes['data-language'] ||
        ''
      ).toLowerCase();
      const codeText = codeChild.children
        .map((c) => (c.type === 'text' ? c.textContent : ''))
        .join('');
      output += `\n\n\`\`\`${lang}\n${codeText.replace(/\n+$/, '')}\n\`\`\`\n\n`;
      continue;
    }

    // Horizontal rule
    if (tag === 'hr') {
      output += '\n\n---\n\n';
      continue;
    }

    // Lists
    if (tag === 'ul' || tag === 'ol') {
      const isTask = node.attributes['data-type'] === 'taskList';
      const curType = isTask ? 'task' : tag === 'ul' ? 'bullet' : 'ordered';
      output += `\n${renderNodesToMarkdown(node.children, depth, curType)}\n`;
      continue;
    }

    if (tag === 'li') {
      const indent = '  '.repeat(depth);
      let prefix = `${indent}- `;
      if (listType === 'ordered') {
        prefix = `${indent}${orderIndex++}. `;
      } else if (listType === 'task') {
        const checked = node.attributes['data-checked'] === 'true';
        prefix = `${indent}- [${checked ? 'x' : ' '}] `;
      }

      const directChildren: HtmlNode[] = [];
      const nestedLists: HtmlNode[] = [];

      for (const child of node.children) {
        if (child.tagName === 'ul' || child.tagName === 'ol') {
          nestedLists.push(child);
        } else {
          directChildren.push(child);
        }
      }

      const itemText = renderInlinesToMarkdown(directChildren).trim();
      output += `${prefix}${itemText}\n`;

      if (nestedLists.length > 0) {
        output += renderNodesToMarkdown(nestedLists, depth + 1, listType);
      }
      continue;
    }

    // Tables
    if (tag === 'table') {
      output += `\n\n${renderTableToMarkdown(node)}\n\n`;
      continue;
    }

    // Top-level inline elements (like standalone <a>, <img>, <strong>)
    if (INLINE_TAGS.has(tag)) {
      const inlineText = renderInlinesToMarkdown([node]).trim();
      if (inlineText) {
        output += `\n\n${inlineText}\n\n`;
      }
      continue;
    }

    // Generic containers
    output += renderNodesToMarkdown(node.children, depth, listType);
  }

  return output.replace(/\n{3,}/g, '\n\n');
};

const renderInlinesToMarkdown = (nodes: HtmlNode[]): string => {
  let output = '';
  for (const node of nodes) {
    if (node.type === 'text') {
      output += node.textContent;
      continue;
    }

    const tag = node.tagName;
    const inner = renderInlinesToMarkdown(node.children);

    if (tag === 'strong' || tag === 'b') {
      output += `**${inner}**`;
    } else if (tag === 'em' || tag === 'i') {
      output += `*${inner}*`;
    } else if (tag === 's' || tag === 'strike' || tag === 'del') {
      output += `~~${inner}~~`;
    } else if (tag === 'code') {
      output += `\`${inner}\``;
    } else if (tag === 'a') {
      const href = node.attributes.href ?? '';
      output += `[${inner || href}](${href})`;
    } else if (tag === 'img') {
      const src = node.attributes.src ?? '';
      const alt = node.attributes.alt ?? 'image';
      output += `![${alt}](${src})`;
    } else if (tag === 'br') {
      output += '\n';
    } else {
      output += inner;
    }
  }
  return output;
};

const renderTableToMarkdown = (tableNode: HtmlNode): string => {
  const rows: HtmlNode[] = [];
  for (const child of tableNode.children) {
    if (child.tagName === 'tr') {
      rows.push(child);
    } else if (child.tagName === 'thead' || child.tagName === 'tbody') {
      rows.push(...child.children.filter((c) => c.tagName === 'tr'));
    }
  }

  if (rows.length === 0) return '';

  const tableData: string[][] = [];
  for (const row of rows) {
    const rowData: string[] = [];
    for (const cell of row.children) {
      if (cell.tagName === 'td' || cell.tagName === 'th') {
        const text = renderInlinesToMarkdown(cell.children).trim().replace(/\|/g, '\\|');
        rowData.push(text);
      }
    }
    if (rowData.length > 0) {
      tableData.push(rowData);
    }
  }

  if (tableData.length === 0) return '';

  const colCount = Math.max(...tableData.map((r) => r.length));
  const normalizedRows = tableData.map((row) => {
    while (row.length < colCount) {
      row.push('');
    }
    return row;
  });

  const headerRow = normalizedRows[0] ?? [];
  const bodyRows = normalizedRows.slice(1);

  let md = `| ${headerRow.join(' | ')} |\n`;
  md += `| ${headerRow.map(() => '---').join(' | ')} |\n`;

  for (const row of bodyRows) {
    md += `| ${row.join(' | ')} |\n`;
  }

  return md.trim();
};
