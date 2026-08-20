export interface HtmlNode {
  type: 'element' | 'text';
  tagName: string;
  attributes: Record<string, string>;
  textContent: string;
  children: HtmlNode[];
}

const parseAttributes = (rawAttrs: string): Record<string, string> => {
  const attrs: Record<string, string> = {};
  const attrRegex = /([a-zA-Z0-9_:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  let match: RegExpExecArray | null;

  while ((match = attrRegex.exec(rawAttrs)) !== null) {
    const key = match[1]?.toLowerCase();
    const val = match[2] ?? match[3] ?? match[4] ?? '';
    if (key) {
      attrs[key] = val;
    }
  }
  return attrs;
};

export const parseHtmlToTree = (html: string): HtmlNode[] => {
  if (typeof DOMParser !== 'undefined') {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(`<body>${html}</body>`, 'text/html');
      const convertDom = (node: Node): HtmlNode | null => {
        if (node.nodeType === 3 /* TEXT_NODE */) {
          const text = node.textContent ?? '';
          return {
            type: 'text',
            tagName: '',
            attributes: {},
            textContent: text,
            children: [],
          };
        }
        if (node.nodeType === 1 /* ELEMENT_NODE */) {
          const el = node as HTMLElement;
          const attrs: Record<string, string> = {};
          for (let i = 0; i < el.attributes.length; i++) {
            const attr = el.attributes[i];
            if (attr) {
              attrs[attr.name.toLowerCase()] = attr.value;
            }
          }
          const children: HtmlNode[] = [];
          for (let i = 0; i < el.childNodes.length; i++) {
            const childNode = el.childNodes[i];
            if (childNode) {
              const converted = convertDom(childNode);
              if (converted) children.push(converted);
            }
          }
          return {
            type: 'element',
            tagName: el.tagName.toLowerCase(),
            attributes: attrs,
            textContent: el.textContent ?? '',
            children,
          };
        }
        return null;
      };

      const rootChildren: HtmlNode[] = [];
      const bodyChildren = doc.body.childNodes;
      for (let i = 0; i < bodyChildren.length; i++) {
        const item = bodyChildren[i];
        if (item) {
          const converted = convertDom(item);
          if (converted) rootChildren.push(converted);
        }
      }
      return rootChildren;
    } catch {
      // Fall back to tokenizer
    }
  }

  // Fallback tokenizer for Node.js / non-DOM environments
  const root: HtmlNode = {
    type: 'element',
    tagName: 'root',
    attributes: {},
    textContent: '',
    children: [],
  };

  const stack: HtmlNode[] = [root];
  const tagRegex = /<\/?([a-zA-Z0-9:-]+)([^>]*)>|([^<]+)/g;
  let match: RegExpExecArray | null;

  const voidTags = new Set(['img', 'br', 'hr', 'input', 'meta', 'link']);

  while ((match = tagRegex.exec(html)) !== null) {
    const fullMatch = match[0];
    const tagName = match[1]?.toLowerCase();
    const rawAttrs = match[2] ?? '';
    const text = match[3];

    const currentParent = stack[stack.length - 1];
    if (!currentParent) break;

    if (text) {
      currentParent.children.push({
        type: 'text',
        tagName: '',
        attributes: {},
        textContent: text,
        children: [],
      });
    } else if (tagName) {
      const isClosing = fullMatch.startsWith('</');
      const isSelfClosing = fullMatch.endsWith('/>') || voidTags.has(tagName);

      if (isClosing) {
        // Pop until matching tag
        for (let i = stack.length - 1; i > 0; i--) {
          const node = stack[i];
          if (node && node.tagName === tagName) {
            stack.splice(i);
            break;
          }
        }
      } else {
        const newNode: HtmlNode = {
          type: 'element',
          tagName,
          attributes: parseAttributes(rawAttrs),
          textContent: '',
          children: [],
        };
        currentParent.children.push(newNode);

        if (!isSelfClosing) {
          stack.push(newNode);
        }
      }
    }
  }

  return root.children;
};
