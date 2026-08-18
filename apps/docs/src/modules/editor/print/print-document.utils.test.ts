import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DEFAULT_PAGE_SETUP, type PageSetup } from '@/types/docs.types';
import type { PageBreaks } from '@/modules/editor/utils/pagination.utils';
import {
  applyPrintPageRule,
  buildPrintRoot,
  PRINT_ROOT_ID,
  PRINT_STYLE_ID,
  teardownPrintRoot,
} from './print-document.utils';

class MockStyle {
  private props: Record<string, string> = {};
  top: string = '';

  setProperty(name: string, value: string) {
    this.props[name] = value;
  }

  getPropertyValue(name: string) {
    return this.props[name] || '';
  }
}

class MockElement {
  tagName: string;
  id: string = '';
  className: string = '';
  textContent: string = '';
  innerHTML: string = '';
  style: MockStyle = new MockStyle();
  children: MockElement[] = [];
  classList = {
    _classes: new Set<string>(),
    add: (c: string) => this.classList._classes.add(c),
    remove: (c: string) => this.classList._classes.delete(c),
    contains: (c: string) => this.classList._classes.has(c),
  };

  constructor(tagName: string) {
    this.tagName = tagName.toUpperCase();
  }

  appendChild(child: MockElement) {
    this.children.push(child);
    if (child.id) {
      elementsById.set(child.id, child);
    }
    return child;
  }

  replaceChildren(...items: MockElement[]) {
    this.children = items;
  }

  remove() {
    if (this.id) {
      elementsById.delete(this.id);
    }
    this.children = [];
  }

  removeAttribute(attr: string) {
    if (attr === 'id') {
      if (this.id) elementsById.delete(this.id);
      this.id = '';
    }
  }

  querySelectorAll(selector: string): MockElement[] {
    const results: MockElement[] = [];
    const match = (el: MockElement) => {
      if (selector === '.print-page' && el.className.includes('print-page')) results.push(el);
      if (selector === '.print-content' && el.className.includes('print-content')) results.push(el);
      for (const child of el.children) match(child);
    };
    for (const child of this.children) match(child);
    return results;
  }

  querySelector(selector: string): MockElement | null {
    const all = this.querySelectorAll(selector);
    return all[0] ?? null;
  }

  cloneNode(deep?: boolean): MockElement {
    const copy = new MockElement(this.tagName);
    copy.id = this.id;
    copy.className = this.className;
    copy.textContent = this.textContent;
    copy.innerHTML = this.innerHTML;
    copy.style = new MockStyle();
    if (deep) {
      copy.children = this.children.map((c) => c.cloneNode(true));
    }
    return copy;
  }
}

let mockBody: MockElement;
let mockHead: MockElement;
let elementsById: Map<string, MockElement>;
const originalDocument = (global as any).document;

describe('print-document.utils', () => {
  beforeEach(() => {
    mockBody = new MockElement('body');
    mockHead = new MockElement('head');
    elementsById = new Map();

    const rootEl = new MockElement('div');
    rootEl.id = 'root';
    const printRootEl = new MockElement('div');
    printRootEl.id = PRINT_ROOT_ID;

    elementsById.set('root', rootEl);
    elementsById.set(PRINT_ROOT_ID, printRootEl);

    (global as any).document = {
      body: mockBody,
      head: mockHead,
      getElementById: (id: string) => elementsById.get(id) ?? null,
      createElement: (tag: string) => new MockElement(tag),
      createDocumentFragment: () => new MockElement('fragment'),
    };
  });

  afterEach(() => {
    (global as any).document = originalDocument;
  });

  it('applies @page CSS rule for portrait and landscape', () => {
    const portraitSetup: PageSetup = {
      ...DEFAULT_PAGE_SETUP(),
      paperSize: 'a4',
      orientation: 'portrait',
    };
    applyPrintPageRule(portraitSetup);
    const styleEl = (global as any).document.getElementById(PRINT_STYLE_ID);
    expect(styleEl).not.toBeNull();
    expect(styleEl?.textContent).toContain('210mm 297mm');

    const landscapeSetup: PageSetup = {
      ...DEFAULT_PAGE_SETUP(),
      paperSize: 'a4',
      orientation: 'landscape',
    };
    applyPrintPageRule(landscapeSetup);
    expect(styleEl?.textContent).toContain('297mm 210mm');
  });

  it('teardownPrintRoot cleans up style tag, printRoot children and printing body class', () => {
    mockBody.classList.add('printing');
    applyPrintPageRule(DEFAULT_PAGE_SETUP());
    const printRoot = (global as any).document.getElementById(PRINT_ROOT_ID)!;
    printRoot.appendChild(new MockElement('div'));

    teardownPrintRoot();

    expect(mockBody.classList.contains('printing')).toBe(false);
    expect(printRoot.children.length).toBe(0);
    expect((global as any).document.getElementById(PRINT_STYLE_ID)).toBeNull();
  });

  it('buildPrintRoot constructs sliding window pages matching contentOffsets', () => {
    const editorDom = new MockElement('div');
    editorDom.className = 'doc-editor ProseMirror';
    const fakeView = { dom: editorDom } as any;

    const breaks: PageBreaks = {
      breaks: [100, 200],
      spacers: [0, 0],
      forced: [false, false],
      contentOffsets: [0, 1050, 2100],
    };

    const setup: PageSetup = {
      ...DEFAULT_PAGE_SETUP(),
      header: { left: 'Left Hdr', center: 'Doc', right: '{page}' },
      footer: { left: '', center: 'Footer', right: '{pages}' },
      pageNumber: {
        enabled: true,
        position: 'header',
        align: 'right',
        format: '{page}',
        startAt: 1,
        skipFirstPage: false,
      },
    };

    buildPrintRoot(fakeView, breaks, setup, 'Test Document');

    expect(mockBody.classList.contains('printing')).toBe(true);
    const printRoot = (global as any).document.getElementById(PRINT_ROOT_ID)!;
    const pages = printRoot.querySelectorAll('.print-page');
    expect(pages.length).toBe(3);

    const firstPageContent = pages[0]?.querySelector('.print-content');
    expect(firstPageContent?.style.top).toBe('-0px');

    const secondPageContent = pages[1]?.querySelector('.print-content');
    expect(secondPageContent?.style.top).toBe('-1050px');

    const thirdPageContent = pages[2]?.querySelector('.print-content');
    expect(thirdPageContent?.style.top).toBe('-2100px');
  });
});
