import { useEffect, useCallback } from 'react';
import type { Editor } from '@tiptap/core';
import { MAX_PAGES } from '@/modules/editor/utils/pagination.utils';
import { DEFAULT_PAGE_SETUP, type DocRecord } from '@/types/docs.types';
import type { PaginationState } from '@/modules/editor/hooks/usePagination';
import {
  applyPrintPageRule,
  buildPrintRoot,
  teardownPrintRoot,
} from '@/modules/editor/print/print-document.utils';

export interface UsePrintDocumentReturn {
  printDocument: () => Promise<void>;
}

export const usePrintDocument = (
  editor: Editor | null,
  activeDoc: DocRecord | undefined,
  pagination: PaginationState,
): UsePrintDocumentReturn => {
  const buildOrBail = useCallback((): boolean => {
    if (!editor || editor.isDestroyed || !editor.view) {
      applyPrintPageRule(activeDoc?.pageSetup ?? DEFAULT_PAGE_SETUP());
      return false;
    }
    if (pagination.viewMode !== 'paged') {
      applyPrintPageRule(activeDoc?.pageSetup ?? DEFAULT_PAGE_SETUP());
      return false;
    }
    if (editor.view.composing) {
      applyPrintPageRule(activeDoc?.pageSetup ?? DEFAULT_PAGE_SETUP());
      return false;
    }
    const breaks = pagination.schedulePagination(true);
    if (!breaks || breaks.contentOffsets.length >= MAX_PAGES) {
      applyPrintPageRule(activeDoc?.pageSetup ?? DEFAULT_PAGE_SETUP());
      return false;
    }
    try {
      const setup = activeDoc?.pageSetup ?? DEFAULT_PAGE_SETUP();
      buildPrintRoot(editor.view, breaks, setup, activeDoc?.title ?? '');
      return true;
    } catch {
      teardownPrintRoot();
      applyPrintPageRule(activeDoc?.pageSetup ?? DEFAULT_PAGE_SETUP());
      return false;
    }
  }, [editor, activeDoc, pagination]);

  useEffect(() => {
    const onBeforePrint = () => {
      buildOrBail();
    };

    const onAfterPrint = () => {
      teardownPrintRoot();
    };

    window.addEventListener('beforeprint', onBeforePrint);
    window.addEventListener('afterprint', onAfterPrint);

    return () => {
      window.removeEventListener('beforeprint', onBeforePrint);
      window.removeEventListener('afterprint', onAfterPrint);
      teardownPrintRoot();
    };
  }, [buildOrBail]);

  const printDocument = useCallback(async () => {
    if (document.fonts?.ready) {
      try {
        await document.fonts.ready;
      } catch {
        /* proceed anyway */
      }
    }
    buildOrBail();
    window.print();
  }, [buildOrBail]);

  return { printDocument };
};
