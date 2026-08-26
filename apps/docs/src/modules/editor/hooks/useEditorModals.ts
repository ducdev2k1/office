import { useEffect, useRef, useState } from 'react';
import type { ContextMenuPosition } from '@/modules/editor/types/editor.types';

export type TextInputKind = 'link' | 'bookmark' | 'footnote';

export interface TextInputRequest {
  kind: TextInputKind;
  defaultValue: string;
}

export const useEditorModals = () => {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('docs-sidebar-open');
    return saved !== null ? saved === 'true' : true;
  });
  const [findOpen, setFindOpen] = useState(false);
  const [docSettingsOpen, setDocSettingsOpen] = useState(false);
  const [docSettingsTab, setDocSettingsTab] = useState<'document' | 'headerFooter'>('headerFooter');
  const [activeBand, setActiveBand] = useState<'header' | 'footer'>('header');
  const [helpOpen, setHelpOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuPosition | null>(null);
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [watermarkOpen, setWatermarkOpen] = useState(false);
  const [moveToFolderOpen, setMoveToFolderOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [mathEditorOpen, setMathEditorOpen] = useState(false);
  const [chartEditorOpen, setChartEditorOpen] = useState(false);
  const [editingChartAttrs, setEditingChartAttrs] = useState<any>(null);
  const [wordCountOpen, setWordCountOpen] = useState(false);
  const [vnAdminOpen, setVnAdminOpen] = useState(false);
  const [showFloatingWordCount, setShowFloatingWordCount] = useState(() => {
    const saved = localStorage.getItem('docs-floating-word-count');
    return saved === 'true';
  });
  const [textInput, setTextInput] = useState<TextInputRequest | null>(null);
  const textInputResolverRef = useRef<((value: string | null) => void) | null>(null);

  useEffect(
    () => () => {
      textInputResolverRef.current?.(null);
      textInputResolverRef.current = null;
    },
    [],
  );

  useEffect(() => {
    const handleOpenHf = (event: Event) => {
      const customEvent = event as CustomEvent<{ band?: 'header' | 'footer' }>;
      if (customEvent.detail?.band) {
        setActiveBand(customEvent.detail.band);
      }
      setDocSettingsTab('headerFooter');
      setDocSettingsOpen(true);
    };

    window.addEventListener('doc-open-hf-panel', handleOpenHf);
    return () => {
      window.removeEventListener('doc-open-hf-panel', handleOpenHf);
    };
  }, []);

  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => {
      const next = !prev;
      localStorage.setItem('docs-sidebar-open', String(next));
      return next;
    });
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
    localStorage.setItem('docs-sidebar-open', 'false');
  };

  const openPageSetup = () => {
    setDocSettingsTab('document');
    setDocSettingsOpen(true);
  };

  const openHeaderFooter = () => {
    setDocSettingsTab('headerFooter');
    setDocSettingsOpen(true);
  };

  const toggleFind = () => setFindOpen((prev) => !prev);
  const toggleComments = () => setCommentsOpen((prev) => !prev);

  const resolveTextInput = (value: string | null) => {
    textInputResolverRef.current?.(value);
    textInputResolverRef.current = null;
    setTextInput(null);
  };

  const requestTextInput = (
    kind: TextInputKind,
    defaultValue = '',
  ): Promise<string | null> => {
    textInputResolverRef.current?.(null);
    return new Promise<string | null>((resolve) => {
      textInputResolverRef.current = resolve;
      setTextInput({ kind, defaultValue });
    });
  };

  const toggleFloatingWordCount = (val: boolean) => {
    setShowFloatingWordCount(val);
    localStorage.setItem('docs-floating-word-count', String(val));
  };

  const closeAllModals = () => {
    setFindOpen(false);
    setDocSettingsOpen(false);
    setHelpOpen(false);
    setWatermarkOpen(false);
    setMoveToFolderOpen(false);
    setCommentsOpen(false);
    setMathEditorOpen(false);
    setChartEditorOpen(false);
    setWordCountOpen(false);
    setVnAdminOpen(false);
    resolveTextInput(null);
  };

  return {
    sidebarOpen,
    findOpen,
    docSettingsOpen,
    docSettingsTab,
    activeBand,
    helpOpen,
    contextMenu,
    versionHistoryOpen,
    shareOpen,
    watermarkOpen,
    moveToFolderOpen,
    commentsOpen,
    mathEditorOpen,
    chartEditorOpen,
    editingChartAttrs,
    wordCountOpen,
    vnAdminOpen,
    showFloatingWordCount,
    textInput,
    setFindOpen,
    setDocSettingsOpen,
    setDocSettingsTab,
    setActiveBand,
    setHelpOpen,
    setContextMenu,
    setVersionHistoryOpen,
    setShareOpen,
    setWatermarkOpen,
    setMoveToFolderOpen,
    setCommentsOpen,
    setMathEditorOpen,
    setChartEditorOpen,
    setEditingChartAttrs,
    setWordCountOpen,
    setVnAdminOpen,
    setShowFloatingWordCount,
    toggleFloatingWordCount,
    requestTextInput,
    resolveTextInput,
    handleToggleSidebar,
    handleCloseSidebar,
    openPageSetup,
    openHeaderFooter,
    toggleFind,
    toggleComments,
    closeAllModals,
  };
};
